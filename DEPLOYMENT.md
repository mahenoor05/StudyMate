# StudyMate Deployment

## Required Environment Variables

- `SECRET_KEY`
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_ANON_KEY` (the PUBLIC anon key, used by the Library's live presence. Never put the service-role key in the browser)
- `GEMINI_API_KEY` (AI syllabus, study plan and mock tests; without it the built-in answers are used)
- `BREVO_API_KEY`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`, `APP_BASE_URL` (password reset emails)
- `AI_REQUESTS_PER_HOUR` (optional, default 20 per user)
- `GEMINI_MODEL` (optional, default `gemini-3.6-flash`; check Google's current model list)
- `TURN_CREDENTIALS_URL` (free option for calls across networks: your Metered Open Relay credentials address including the API key; keep it secret)
- `TURN_URLS`, `TURN_USERNAME`, `TURN_CREDENTIAL` (optional but needed for reliable video calls across different networks; `TURN_URLS` can hold several comma-separated `turn:` or `turns:` addresses)

## Render Commands

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
gunicorn wsgi:app --workers 2 --threads 4 --timeout 60
```

## Production Database Migration

Run after the production `DATABASE_URL` is configured:

```bash
flask --app run.py db upgrade
```

## Local Development

```bash
python run.py
```

Local development uses SQLite and local profile-photo uploads when Supabase environment variables are not configured.

## Supabase Storage

Create a Storage bucket matching `SUPABASE_STORAGE_BUCKET`. Profile photos are uploaded by the Flask backend under `profile-photos/<user-id>/...`; do not expose the service-role key to browser JavaScript.
