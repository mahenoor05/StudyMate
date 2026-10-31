# Multi-Floor Isometric Library Architecture Plan

Rebuilds the **Ground Floor**, **2nd Floor (Upper Mezzanine)**, and **Archive Wing** as three complete, self-contained isometric 3D study halls arranged side-by-side, eliminating wall/tree occlusion when switching floors while showcasing all unlocked halls simultaneously in **Top View**.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions incorporate your confirmed preferences:

- **Confirmed Decision 1 — Full Isometric Room per Floor (Side-by-Side in Top View)**: Each floor (`Ground Floor` at `x = 0`, `2nd Floor` at `x = +18`, `Archive Wing` at `x = -18`) is constructed as a complete `14.8m × 10.8m` cutaway isometric hall with its own North and West walls, wainscoting, herringbone oak flooring, 4 woven area rugs, bookcases, and lighting fixtures.
- **Confirmed Decision 2 — 16 Rug-Aligned Desks on Each Upper Floor (52 Desks Total)**:
  - **Ground Floor**: Desks 1–20 (5 per rug across 4 rugs; 16 in Group Library) + Foreground-Right Break Lounge.
  - **2nd Floor (Upper Mezzanine)**: Desks 21–36 (16 desks arranged 4 per rug in a clean 2×2 grid on each of the 4 mezzanine rugs).
  - **Archive Wing**: Desks 37–52 (16 desks arranged 4 per rug in a clean 2×2 grid on each of the 4 archive rugs).
- **Confirmed Decision 3 — Strict Floor Isolation in Standard View & Multi-Hall Framing in Top View**:
  - Clicking **Ground Floor**, **2nd Floor**, or **Archive Wing** hides the other floors' 3D geometry and labels so the active floor fills the viewport with a clean, unobstructed isometric camera angle.
  - Clicking **Top View** makes all currently unlocked floors visible side-by-side and dynamically frames 1, 2, or all 3 unlocked rooms at once.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a seamless multi-hall 3D study library where each unlocked floor looks and behaves like a complete, handcrafted Dark Academia room rather than an obstructed platform behind a wall.
- **Target Audience**: Students studying solo in the Common Library or collaboratively in a Group Library.
- **Key Value**: Eliminates 3D wall/tree clipping on the 2nd Floor and Archive Wing, gives every floor a balanced rug-aligned desk grid, and turns Top View into a true multi-room architectural overview.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Entering the Library**: Opens on the **Ground Floor** (`x = 0`) with 20 desks (16 for Group Library) and the Break Lounge. Only the Ground Floor room is visible.
  2. **Sequential Floor Unlocking**:
     - When Ground Floor reaches $\ge 80\%$ occupancy (or via `+ Fill Floor`), the **2nd Floor** button unlocks in the top bar.
     - Clicking **2nd Floor** isolates the **Upper Mezzanine Hall** (`x = +18`) with 16 desks on 4 burgundy/amber woven rugs, twin arched gallery windows, grand balustrade detailing, and wrought-iron chandeliers.
     - When 2nd Floor reaches $\ge 80\%$ occupancy (or clicking `+ Fill 2nd Floor`), the **Archive Wing** button unlocks.
     - Clicking **Archive Wing** isolates the **West Archive Hall** (`x = -18`) with 16 desks on 4 crimson/gold woven rugs, gothic vaulted book stacks, an illuminated manuscript lectern, and a celestial globe.
  3. **Multi-Floor Top View**:
     - Clicking **Top View** reveals all unlocked halls side-by-side (`Ground Floor` alone; `Ground Floor + 2nd Floor`; or `Archive Wing + Ground Floor + 2nd Floor`) with an overhead camera that frames every unlocked room cleanly.
- **Visual Identity & Theme**:
  - Preserves the Dark Academia palette (herringbone oak parquet, carved walnut wainscoting, brushed brass, and woven rugs) and synchronizes all 3 halls with the 3 lighting atmospheres (`Daylight`, `Golden Hour`, `Cozy Night`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Side-by-Side Full Isometric Rooms (`x = -18, 0, +18`) vs. Z-Stacked Rooms**:
  - *Chosen Approach*: Place the three `14.8m × 10.8m` isometric rooms along the X-axis (`Archive Wing` at `x = -18`, `Ground Floor` at `x = 0`, `2nd Floor` at `x = +18`).
  - *Why*: In an isometric view where North (`-Z`) and West (`-X`) walls are solid, placing a second room behind the North wall causes the first room's North wall and exterior window trees to block the camera. Placing each hall at its own X-offset allows identical, unobstructed isometric camera angles when viewing a single floor, and a clean horizontal panorama when viewing all unlocked floors in **Top View**.
- **Decision 2 — 4-Desk-per-Rug Grid (16 Desks per Upper Floor)**:
  - *Chosen Approach*: Each of the 4 rugs on the 2nd Floor and Archive Wing holds 4 desks in a symmetric 2×2 layout (`dx = ±1.4, dz = ±0.9` relative to each rug center).
  - *Why*: Gives every scholar generous spacing on the `6.2m × 4.2m` woven rugs with zero edge overhang.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TOP BAR FLOOR & VIEW CONTROLS                        │
│  [Ground Floor] [2nd Floor (≥80%)] [Archive Wing (≥80%)] | [☕ Lounge] [Top] │
└───────────────────┬─────────────────────────────────────────┬───────────────┘
                    │ switchFloor(floorId)                    │ setCameraPreset("topdown")
                    ▼                                         ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────┐
│      SINGLE-FLOOR ISOMETRIC MODE      │ │     MULTI-FLOOR TOP VIEW MODE     │
│  • Shows ONLY active floor group:     │ │  • Shows ALL unlocked floor       │
│    - Ground (x = 0, Desks 1..20)      │ │    groups side-by-side:           │
│    - 2nd Floor (x = +18, Desks 21..36)│ │    - 1 floor: center x = 0        │
│    - Archive (x = -18, Desks 37..52)  │ │    - 2 floors: center x = +9      │
│  • Camera: (centerX+8.6, 8.8, 10.2)   │ │    - 3 floors: center x = 0       │
│    Target: (centerX-0.3, 0.9, -0.3)   │ │  • Displays labels for all        │
│  • Isolates 3D HTML labels to floor   │ │    unlocked floors                │
└───────────────────────────────────────┘ └───────────────────────────────────┘
```

- **Data Model & 52-Desk State**:
  - `DESK_LAYOUTS` defines 52 desks:
    - `id: 1..20` (`floor: "ground"`, centered around `x = 0`)
    - `id: 21..36` (`floor: "mezzanine"`, centered around `x = +18`)
    - `id: 37..52` (`floor: "archive"`, centered around `x = -18`)
  - Backend room initialization and client room hydration (`ensureRoomHasAllDesks`) support all 52 desks across Common and Group libraries.
- **Visibility & Camera Controller**:
  - `updateFloorVisibility()` toggles `this.groundFloorGroup.visible`, `this.mezzanineGroup.visible`, `this.archiveWingGroup.visible`, and each desk's `unit.group.visible` so only the active floor is rendered during normal navigation, while all unlocked floors render together in `Top View`.
