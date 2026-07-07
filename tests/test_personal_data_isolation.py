import os
import tempfile
import unittest


class PersonalDataIsolationTest(unittest.TestCase):
    def setUp(self):
        self.db_file = tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False)
        self.db_file.close()
        os.environ["DATABASE_URL"] = f"sqlite:///{self.db_file.name}"
        os.environ["SECRET_KEY"] = "test-secret"

        from app import create_app
        from app.extensions import db
        from app.models import User

        self.app = create_app()
        self.app.config.update(TESTING=True, WTF_CSRF_ENABLED=False)
        self.db = db
        self.User = User

        with self.app.app_context():
            db.create_all()
            user_a = User(display_name="Account A", username="account_a", email="a@example.com")
            user_a.set_password("password123")
            user_b = User(display_name="Account B", username="account_b", email="b@example.com")
            user_b.set_password("password123")
            db.session.add_all([user_a, user_b])
            db.session.commit()

        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            self.db.session.remove()
            self.db.drop_all()
            self.db.engine.dispose()
        os.unlink(self.db_file.name)
        os.environ.pop("DATABASE_URL", None)
        os.environ.pop("SECRET_KEY", None)

    def login(self, username):
        return self.client.post("/login", data={
            "login": username,
            "password": "password123",
        }, follow_redirects=False)

    def logout(self):
        self.client.get("/logout", follow_redirects=False)

    def test_personal_api_is_scoped_to_current_user(self):
        from app.models import Exam, StudySession, Subject, Task

        self.login("account_a")
        app_data = {
            "date": "2026-07-07",
            "goalHours": 2,
            "focusIntention": "Account A intention",
            "subjects": [{"id": "subject-a", "name": "Private Physics A", "seconds": 1200}],
            "tasks": [{"id": "task-a", "text": "Private task A", "completed": False, "repeat": "never"}],
            "sessions": [{
                "id": "session-a",
                "subjectId": "subject-a",
                "subjectName": "Private Physics A",
                "mode": "Stopwatch",
                "startedAt": "2026-07-07T10:00:00+00:00",
                "endedAt": "2026-07-07T10:30:00+00:00",
                "durationSeconds": 1800,
            }],
            "dailyHistory": {},
            "plannerItems": [],
            "exams": [{
                "id": "exam-a",
                "type": "Custom Exam",
                "name": "Private Exam A",
                "date": "2026-07-20",
                "subjects": [{"id": "exam-subject-a", "name": "Math", "chapters": []}],
                "milestones": [],
            }],
            "distractions": [],
        }
        response = self.client.put("/api/app-data", json=app_data)
        self.assertEqual(response.status_code, 200)

        with self.app.app_context():
            subject_id = Subject.query.filter_by(client_id="subject-a").one().id
            task_id = Task.query.filter_by(client_id="task-a").one().id
            session_id = StudySession.query.filter_by(client_id="session-a").one().id
            exam_id = Exam.query.filter_by(client_id="exam-a").one().id

        own_response = self.client.get("/api/app-data")
        self.assertEqual(own_response.status_code, 200)
        self.assertIn("Private Physics A", str(own_response.json))
        self.assertIn("Private task A", str(own_response.json))
        self.assertIn("Private Exam A", str(own_response.json))

        self.logout()
        self.login("account_b")

        other_response = self.client.get("/api/app-data")
        self.assertEqual(other_response.status_code, 200)
        self.assertNotIn("Private Physics A", str(other_response.json))
        self.assertNotIn("Private task A", str(other_response.json))
        self.assertNotIn("Private Exam A", str(other_response.json))

        protected_urls = [
            f"/api/subjects/{subject_id}",
            f"/api/tasks/{task_id}",
            f"/api/sessions/{session_id}",
            f"/api/exams/{exam_id}",
        ]
        for url in protected_urls:
            self.assertEqual(self.client.get(url).status_code, 404)
            self.assertEqual(self.client.patch(url, json={"name": "Stolen"}).status_code, 404)
            self.assertEqual(self.client.delete(url).status_code, 404)

        self.logout()
        self.login("account_a")
        final_response = self.client.get("/api/app-data")
        self.assertEqual(final_response.status_code, 200)
        self.assertIn("Private Physics A", str(final_response.json))
        self.assertIn("Private task A", str(final_response.json))
        self.assertIn("Private Exam A", str(final_response.json))


if __name__ == "__main__":
    unittest.main()
