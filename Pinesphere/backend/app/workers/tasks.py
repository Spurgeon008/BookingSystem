import logging
from app.workers.celery_worker import celery_app
from app.services.email_service import send_email
from app.core.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(name="send_booking_confirmation", bind=True, max_retries=3, default_retry_delay=30)
def send_booking_confirmation(
    self,
    booking_id: int,
    user_email: str,
    event_title: str,
    venue: str,
    event_date_str: str,
    seats: str,
    num_seats: int,
    total_price: float,
):
    body = (
        f"Booking Confirmation\n"
        f"{'=' * 40}\n\n"
        f"Booking ID  : #{booking_id}\n"
        f"Event       : {event_title}\n"
        f"Venue       : {venue}\n"
        f"Date & Time : {event_date_str}\n"
        f"Seats       : {seats}\n"
        f"No. of Seats: {num_seats}\n"
        f"Total Paid  : \u20b9{total_price:.2f}\n"
        f"Status      : CONFIRMED\n\n"
        f"Thank you for booking with us!\n\n"
        f"\u2014 TicketBook Team"
    )

    subject = f"Booking Confirmed \u2013 #{booking_id}"

    recipients = [user_email]
    if settings.ADMIN_EMAIL and settings.ADMIN_EMAIL != user_email:
        recipients.append(settings.ADMIN_EMAIL)

    logger.info(
        "Sending booking confirmation via Celery \u2014 booking_id=%s, recipients=%s",
        booking_id,
        recipients,
    )

    try:
        send_email(to=recipients, subject=subject, body=body)
        logger.info("Email sent for booking #%s to %s", booking_id, recipients)
    except Exception as exc:
        logger.error(
            "Email send FAILED for booking #%s: %s",
            booking_id,
            exc,
        )
        raise self.retry(exc=exc)

    return {"status": "sent", "booking_id": booking_id, "recipients": recipients}

