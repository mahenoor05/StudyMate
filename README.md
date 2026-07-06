# StudyMate

StudyMate is a static browser app for planning study sessions, tracking focus time, managing tasks, and reviewing daily progress. It runs with plain HTML, CSS, and JavaScript, storing user data in localStorage.

## Features

- Modern dashboard with active session details, today's goal, stats, subject totals, task preview, and focus intention.
- Single Study Session timer with a current subject dropdown.
- Subject statistics that update live while the timer runs.
- Recent sessions recorded when a study session is paused.
- Daily study goal tracking in hours.
- Task board with pending and completed columns.
- Distraction log for quick reflection.
- Theme and accent color customization.

## Run Locally

Open index.html in a browser. No build step or package install is required.

## Project Structure

- index.html contains the single-page app sections.
- style.css contains all layout, theme, and responsive styling.
- script.js manages state, the single study timer, localStorage persistence, and rendering.
- assets/ is reserved for future images, icons, music, and other media.