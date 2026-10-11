from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = (ROOT / "app" / "static" / "js" / "script.js").read_text(encoding="utf-8")
ROUTES = (ROOT / "app" / "api" / "routes.py").read_text(encoding="utf-8")


def load_parse_revision():
    start = ROUTES.index("def parse_revision")
    end = ROUTES.index("def get_state_revision")
    namespace = {}
    exec(ROUTES[start:end], namespace)
    return namespace["parse_revision"]


class SaveGuardTestCase(unittest.TestCase):
    def test_parse_revision_is_forgiving(self):
        parse_revision = load_parse_revision()
        self.assertEqual(parse_revision(None), 0)
        self.assertEqual(parse_revision("7"), 7)
        self.assertEqual(parse_revision("abc"), 0)
        self.assertEqual(parse_revision(-4), 0)
        self.assertEqual(parse_revision(3), 3)

    def test_backend_refuses_stale_saves(self):
        self.assertIn("with_for_update()", ROUTES)
        self.assertIn('"code": "stale_data"', ROUTES)
        self.assertIn("}), 409", ROUTES)
        self.assertIn('app_data["_rev"] = current_rev + 1', ROUTES)

    def test_backend_restores_sessions_missing_from_saved_data(self):
        self.assertIn("def merge_unsynced_sessions(user, payload):", ROUTES)
        self.assertIn("merge_unsynced_sessions(current_user,", ROUTES)

    def test_conflicts_are_merged_instead_of_discarded(self):
        self.assertIn("function mergeAppData(local, base, server)", SCRIPT)
        self.assertIn("function mergeListById(local, base, server, prepend)", SCRIPT)
        self.assertIn("async function handleAppDataConflict()", SCRIPT)
        self.assertIn("appDataBase = JSON.parse(body);", SCRIPT)
        self.assertIn("function reloadAfterConflict()", SCRIPT)

    def test_other_tabs_changes_appear_without_reloading(self):
        self.assertIn('@api_bp.get("/app-data/revision")', ROUTES)
        self.assertIn("async function checkForRemoteChanges()", SCRIPT)
        self.assertIn('studyMateApi("app-data/revision")', SCRIPT)
        self.assertIn("window.setInterval(checkForRemoteChanges", SCRIPT)
        self.assertIn("MERGE_LOCAL_UI_KEYS", SCRIPT)

    def test_user_typed_names_are_escaped_before_going_into_html(self):
        for snippet in [
            "escapeHtml(user.name)",
            "escapeHtml(member.name)",
            "escapeHtml(challenge.title)",
            "escapeHtml(message.message)",
        ]:
            self.assertIn(snippet, SCRIPT)

    def test_frontend_sends_revision_and_saves_one_at_a_time(self):
        self.assertIn("payload._rev = appDataRevision;", SCRIPT)
        self.assertIn("Number(response.appData._rev || 0)", SCRIPT)
        self.assertIn("function pushAppDataToServer()", SCRIPT)
        self.assertIn("error.status = response.status;", SCRIPT)
        self.assertIn("if (error.status === 409)", SCRIPT)
        self.assertNotIn("JSON.stringify(appData)", SCRIPT)


if __name__ == "__main__":
    unittest.main()
