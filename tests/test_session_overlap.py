from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace
import importlib.util
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
ROUTES = (ROOT / "app" / "api" / "routes.py").read_text(encoding="utf-8")
SCRIPT = (ROOT / "app" / "static" / "js" / "script.js").read_text(encoding="utf-8")


def load_helpers():
    as_utc_source = re.search(r"def as_utc\(value\):.*?(?=\ndef )", ROUTES, re.S).group(0)
    start = ROUTES.index("def ranges_overlap")
    end = ROUTES.index("def find_overlapping_session")
    spec = importlib.util.spec_from_file_location("time_utils_for_test", ROOT / "app" / "time_utils.py")
    time_utils = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(time_utils)
    namespace = {"timedelta": timedelta, "datetime": datetime, "timezone": timezone, "as_utc_datetime": time_utils.as_utc_datetime}
    exec(as_utc_source + "\n\n" + ROUTES[start:end], namespace)
    return namespace


def at(hour, minute=0):
    return datetime(2026, 10, 12, hour, minute, tzinfo=timezone.utc)


class SessionOverlapTestCase(unittest.TestCase):
    def test_overlap_rules(self):
        overlap = load_helpers()["ranges_overlap"]
        self.assertTrue(overlap(at(10), at(11), at(10, 30), at(11, 30)))   # partly overlapping
        self.assertTrue(overlap(at(10), at(12), at(10, 30), at(11)))       # one inside the other
        self.assertTrue(overlap(at(10), at(11), at(10), at(11)))           # identical
        self.assertFalse(overlap(at(10), at(11), at(11), at(12)))          # touching is fine
        self.assertFalse(overlap(at(10), at(11), at(12), at(13)))          # apart

    def test_session_end_uses_end_time_or_duration(self):
        study_session_end = load_helpers()["study_session_end"]
        with_end = SimpleNamespace(started_at=at(10).replace(tzinfo=None), ended_at=at(11).replace(tzinfo=None), study_seconds=0)
        without_end = SimpleNamespace(started_at=at(10).replace(tzinfo=None), ended_at=None, study_seconds=1800)
        self.assertEqual(study_session_end(with_end), at(11))
        self.assertEqual(study_session_end(without_end), at(10, 30))

    def test_backend_blocks_overlaps_and_second_running_session(self):
        self.assertIn("clash = find_overlapping_session(", ROUTES)
        self.assertIn("def find_active_session_conflict(data):", ROUTES)
        self.assertIn('"code": "session_in_progress"', ROUTES)
        self.assertIn("except IntegrityError:", ROUTES)

    def test_frontend_switches_to_the_running_session(self):
        self.assertIn("function adoptRunningSession(activeSession)", SCRIPT)
        self.assertIn('error.data.code === "session_in_progress"', SCRIPT)
        self.assertIn("async function syncActiveFocusFromServer()", SCRIPT)
        self.assertIn("async function refreshFromOtherTabs()", SCRIPT)


if __name__ == "__main__":
    unittest.main()
