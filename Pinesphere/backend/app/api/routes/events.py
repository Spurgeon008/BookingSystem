from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.event import Event
from app.models.booked_seat import BookedSeat
from app.schemas.event import EventResponse, SeatMapResponse
from app.services.redis_client import redis_client

router = APIRouter(prefix="/events", tags=["Events"])

SEAT_LOCK_PREFIX = "seat_lock"


@router.get("/", response_model=List[EventResponse])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_date).all()


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/{event_id}/seats", response_model=SeatMapResponse)
def get_seat_map(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    booked = (
        db.query(BookedSeat.seat_label)
        .filter(BookedSeat.event_id == event_id)
        .all()
    )
    booked_seats = [b[0] for b in booked]

    locked_seats = []
    for row_idx in range(event.rows):
        row_letter = chr(65 + row_idx)
        for seat_num in range(1, event.seats_per_row + 1):
            seat_label = f"{row_letter}{seat_num}"
            lock_key = f"{SEAT_LOCK_PREFIX}:{event_id}:{seat_label}"
            if redis_client.exists(lock_key) and seat_label not in booked_seats:
                locked_seats.append(seat_label)

    return SeatMapResponse(
        event_id=event_id,
        rows=event.rows,
        seats_per_row=event.seats_per_row,
        price=event.price,
        booked_seats=booked_seats,
        locked_seats=locked_seats,
    )
