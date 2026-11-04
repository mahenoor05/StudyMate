from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = (ROOT / "app" / "static" / "js" / "script.js").read_text(encoding="utf-8")
ROUTES = (ROOT / "app" / "api" / "routes.py").read_text(encoding="utf-8")
APP_HTML = (ROOT / "app" / "templates" / "app.html").read_text(encoding="utf-8")


class LibraryExamsFixesTestCase(unittest.TestCase):
    def test_exam_ai_data_is_kept_when_exams_are_normalized(self):
        for field in ["aiPlan:", "mockTests:", "mistakes:", "syllabusFetchedWithGemini:"]:
            self.assertIn(field, SCRIPT)

    def test_ai_and_library_routes_require_login(self):
        for route in ['"/exams/ai-syllabus"', '"/exams/ai-plan"', '"/exams/ai-mock"', '"/library/room"']:
            index = ROUTES.index(route)
            self.assertIn("@login_required", ROUTES[index:index + 120], route)
        self.assertIn("ai_rate_limited()", ROUTES)

    def test_library_only_connects_when_configured(self):
        self.assertNotIn("xyzcompany.supabase.co", SCRIPT)
        self.assertNotIn("public-anon-key", SCRIPT)
        self.assertIn("function realtimeIsConfigured()", SCRIPT)
        self.assertIn("window.LIBRARY_WS_URL", SCRIPT)
        self.assertIn("window.SUPABASE_ANON_KEY = ", APP_HTML)

    def test_library_shares_only_public_profile_fields(self):
        self.assertNotIn("user: currentUser,", SCRIPT)
        self.assertNotIn("user: window.STUDYMATE_USER", SCRIPT)
        self.assertIn("function getPublicLibraryUser(user)", SCRIPT)

    def test_desk_ownership_never_compares_desk_number_with_user_id(self):
        start = SCRIPT.index("function isDeskMine(deskOrOccupant) {")
        body = SCRIPT[start:SCRIPT.index("window.isDeskMine = isDeskMine;")]
        self.assertNotIn("deskOrOccupant.id &&", body)
        self.assertNotIn("displayName === currentUsername", body)

    def test_sidebar_highlight_uses_the_real_section_class(self):
        self.assertIn('document.querySelector(".app-section.active")', SCRIPT)
        self.assertNotIn(".content-section.active", SCRIPT)

    def test_there_is_a_single_join_leave_button(self):
        self.assertIn('id="quick-join-vc-btn"', APP_HTML)
        self.assertNotIn('id="vc-lobby-join-btn"', APP_HTML)
        self.assertNotIn('id="vc-active-leave-btn"', APP_HTML)

    def test_mic_and_camera_buttons_do_not_start_a_call(self):
        for name in ["function toggleMic() {", "function toggleCam() {"]:
            start = SCRIPT.index(name)
            self.assertNotIn("joinVC()", SCRIPT[start:start + 400], name)

    def test_reserving_a_desk_does_not_sit_you_down(self):
        start = SCRIPT.index("function checkAutoSeatClaimedDesk() {")
        body = SCRIPT[start:SCRIPT.index("function renderAllLibraryComponents() {")]
        self.assertNotIn("occupiedBy =", body)
        self.assertNotIn("desk:take", body)

    def test_syllabus_is_subject_unit_topic_with_real_dialogs(self):
        start = SCRIPT.index("function addExamSubject(") if "function addExamSubject(" in SCRIPT else SCRIPT.index("async function addExamSubject(")
        edit_block = SCRIPT[start:SCRIPT.index("function addExamMilestone(examId) {")]
        self.assertNotIn("prompt(", edit_block)
        self.assertNotIn("confirm(", edit_block)
        self.assertIn("askConfirm(", edit_block)
        for label in ["+ Add Unit", "Rename Unit", "Delete Unit", "+ Add Topics", "Mark Unit Done", "Expand all", "Collapse all"]:
            self.assertIn(label, SCRIPT)
        self.assertNotIn('"+ Add Chapter"', SCRIPT)

    def test_ai_syllabus_is_only_labelled_ai_when_the_server_says_so(self):
        self.assertIn('data.source === "ai"', SCRIPT)
        self.assertNotIn("Standard syllabus loaded via Gemini API", SCRIPT)
        self.assertIn("AI syllabus loaded for", SCRIPT)
        self.assertIn("userClearedSyllabus", SCRIPT)

    def test_ai_model_comes_from_settings_and_calls_use_a_turn_list(self):
        self.assertNotIn('model="gemini-3.8-flash"', ROUTES)
        self.assertIn('os.environ.get("GEMINI_MODEL"', ROUTES)
        self.assertIn('@api_bp.get("/library/ice-servers")', ROUTES)
        self.assertIn("async function loadIceServers()", SCRIPT)

    def test_missing_helpers_exist(self):
        self.assertIn("function showLibraryToast(message)", SCRIPT)
        self.assertIn("function formatIsoDateString(date)", SCRIPT)


if __name__ == "__main__":
    unittest.main()
