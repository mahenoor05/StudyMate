from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


TIMEZONE_ALIASES = {
    "GMT": "UTC",
    "IST": "Asia/Kolkata",
    "UTC": "UTC",
}
DEFAULT_TIMEZONE = "Asia/Kolkata"


def normalize_timezone_name(value):
    name = str(value or DEFAULT_TIMEZONE).strip() or DEFAULT_TIMEZONE
    name = TIMEZONE_ALIASES.get(name.upper(), name)
    try:
        ZoneInfo(name)
    except ZoneInfoNotFoundError:
        return DEFAULT_TIMEZONE
    return name


def get_user_timezone(user):
    return ZoneInfo(normalize_timezone_name(getattr(user, "timezone", DEFAULT_TIMEZONE)))


def parse_study_day_start(value):
    try:
        hour_text, minute_text = str(value or "00:00").split(":", 1)
        hour = int(hour_text)
        minute = int(minute_text)
        if 0 <= hour <= 23 and 0 <= minute <= 59:
            return time(hour, minute)
    except (TypeError, ValueError):
        pass
    return time(0, 0)


def normalize_study_day_start(value):
    start = parse_study_day_start(value)
    return f"{start.hour:02d}:{start.minute:02d}"


def as_utc_datetime(value):
    if not value:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def utc_isoformat(value):
    utc_value = as_utc_datetime(value)
    return utc_value.isoformat() if utc_value else None


def get_user_local_datetime(user, value=None):
    utc_value = as_utc_datetime(value or datetime.now(timezone.utc))
    return utc_value.astimezone(get_user_timezone(user))


def get_user_study_date(user, value=None):
    local_dt = get_user_local_datetime(user, value)
    start = parse_study_day_start(getattr(user, "study_day_start_time", "00:00"))
    study_date = local_dt.date()
    if local_dt.time() < start:
        study_date -= timedelta(days=1)
    return study_date


def get_study_day_bounds(user, study_date=None):
    study_date = study_date or get_user_study_date(user)
    if isinstance(study_date, str):
        study_date = date.fromisoformat(study_date)
    start = parse_study_day_start(getattr(user, "study_day_start_time", "00:00"))
    local_start = datetime.combine(study_date, start, tzinfo=get_user_timezone(user))
    local_end = local_start + timedelta(days=1)
    return local_start.astimezone(timezone.utc), local_end.astimezone(timezone.utc)
