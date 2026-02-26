import logging
import mailtrap as mt

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to: list[str], subject: str, body: str) -> None:
    """Send a plain-text email via Mailtrap SDK."""
    try:
        client = mt.MailtrapClient(token=settings.MAILTRAP_API_TOKEN)

        mail = mt.Mail(
            sender=mt.Address(email=settings.EMAIL_FROM, name=settings.EMAIL_FROM_NAME),
            to=[mt.Address(email=addr) for addr in to],
            subject=subject,
            text=body,
        )

        client.send(mail)
        logger.info("Email sent successfully to %s", to)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
