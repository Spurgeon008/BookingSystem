from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BookingSummary(BaseModel):
    total_bookings: int
    total_events: int
    total_users: int
    total_seats_booked: int
    total_revenue: float


class EventBookingReport(BaseModel):
    event_id: int
    event_title: str
    event_date: Optional[datetime] = None
    venue: str
    total_seats: int
    available_seats: int
    seats_booked: int
    booking_count: int
    revenue: float

    class Config:
        from_attributes = True


class UserBookingHistory(BaseModel):
    booking_id: int
    event_id: int
    event_title: str
    event_date: Optional[datetime] = None
    venue: Optional[str] = None
    seats: str
    num_seats: int
    total_price: float
    status: str
    booking_time: datetime

    class Config:
        from_attributes = True
