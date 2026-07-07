# StudyMate Deployment

## Required Environment Variables

- `SECRET_KEY`
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

## Render Commands

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
gunicorn wsgi:app
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
