from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.db.session import get_db
from app.models.booking import Booking
from app.models.event import Event
from app.models.user import User
from app.schemas.report import BookingSummary, EventBookingReport, UserBookingHistory
from app.core.security import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary", response_model=BookingSummary)
def get_booking_summary(db: Session = Depends(get_db)):
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    total_events = db.query(func.count(Event.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_seats_booked = db.query(func.sum(Booking.num_seats)).scalar() or 0
    total_revenue = db.query(func.sum(Booking.total_price)).scalar() or 0.0

    return BookingSummary(
        total_bookings=total_bookings,
        total_events=total_events,
        total_users=total_users,
        total_seats_booked=int(total_seats_booked),
        total_revenue=float(total_revenue),
    )


@router.get("/event-wise", response_model=List[EventBookingReport])
def get_event_wise_bookings(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    result = []
    for event in events:
        booking_count = (
            db.query(func.count(Booking.id))
            .filter(Booking.event_id == event.id)
            .scalar() or 0
        )
        seats_booked = event.total_seats - event.available_seats
        revenue = (
            db.query(func.sum(Booking.total_price))
            .filter(Booking.event_id == event.id)
            .scalar() or 0.0
        )
        result.append(EventBookingReport(
            event_id=event.id,
            event_title=event.title,
            event_date=event.event_date,
            category=event.category,
            venue=event.venue,
            total_seats=event.total_seats,
            available_seats=event.available_seats,
            seats_booked=seats_booked,
            booking_count=booking_count,
            revenue=float(revenue),
        ))
    return result


@router.get("/my-history", response_model=List[UserBookingHistory])
def get_user_booking_history(
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
        result.append(UserBookingHistory(
            booking_id=b.id,
            event_id=b.event_id,
            event_title=event.title if event else "Unknown Event",
            event_date=event.event_date if event else None,
            venue=event.venue if event else None,
            seats=b.seats,
            num_seats=b.num_seats,
            total_price=b.total_price,
            status=b.status,
            booking_time=b.booking_time,
        ))
    return result
