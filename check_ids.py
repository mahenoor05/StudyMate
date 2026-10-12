"""Finds page elements that script.js looks for but app.html does not have.
Run from the project folder:  python check_ids.py
A missing id is the usual reason for dead buttons and a page stuck on 'Loading...'."""
import re
from pathlib import Path

root = Path(__file__).resolve().parent
script = (root / "app" / "static" / "js" / "script.js").read_text(encoding="utf-8")
html = (root / "app" / "templates" / "app.html").read_text(encoding="utf-8")

wanted = set(re.findall(r'getElementById\("([^"]+)"\)', script))
present = set(re.findall(r'\bid="([^"]+)"', html))
missing = sorted(wanted - present)

print(f"script.js looks for {len(wanted)} elements; app.html has {len(present)} ids.")
if missing:
    print("\nMISSING from app.html (these break the page):")
    for name in missing:
        print("  -", name)
else:
    print("\nAll elements script.js needs are in app.html.")
