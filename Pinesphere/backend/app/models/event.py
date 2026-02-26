from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, default="movie")
    venue = Column(String(255), nullable=False, default="Main Hall")
    price = Column(Float, nullable=False, default=0.0)
    poster_url = Column(String(500), nullable=True)
    rows = Column(Integer, nullable=False, default=5)
    seats_per_row = Column(Integer, nullable=False, default=10)
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bookings = relationship("Booking", back_populates="event", cascade="all, delete-orphan")
    booked_seats = relationship("BookedSeat", back_populates="event", cascade="all, delete-orphan")
