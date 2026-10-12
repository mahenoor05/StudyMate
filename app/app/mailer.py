"""Tiny email helper.

Render's free plan blocks normal SMTP ports (25, 465, 587), so this sends mail through
Brevo's HTTPS API instead. It needs no extra Python packages.

Environment variables (set them in the Render dashboard):
  BREVO_API_KEY     API key from Brevo (SMTP & API > API Keys)
  MAIL_FROM_EMAIL   a sender address you have verified inside Brevo
  MAIL_FROM_NAME    optional, defaults to "StudyMate"
"""
import json
import logging
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

logger = logging.getLogger("studymate.mail")

BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email"


def mail_is_configured():
    return bool(os.environ.get("BREVO_API_KEY") and os.environ.get("MAIL_FROM_EMAIL"))


def send_email(to_email, to_name, subject, text_body, api_url=None):
    """Send a plain-text email. Returns True on success, False on any failure."""
    if not mail_is_configured():
        return False

    payload = {
        "sender": {
            "name": os.environ.get("MAIL_FROM_NAME") or "StudyMate",
            "email": os.environ["MAIL_FROM_EMAIL"],
        },
        "to": [{"email": to_email, "name": to_name or to_email}],
        "subject": subject,
        "textContent": text_body,
    }
    request = Request(
        api_url or BREVO_SEND_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": os.environ["BREVO_API_KEY"],
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=10):
            return True
    except HTTPError as error:
        logger.warning("Email provider rejected the request (HTTP %s).", error.code)
    except URLError as error:
        logger.warning("Could not reach the email provider: %s", error.reason)
    except Exception:  # never let an email problem crash the request
        logger.exception("Unexpected error while sending email.")
    return False
