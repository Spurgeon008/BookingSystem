from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import logging

from app.db.session import get_db
from app.models.booking import Booking
from app.models.booked_seat import BookedSeat
from app.models.event import Event
from app.models.user import User
from app.models.notification import Notification
from app.schemas.booking import BookingCreate, BookingResponse
from app.core.security import get_current_user
from app.services.redis_client import redis_client
from app.workers.tasks import send_booking_confirmation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bookings", tags=["Bookings"])

SEAT_LOCK_EXPIRY = 300  # 5 minutes
SEAT_LOCK_PREFIX = "seat_lock"


def _seat_lock_key(event_id: int, seat_label: str) -> str:
    return f"{SEAT_LOCK_PREFIX}:{event_id}:{seat_label}"


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def book_tickets(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.id == booking_data.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    num_seats = len(booking_data.seats)
    if event.available_seats < num_seats:
        raise HTTPException(status_code=400, detail="Not enough seats available")

    # Validate seat labels
    for seat in booking_data.seats:
        if len(seat) < 2:
            raise HTTPException(status_code=400, detail=f"Invalid seat label: {seat}")
        row_letter = seat[0].upper()
        try:
            seat_num = int(seat[1:])
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid seat label: {seat}")
        row_idx = ord(row_letter) - 65
        if row_idx < 0 or row_idx >= event.rows:
            raise HTTPException(status_code=400, detail=f"Invalid row in seat: {seat}")
        if seat_num < 1 or seat_num > event.seats_per_row:
            raise HTTPException(status_code=400, detail=f"Invalid seat number: {seat}")

    # Lock all seats via Redis
    locked_keys = []
    try:
        # Pre-check which seats are already booked in DB
        already_booked = (
            db.query(BookedSeat.seat_label)
            .filter(
                BookedSeat.event_id == booking_data.event_id,
                BookedSeat.seat_label.in_([s.upper() for s in booking_data.seats]),
            )
            .all()
        )
        if already_booked:
            taken = [b[0] for b in already_booked]
            raise HTTPException(
                status_code=400,
                detail=f"Seat(s) already booked: {', '.join(sorted(taken))}. Please select different seats.",
            )

        for seat in booking_data.seats:
            lock_key = _seat_lock_key(event.id, seat.upper())
            acquired = redis_client.set(lock_key, str(current_user.id), nx=True, ex=SEAT_LOCK_EXPIRY)
            if not acquired:
                # Check if locked by same user (allow re-lock)
                owner = redis_client.get(lock_key)
                if owner != str(current_user.id):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Seat {seat.upper()} is temporarily locked by another user. Please select a different seat.",
                    )
            locked_keys.append(lock_key)

        # Create booking
        seats_str = ",".join(s.upper() for s in booking_data.seats)
        total_price = num_seats * event.price

        new_booking = Booking(
            user_id=current_user.id,
            event_id=event.id,
            seats=seats_str,
            num_seats=num_seats,
            total_price=total_price,
            status="confirmed",
        )

        try:
            db.add(new_booking)
            db.flush()  # get booking id

            for seat in booking_data.seats:
                booked_seat = BookedSeat(
                    booking_id=new_booking.id,
                    event_id=event.id,
                    seat_label=seat.upper(),
                )
                db.add(booked_seat)

            event.available_seats -= num_seats
            db.commit()
            db.refresh(new_booking)

        except IntegrityError:
            db.rollback()
            # Find which seats were taken in the race condition
            conflicting = (
                db.query(BookedSeat.seat_label)
                .filter(
                    BookedSeat.event_id == event.id,
                    BookedSeat.seat_label.in_([s.upper() for s in booking_data.seats]),
                )
                .all()
            )
            taken = [c[0] for c in conflicting]
            raise HTTPException(
                status_code=400,
                detail=f"Seat(s) already booked: {', '.join(sorted(taken))}. Please select different seats.",
            )

    except HTTPException:
        for key in locked_keys:
            redis_client.delete(key)
        raise

    # Release locks after successful booking
    for key in locked_keys:
        redis_client.delete(key)

    # Create notification
    notification = Notification(
        user_id=current_user.id,
        title="Booking Confirmed",
        message=f"Your booking for '{event.title}' (Seats: {seats_str}) has been confirmed! Total: Rs.{total_price:.0f}",
    )
    db.add(notification)
    db.commit()

    # Send booking confirmation email via Celery background task
    event_date_str = event.event_date.strftime("%d %b %Y, %I:%M %p") if event.event_date else "N/A"
    send_booking_confirmation.delay(
        booking_id=new_booking.id,
        user_email=current_user.email,
        event_title=event.title,
        venue=event.venue,
        event_date_str=event_date_str,
        seats=seats_str,
        num_seats=num_seats,
        total_price=total_price,
    )

    response = BookingResponse.model_validate(new_booking)
    response.event_title = event.title
    response.event_date = event.event_date
    response.venue = event.venue
    response.created_at = new_booking.booking_time
    return response


@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.booking_time.desc())
        .all()
    )
    result = []
    for b in bookings:
        event = db.query(Event).filter(Event.id == b.event_id).first()
        data = BookingResponse.model_validate(b)
        data.created_at = b.booking_time
        if event:
            data.event_title = event.title
            data.event_date = event.event_date
            data.venue = event.venue
        result.append(data)
    return result
