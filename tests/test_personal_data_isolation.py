import os
import tempfile
import unittest
from datetime import datetime, timezone


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
            user_c = User(display_name="Account C", username="account_c", email="c@example.com")
            user_c.set_password("password123")
            db.session.add_all([user_a, user_b, user_c])
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

    def test_fresh_account_has_no_demo_group_or_leaderboard_data(self):
        self.login("account_a")

        app_data_response = self.client.get("/api/app-data")
        groups_response = self.client.get("/api/groups")
        leaderboard_response = self.client.get("/api/leaderboard?range=today")

        self.assertEqual(app_data_response.status_code, 200)
        self.assertIsNone(app_data_response.json["appData"])
        self.assertEqual(groups_response.status_code, 200)
        self.assertEqual(groups_response.json["groups"], [])
        self.assertEqual(leaderboard_response.status_code, 200)
        self.assertEqual(leaderboard_response.json["rows"], [])
        self.assertNotIn("StudyMate Circle", str(groups_response.json))
        self.assertNotIn("Demo", str(leaderboard_response.json))

    def test_profile_settings_update_and_username_uniqueness(self):
        self.login("account_a")

        response = self.client.patch("/api/profile", json={
            "displayName": "Account A Updated",
            "username": "account_a_new",
            "bio": "Preparing for JEE.",
            "country": "India",
            "timezone": "IST",
            "studyDayStartTime": "05:00",
            "preferredTheme": "midnight",
            "profileVisibility": "friends",
            "groupVisibility": "members",
            "leaderboardVisibility": "groups",
        })
        self.assertEqual(response.status_code, 200)
        profile = response.json["profile"]
        self.assertEqual(profile["username"], "account_a_new")
        self.assertEqual(profile["timezone"], "Asia/Kolkata")
        self.assertEqual(profile["studyDayStartTime"], "05:00")
        self.assertEqual(profile["preferredTheme"], "midnight")
        self.assertEqual(profile["leaderboardVisibility"], "groups")
        self.assertNotIn("preferredStudyGoal", profile)
        self.assertNotIn("selectedExams", profile)
        self.assertNotIn("preferredSubjects", profile)

        conflict = self.client.patch("/api/profile", json={
            "displayName": "Account A Updated",
            "username": "account_b",
        })
        self.assertEqual(conflict.status_code, 409)

    def test_group_collaboration_and_leaderboard_use_real_database_rows(self):
        from app.models import StudySession, User

        self.login("account_a")
        create_response = self.client.post("/api/groups", json={
            "name": "Physics Partners",
            "description": "Real shared study group",
            "icon": "PP",
        })
        self.assertEqual(create_response.status_code, 201)
        group = create_response.json["group"]
        group_id = group["id"]
        invite_code = group["inviteCode"]
        self.assertEqual(group["members"][0]["name"], "Account A")
        self.assertNotIn("Maya", str(group))

        message_response = self.client.post(f"/api/groups/{group_id}/messages", json={"message": "Welcome!"})
        self.assertEqual(message_response.status_code, 201)

        self.logout()
        self.login("account_b")
        self.assertEqual(self.client.get(f"/api/groups/{group_id}").status_code, 404)
        self.assertEqual(self.client.get("/api/groups").json["groups"], [])

        join_response = self.client.post("/api/groups/join", json={"inviteCode": invite_code})
        self.assertEqual(join_response.status_code, 200)
        self.assertEqual(len(join_response.json["group"]["members"]), 2)
        self.assertIn("Welcome!", str(join_response.json))

        reply_response = self.client.post(f"/api/groups/{group_id}/messages", json={"message": "Joined."})
        self.assertEqual(reply_response.status_code, 201)

        self.logout()
        self.login("account_c")
        self.assertEqual(self.client.get(f"/api/groups/{group_id}/messages").status_code, 404)

        with self.app.app_context():
            user_a = User.query.filter_by(username="account_a").one()
            user_b = User.query.filter_by(username="account_b").one()
            db_now = datetime.now(timezone.utc)
            self.db.session.add_all([
                StudySession(
                    client_id="session-a",
                    user_id=user_a.id,
                    subject_name="Physics",
                    timer_mode="Stopwatch",
                    started_at=db_now,
                    study_seconds=2400,
                    break_seconds=0,
                    payload={},
                ),
                StudySession(
                    client_id="session-b",
                    user_id=user_b.id,
                    subject_name="Chemistry",
                    timer_mode="Stopwatch",
                    started_at=db_now,
                    study_seconds=1200,
                    break_seconds=0,
                    payload={},
                ),
            ])
            self.db.session.commit()

        self.logout()
        self.login("account_a")
        leaderboard_response = self.client.get(f"/api/leaderboard?range=today&groupId={group_id}")
        self.assertEqual(leaderboard_response.status_code, 200)
        rows = leaderboard_response.json["rows"]
        self.assertEqual([row["name"] for row in rows], ["Account A", "Account B"])
        self.assertEqual([row["totalSeconds"] for row in rows], [2400, 1200])

        self.logout()
        self.login("account_b")
        privacy_response = self.client.patch("/api/profile", json={
            "displayName": "Account B",
            "username": "account_b",
            "leaderboardVisibility": "private",
        })
        self.assertEqual(privacy_response.status_code, 200)

        self.logout()
        self.login("account_a")
        private_filtered = self.client.get(f"/api/leaderboard?range=today&groupId={group_id}")
        self.assertEqual([row["name"] for row in private_filtered.json["rows"]], ["Account A"])

    def test_active_focus_session_is_scoped_to_current_user(self):
        from app.models import StudySession

        self.login("account_a")
        active_response = self.client.put("/api/focus/active", json={
            "id": "active-a",
            "subjectId": "subject-a",
            "subjectName": "Private Physics A",
            "mode": "Stopwatch",
            "modeId": "stopwatch",
            "phase": "focus",
            "goal": "Read chapter 1",
            "startedAt": "2026-07-08T10:00:00+00:00",
            "totalPausedSeconds": 0,
            "state": "running",
            "focusSeconds": None,
            "breakSeconds": 0,
        })
        self.assertEqual(active_response.status_code, 200)
        self.assertEqual(active_response.json["activeSession"]["id"], "active-a")

        sync_response = self.client.put("/api/app-data", json={
            "date": "2026-07-08",
            "goalHours": 2,
            "subjects": [],
            "tasks": [],
            "sessions": [],
            "dailyHistory": {},
            "plannerItems": [],
            "exams": [],
            "distractions": [],
        })
        self.assertEqual(sync_response.status_code, 200)
        self.assertEqual(self.client.get("/api/focus/active").json["activeSession"]["id"], "active-a")

        self.logout()
        self.login("account_b")
        self.assertIsNone(self.client.get("/api/focus/active").json["activeSession"])
        self.assertEqual(self.client.delete("/api/focus/active").status_code, 200)

        complete_other_user = self.client.post("/api/focus/complete", json={
            "endedAt": "2026-07-08T10:10:00+00:00",
            "durationSeconds": 600,
        })
        self.assertEqual(complete_other_user.status_code, 404)

        self.logout()
        self.login("account_a")
        restored = self.client.get("/api/focus/active")
        self.assertEqual(restored.status_code, 200)
        self.assertEqual(restored.json["activeSession"]["id"], "active-a")

        discard_response = self.client.delete("/api/focus/active")
        self.assertEqual(discard_response.status_code, 200)
        self.assertIsNone(self.client.get("/api/focus/active").json["activeSession"])
        with self.app.app_context():
            self.assertIsNone(StudySession.query.filter_by(client_id="active-a").first())

        fresh_response = self.client.put("/api/focus/active", json={
            "id": "active-a-fresh",
            "subjectId": "subject-a",
            "subjectName": "Private Physics A",
            "mode": "Stopwatch",
            "modeId": "stopwatch",
            "phase": "focus",
            "goal": "Read chapter 2",
            "startedAt": "2026-07-08T11:00:00+00:00",
            "totalPausedSeconds": 0,
            "state": "running",
            "focusSeconds": None,
            "breakSeconds": 0,
        })
        self.assertEqual(fresh_response.status_code, 200)
        self.assertEqual(fresh_response.json["activeSession"]["id"], "active-a-fresh")

        complete_response = self.client.post("/api/focus/complete", json={
            "endedAt": "2026-07-08T11:10:00+00:00",
            "durationSeconds": 600,
        })
        self.assertEqual(complete_response.status_code, 200)
        self.assertEqual(complete_response.json["session"]["id"], "active-a-fresh")
        self.assertEqual(complete_response.json["session"]["durationSeconds"], 600)
        self.assertIsNone(self.client.get("/api/focus/active").json["activeSession"])

    def test_active_focus_timestamps_round_trip_as_explicit_utc(self):
        self.login("account_a")
        active_response = self.client.put("/api/focus/active", json={
            "id": "roundtrip-a",
            "subjectId": "",
            "subjectName": "General Study",
            "mode": "Stopwatch",
            "modeId": "stopwatch",
            "phase": "focus",
            "startedAt": "2026-07-08T11:50:00.000Z",
            "pausedAt": None,
            "totalPausedSeconds": 0,
            "state": "running",
            "focusSeconds": None,
            "breakSeconds": 0,
        })
        self.assertEqual(active_response.status_code, 200)
        started_at = active_response.json["activeSession"]["startedAt"]
        self.assertTrue(started_at.endswith("+00:00"), started_at)
        self.assertNotEqual(started_at, "2026-07-08T11:50:00")

    def test_focus_completion_uses_user_study_day(self):
        self.login("account_a")
        profile_response = self.client.patch("/api/profile", json={
            "displayName": "Account A",
            "username": "account_a",
            "timezone": "Asia/Kolkata",
            "studyDayStartTime": "05:00",
        })
        self.assertEqual(profile_response.status_code, 200)

        active_response = self.client.put("/api/focus/active", json={
            "id": "late-night-a",
            "subjectId": "",
            "subjectName": "Late Study",
            "mode": "Stopwatch",
            "modeId": "stopwatch",
            "phase": "focus",
            "startedAt": "2026-07-08T20:30:00+00:00",
            "totalPausedSeconds": 0,
            "state": "running",
            "focusSeconds": None,
            "breakSeconds": 0,
        })
        self.assertEqual(active_response.status_code, 200)

        complete_response = self.client.post("/api/focus/complete", json={
            "endedAt": "2026-07-08T21:00:00+00:00",
            "durationSeconds": 1800,
        })
        self.assertEqual(complete_response.status_code, 200)
        self.assertEqual(complete_response.json["session"]["date"], "2026-07-08")

    def test_session_manual_edit_delete_are_scoped_and_audited(self):
        self.login("account_a")
        sync_response = self.client.put("/api/app-data", json={
            "date": "2026-07-08",
            "goalHours": 2,
            "subjects": [{"id": "manual-subject-a", "name": "Manual Maths", "seconds": 0}],
            "tasks": [],
            "sessions": [],
            "dailyHistory": {},
            "plannerItems": [],
            "exams": [],
            "distractions": [],
        })
        self.assertEqual(sync_response.status_code, 200)

        create_response = self.client.post("/api/sessions", json={
            "id": "manual-a",
            "date": "2026-07-08",
            "subjectId": "manual-subject-a",
            "subjectName": "Manual Maths",
            "mode": "Manual",
            "startedAt": "2026-07-08T09:00:00+00:00",
            "endedAt": "2026-07-08T09:30:00+00:00",
            "durationSeconds": 1800,
            "sourceType": "manual",
            "reviewNote": "Forgot to start timer",
        })
        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(create_response.json["session"]["sourceType"], "manual")
        self.assertFalse(create_response.json["session"]["wasEdited"])

        missing_subject = self.client.post("/api/sessions", json={
            "id": "manual-missing-subject",
            "subjectName": "Other",
            "mode": "Manual",
            "startedAt": "2026-07-08T09:00:00+00:00",
            "endedAt": "2026-07-08T09:30:00+00:00",
            "durationSeconds": 1800,
            "sourceType": "manual",
        })
        self.assertEqual(missing_subject.status_code, 400)

        edit_response = self.client.patch("/api/sessions/client/manual-a", json={
            "id": "manual-a",
            "date": "2026-07-08",
            "subjectId": "manual-subject-a",
            "subjectName": "Manual Maths",
            "mode": "Manual",
            "startedAt": "2026-07-08T09:00:00+00:00",
            "endedAt": "2026-07-08T09:45:00+00:00",
            "durationSeconds": 2700,
            "sourceType": "manual",
            "reviewNote": "Corrected end time",
        })
        self.assertEqual(edit_response.status_code, 200)
        self.assertTrue(edit_response.json["session"]["wasEdited"])
        self.assertEqual(edit_response.json["session"]["originalDurationSeconds"], 1800)
        self.assertEqual(edit_response.json["session"]["durationSeconds"], 2700)

        invalid_response = self.client.patch("/api/sessions/client/manual-a", json={
            "startedAt": "2026-07-08T10:00:00+00:00",
            "endedAt": "2026-07-08T09:00:00+00:00",
            "durationSeconds": -1,
        })
        self.assertEqual(invalid_response.status_code, 400)

        self.logout()
        self.login("account_b")
        self.assertEqual(self.client.patch("/api/sessions/client/manual-a", json={
            "durationSeconds": 60,
        }).status_code, 404)
        self.assertEqual(self.client.delete("/api/sessions/client/manual-a").status_code, 404)

        self.logout()
        self.login("account_a")
        self.assertEqual(self.client.delete("/api/sessions/client/manual-a").status_code, 200)
        self.assertEqual(self.client.delete("/api/sessions/client/manual-a").status_code, 404)


if __name__ == "__main__":
    unittest.main()
