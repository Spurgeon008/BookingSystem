from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class BookingCreate(BaseModel):
    event_id: int
    seats: List[str] = Field(..., min_length=1)


class BookingResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    seats: str
    num_seats: int
    total_price: float
    status: str
    booking_time: datetime
    created_at: Optional[datetime] = None
    event_title: Optional[str] = None
    event_date: Optional[datetime] = None
    venue: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True
