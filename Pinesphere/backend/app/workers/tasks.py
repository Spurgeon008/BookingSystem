import logging
from app.workers.celery_worker import celery_app
from app.services.email_service import send_email
from app.core.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(name="send_booking_confirmation")
def send_booking_confirmation(booking_id: int, user_email: str):
    from app.db.session import SessionLocal
    from app.models.booking import Booking
    from app.models.event import Event

    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        event = db.query(Event).filter(Event.id == booking.event_id).first() if booking else None
    finally:
        db.close()

    if booking and event:
        event_date_str = event.event_date.strftime("%d %b %Y, %I:%M %p") if event.event_date else "N/A"
        body = (
            f"Booking Confirmation\n"
            f"{'=' * 40}\n\n"
            f"Booking ID  : #{booking.id}\n"
            f"Event       : {event.title}\n"
            f"Category    : {event.category.capitalize()}\n"
            f"Venue       : {event.venue}\n"
            f"Date & Time : {event_date_str}\n"
            f"Seats       : {booking.seats}\n"
            f"No. of Seats: {booking.num_seats}\n"
            f"Total Paid  : ₹{booking.total_price:.2f}\n"
            f"Status      : {booking.status.upper()}\n\n"
            f"Thank you for booking with us. Enjoy the event!\n\n"
            f"— Ticket Booking Team"
        )
    else:
        body = (
            f"Your booking (ID: #{booking_id}) has been confirmed.\n\n"
            f"Please check your dashboard for full details.\n\n"
            f"— Ticket Booking Team"
        )

    subject = f"Booking Confirmed – #{booking_id}"
    recipients = [user_email]
    if settings.ADMIN_EMAIL and settings.ADMIN_EMAIL != user_email:
        recipients.append(settings.ADMIN_EMAIL)

    logger.info(
        "Sending booking confirmation — booking_id=%s, recipients=%s",
        booking_id,
        recipients,
    )

    send_email(to=recipients, subject=subject, body=body)

    return {"status": "sent", "booking_id": booking_id, "recipients": recipients}

