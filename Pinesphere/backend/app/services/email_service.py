import logging
import smtplib
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to: list[str], subject: str, body: str) -> None:
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_EMAIL
        msg["To"] = ", ".join(to)

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(settings.SMTP_EMAIL, settings.SMTP_PASS)
        server.sendmail(settings.SMTP_EMAIL, to, msg.as_string())
        server.quit()

        logger.info("Email sent successfully to %s", to)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
