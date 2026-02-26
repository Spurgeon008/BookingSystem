from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.db.session import get_db
from app.models.event import Event
from app.models.booking import Booking
from app.models.booked_seat import BookedSeat
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.booking import BookingResponse
from app.core.security import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    total_seats = event_data.rows * event_data.seats_per_row
    new_event = Event(
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        venue=event_data.venue,
        price=event_data.price,
        poster_url=event_data.poster_url,
        rows=event_data.rows,
        seats_per_row=event_data.seats_per_row,
        total_seats=total_seats,
        available_seats=total_seats,
        event_date=event_data.event_date,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event


@router.put("/events/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}", status_code=status.HTTP_200_OK)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}


@router.get("/bookings", response_model=List[BookingResponse])
def list_all_bookings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    bookings = db.query(Booking).order_by(Booking.booking_time.desc()).all()
    result = []
    for b in bookings:
        event = db.query(Event).filter(Event.id == b.event_id).first()
        user = db.query(User).filter(User.id == b.user_id).first()
        data = BookingResponse.model_validate(b)
        data.created_at = b.booking_time
        if event:
            data.event_title = event.title
            data.event_date = event.event_date
            data.venue = event.venue
        if user:
            data.user_email = user.email
        result.append(data)
    return result


@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    total_events = db.query(func.count(Event.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_revenue = db.query(func.sum(Booking.total_price)).scalar() or 0.0
    total_seats_booked = db.query(func.sum(Booking.num_seats)).scalar() or 0

    return {
        "total_bookings": total_bookings,
        "total_events": total_events,
        "total_users": total_users,
        "total_revenue": float(total_revenue),
        "total_seats_sold": int(total_seats_booked),
    }
