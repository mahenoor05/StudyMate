from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = (ROOT / "app" / "static" / "js" / "script.js").read_text(encoding="utf-8")
APP_TEMPLATE = (ROOT / "app" / "templates" / "app.html").read_text(encoding="utf-8")


class FrontendTimerStateTestCase(unittest.TestCase):
    def test_current_timer_state_is_not_persisted_to_browser_cache(self):
        self.assertIn("delete cleaned.activeSession;", SCRIPT)
        self.assertIn("delete cleaned.pendingSessionReview;", SCRIPT)
        self.assertIn("cleaned.sessionState = \"pre-session\";", SCRIPT)
        self.assertNotIn("JSON.stringify(appData)", SCRIPT)

    def test_account_browser_cache_is_scoped_by_user_id(self):
        self.assertIn("id: {{ current_user.id|tojson }}", APP_TEMPLATE)
        self.assertIn("const ACCOUNT_STORAGE_ID = studyMateUser.id", SCRIPT)

    def test_active_focus_put_requires_explicit_intent(self):
        self.assertIn("function canWriteActiveFocusSession(reason)", SCRIPT)
        self.assertIn("if (!canWriteActiveFocusSession(reason)) return null;", SCRIPT)
        self.assertIn("discardedActiveSessionIds.add(discardedId);", SCRIPT)
        self.assertIn("if (promptToken !== activeSessionRecoveryPromptToken) return;", SCRIPT)
        self.assertNotIn("saveActiveFocusSession();", SCRIPT)

    def test_frontend_treats_backend_timestamps_as_utc(self):
        self.assertIn("function normalizeUtcTimestamp(value)", SCRIPT)
        self.assertIn("return `${text}Z`;", SCRIPT)
        self.assertIn("startedAt: normalizeUtcTimestamp(activeSession.startedAt)", SCRIPT)
        self.assertIn("return getStudyDateKey(date);", SCRIPT)

    def test_study_log_uses_shared_modal_and_account_timezone(self):
        self.assertIn('id="open-study-log-modal"', APP_TEMPLATE)
        self.assertIn('id="focus-open-study-log-modal"', APP_TEMPLATE)
        self.assertIn("focusOpenStudyLogModalButton.addEventListener", SCRIPT)
        self.assertIn("function localDateTimeToUtcIso(dateKey, timeValue)", SCRIPT)
        self.assertIn("Choose a subject before saving a study log.", SCRIPT)
        self.assertIn("const response = await studyMateApi(\"sessions\"", SCRIPT)


if __name__ == "__main__":
    unittest.main()
