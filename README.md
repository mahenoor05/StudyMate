# StudyMate

StudyMate is a study planning and focus web application. The frontend is still the existing plain HTML, CSS, and JavaScript prototype, and Phase 6A adds a Flask backend foundation with user accounts.

## Current Phase

Phase 6A includes:

- Flask application factory setup.
- SQLite database foundation.
- User registration, login, logout, and sessions.
- Password hashing with Werkzeug.
- Protected access to the StudyMate app.
- Basic user personalization on the Home greeting.

The study features still use browser `localStorage` for now. Phase 6B will move personal study data into user-owned database tables.

## Project Structure

- `run.py` starts the Flask app.
- `requirements.txt` lists the Python packages for this phase.
- `app/__init__.py` creates and configures the Flask app.
- `app/extensions.py` stores shared Flask extension objects.
- `app/models.py` contains the `User` database model.
- `app/auth/routes.py` handles register, login, and logout.
- `app/main/routes.py` protects and serves the StudyMate app.
- `app/templates/` contains Flask templates.
- `app/static/css/style.css` contains the existing app styling plus auth page styling.
- `app/static/js/script.js` contains the existing frontend logic.
- `app/static/assets/` contains logos, images, icons, and media.
- `instance/studymate.sqlite` is created locally when the database is initialized.

## Run Locally

Open a terminal in the project folder.

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create the database tables:

```bash
flask --app run.py init-db
```

Run the app:

```bash
python run.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Development Notes

- The SQLite file is created at `instance/studymate.sqlite`.
- To reset development data, stop the Flask server, delete `instance/studymate.sqlite`, then run `flask --app run.py init-db` again.
- Do not commit `.env` files or local database files.
- For local development, Flask uses a simple fallback secret key. Before production, set a real `SECRET_KEY` environment variable.
