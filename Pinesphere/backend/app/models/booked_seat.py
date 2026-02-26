from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base


class BookedSeat(Base):
    __tablename__ = "booked_seats"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    seat_label = Column(String(10), nullable=False)

    booking = relationship("Booking")
    event = relationship("Event", back_populates="booked_seats")

    __table_args__ = (
        UniqueConstraint("event_id", "seat_label", name="uq_event_seat"),
    )
