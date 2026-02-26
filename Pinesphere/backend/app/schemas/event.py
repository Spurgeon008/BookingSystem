from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=2000)
    category: str = Field(default="movie", max_length=50)
    venue: str = Field(default="Main Hall", max_length=255)
    price: float = Field(default=0.0, ge=0)
    poster_url: Optional[str] = None
    rows: int = Field(default=5, gt=0, le=26)
    seats_per_row: int = Field(default=10, gt=0, le=30)
    event_date: datetime


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    venue: Optional[str] = None
    price: Optional[float] = None
    poster_url: Optional[str] = None
    event_date: Optional[datetime] = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    venue: str
    price: float
    poster_url: Optional[str] = None
    rows: int
    seats_per_row: int
    total_seats: int
    available_seats: int
    event_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class SeatMapResponse(BaseModel):
    event_id: int
    rows: int
    seats_per_row: int
    price: float
    booked_seats: List[str]
    locked_seats: List[str]
