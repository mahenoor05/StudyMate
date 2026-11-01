# Removal of Leaderboard & Group Focus Rooms

Comprehensive architectural plan to safely purge the global Leaderboard view and Group workspace Focus Rooms feature, streamlining StudyMate's navigation and community workspace while strictly safeguarding the 3D Cozy Library, study timers, group chat, and remaining core modules.

### User Review & Critical Decisions

> [!IMPORTANT]
> Both features to be removed have clear, self-contained footprints:
> - **Leaderboard**: Sidebar navigation button, main view container (`#leaderboard`), and client-side rendering handlers will be purged. The backend `/api/leaderboard` endpoint can remain as a harmless dormant query route or be simplified so no existing API contracts are abruptly broken.
> - **Group Focus Rooms**: The "Focus Rooms" tab button and live room container (`#group-tab-rooms`) within the Group workspace will be removed. The Group workspace will focus cleanly on **Overview**, **Challenges**, **Members**, **Ranking**, and **Chat**, alongside direct access to the **3D Group Library**.
> - **Zero Side-Effect Guarantee**: All references to removed DOM elements in `script.js` are either removed or guarded with null-checks to prevent runtime exceptions (`TypeError: Cannot read properties of null`).

---

### 1. Overview & Core Concept

- **What It Does**: Removes two legacy prototype features (the global competitive Leaderboard and group-level mock Focus Rooms) to eliminate clutter and focus StudyMate on calm, distraction-free studying, personal metrics, collaborative study circles, and the immersive 3D Cozy Library.
- **Target Audience / Persona**: Students preparing for high-stakes exams who prefer intentional focus over noisy mock leaderboards and fragmented focus room controls.
- **Key Value**: Cleaner UI, reduced cognitive overhead, zero non-functional or redundant room controls, and faster navigation between core workspaces.

---

### 2. User Experience & Visual Design

#### Navigation Flow After Removal
```
┌────────────────────────────────────────────────────────┐
│ Main Sidebar Navigation                                │
├──────────────────────────┬─────────────────────────────┤
│ Main:                    │ • Home                      │
│ Study:                   │ • Focus (Stopwatch/Timer)   │
│ Planning:                │ • Plan                      │
│                          │ • Calendar                  │
│                          │ • Exams                     │
│ Progress:                │ • Insights (Analytics)      │
│ Community:               │ • Common Library (& VC)     │
│                          │ • Groups (Study Circles)    │
│ Personal:                │ • Settings                  │
└──────────────────────────┴─────────────────────────────┘
```

#### Group Workspace Tabs After Removal
```
┌───────────────────────────────────────────────────────────────────────────┐
│ [← Back to Groups]  Calculus Study Circle                [📖 Group Library]│
│ 12 members · 4 studying now                                               │
├───────────────────────────────────────────────────────────────────────────┤
│ [ Overview ]  [ Challenges ]  [ Members ]  [ Ranking ]  [ Chat ]          │
│                                                                           │
│ (Focus Rooms tab button and container completely excised)                 │
└───────────────────────────────────────────────────────────────────────────┘
```

- **Visual Cleanliness**: The Community section in the sidebar retains only the essential social surfaces: **Common Library** and **Groups**.
- **Responsive Navigation**: Tab switching in both sidebar and Group workspace operates cleanly without broken references or empty panel states.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Removal of Leaderboard Button & View**
  - *Chosen Approach*: Remove the sidebar link `[data-section="leaderboard"]` and the `<section class="app-section" id="leaderboard">` from `app/templates/app.html`. In `script.js`, remove calls to `renderLeaderboard()` inside `updateAllDisplays()`, purge the `leaderboardTabs` click listener, and remove `leaderboardTable` DOM dependencies.
  - *Why*: Eliminates clutter and prevents empty/mock ranking states.
  - *Preserved*: Group member ranking within private circles remains intact under the group "Ranking" sub-tab.

- **Decision 2: Removal of Group Focus Rooms Sub-Tab & Container**
  - *Chosen Approach*: Delete `<button class="group-tab" data-group-tab="rooms">Focus Rooms</button>` and the entire `<div class="group-tab-panel" id="group-tab-rooms">...</div>` markup. Remove room member count badge from group header metadata. In `script.js`, clean up `renderGroupRooms()` and associated room button listeners.
  - *Why*: The dedicated **3D Cozy Library** (available for both Common Library and Group Libraries with real-time desk presence and Study VC) provides the modern, superior collaborative study experience, rendering the legacy 2D "Focus Rooms" redundant.

---

### 4. Technical Architecture & Component Mapping

```
┌──────────────────────────────────────────────────────────────┐
│                    StudyMate Frontend Engine                 │
└──────────────┬──────────────────────────────┬────────────────┘
               │                              │
     ┌─────────▼─────────┐          ┌─────────▼─────────┐
     │ app/templates/    │          │ app/static/js/    │
     │ app.html          │          │ script.js         │
     └─────────┬─────────┘          └─────────┬─────────┘
               │                              │
 ┌─────────────┴─────────────┐  ┌─────────────┴─────────────┐
 │ 1. Delete Leaderboard nav │  │ 1. Remove leaderboardTable│
 │    link (lines 192-195)   │  │    & tab listeners        │
 │ 2. Delete Leaderboard     │  │ 2. Remove renderLeader-   │
 │    section (1557-1576)    │  │    board() from display   │
 │ 3. Delete Focus Rooms tab │  │ 3. Remove groupRoomList & │
 │    button (line 907)      │  │    room creation listeners│
 │ 4. Delete Focus Rooms     │  │ 4. Remove renderGroup-    │
 │    panel (lines 934-957)  │  │    Rooms() from group tab │
 └───────────────────────────┘  └───────────────────────────┘
```

#### Detailed Step-by-Step Implementation

1. **`app/templates/app.html`**:
   - Locate and delete the Leaderboard nav item (`<button class="nav-link" type="button" data-section="leaderboard" ...>`).
   - Locate and delete `<section class="app-section" id="leaderboard">...</section>`.
   - In `<div class="group-tabs" id="group-tabs">`, delete `<button type="button" class="group-tab" data-group-tab="rooms">Focus Rooms</button>`.
   - In group tab panels, delete `<div class="group-tab-panel" id="group-tab-rooms">...</div>`.

2. **`app/static/js/script.js`**:
   - Remove `leaderboardTable` and `leaderboardTabs` constants, or make them safe against nulls.
   - Remove `renderLeaderboard()` call from `updateAllDisplays()`.
   - Remove the `leaderboardTabs.forEach(...)` listener.
   - Remove `groupRoomList`, `createRoomButton`, `groupRoomLive`, and `leaveRoomButton` DOM bindings or guard them.
   - Remove `renderGroupRooms(circle)` call from `renderGroupWorkspace()` and remove `${circle.rooms.length} rooms` from the header metadata badge.
   - Ensure `appData.selectedCircleTab` defaults to `"overview"` if previously set to `"rooms"`.

3. **Verification**:
   - Run `node --check app/static/js/script.js` to ensure zero syntax errors.
   - Run `compile_applet` to confirm the applet builds without issue.
   - Test tab switching across all remaining sidebar tabs (Home, Focus, Plan, Calendar, Exams, Insights, Common Library, Groups, Settings).
