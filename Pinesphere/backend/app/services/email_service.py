import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to: list[str], subject: str, body: str) -> None:
    if not settings.SMTP_EMAIL or not settings.SMTP_PASS:
        raise ValueError(
            f"SMTP credentials not configured — SMTP_EMAIL={'set' if settings.SMTP_EMAIL else 'EMPTY'}, "
            f"SMTP_PASS={'set' if settings.SMTP_PASS else 'EMPTY'}"
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_EMAIL
    msg["To"] = ", ".join(to)

    msg.attach(MIMEText(body, "plain"))

    html_body = body.replace("\n", "<br>")
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0;">🎬 TicketBook</h2>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p style="white-space: pre-line; line-height: 1.8; color: #374151;">{html_body}</p>
        </div>
    </div>
    """
    msg.attach(MIMEText(html_content, "html"))

    logger.info("Connecting to smtp.gmail.com:587 for recipients=%s", to)

    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.SMTP_EMAIL, settings.SMTP_PASS)
        server.sendmail(settings.SMTP_EMAIL, to, msg.as_string())

    logger.info("Email sent successfully to %s", to)
