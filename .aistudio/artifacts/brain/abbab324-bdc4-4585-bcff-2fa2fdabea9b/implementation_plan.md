# Implementation Plan: Complete Overhaul of Cozy Library & Virtual Study Space

## User Requirements & Architectural Goals

1. **Header & Navigation Cleanup** [COMPLETED]:
   - Removed "VIRTUAL STUDY SPACE", static room descriptions, and cluttered headers.
   - Dynamic title: Displays strictly `"[Group Name] — Library"` (e.g. "Deep Work Club — Library"), syncing with active group selection.
   - Unified pill switcher: `[ Desks ]` & `[ Study Call (VC) ]`.
   - Fullscreen button (⛶) in the top-right corner activating `requestFullscreen()` on the library container to immerse the user and hide outer app bars.
2. **3D Spatial Architecture (No More Flat Grids or Green Cards)** [COMPLETED]:
   - Completely eliminated flat parallel rows, classroom card grids, and rectangular green box borders.
   - Layered 3D spatial room structure (`#cozy-library-room`) with:
     - **Back Wall**: Arched rainy window with falling raindrops, mahogany tall bookshelves, and fireplace alcove with flickering fire.
     - **Floor Plane**: Hardwood perspective floor with wooden textures and soft contact shadows.
     - **4 Physical Spatial Zones**:
       - Zone 1 (Back-Left): Window Nook (Desks 1-2, scale 0.9x)
       - Zone 2 (Back-Right): Fireplace Alcove (Desks 3-4, scale 0.9x)
       - Zone 3 (Mid-ground): Central Communal Table (Desks 5-6, scale 1.0x)
       - Zone 4 (Foreground): Quiet Corner Desk (Desks 7-8, scale 1.05x)
3. **Cozy, Non-AI Character Avatars** [COMPLETED]:
   - User's circular avatar sits directly in the chair behind each wooden desk.
   - Active study state:
     - Warm radial lamp glow emitting onto desk and floor (`box-shadow: 0 0 24px rgba(255, 214, 138, 0.35)`).
     - Minimalist label directly below desk: `[FirstName] • [Timer]m` with pulsing green dot (`●`).
     - Tooltip on hover/tap: Floating parchment paper note showing full details (Subject/Topic, Activity: 📖 Reading / 💻 Typing / ☕ Coffee). Room remains clean when unhovered.
   - Empty desks: Clean desk illustration with subtle ghosted `+ Sit` button.
4. **Seamless In-Canvas Video Call (VC)** [COMPLETED]:
   - Smoothly swaps the desk canvas for video tiles inside the **exact same viewport** (`#cozy-library-stage`).
   - Dark, focused grid filling the viewport without vertical scrolling.
5. **Integrated Bottom Glass Dock & Slide-Out Drawer** [COMPLETED]:
   - Floating glass dock at the bottom of the canvas:
     - Soundscape selector & volume slider
     - Synchronized room timer (`24:50` + play/pause)
     - Mic toggle button
     - Camera toggle button
     - Slide-out Chat & Sticky Notes drawer button (with unread badge)
     - Leave Seat button (when seated)
   - Slide-out glass drawer: Slides in over the canvas on demand for Room Chat and Sticky Notes corkboard.

---

## Changes Implemented

### 1. Templates (`app/templates/app.html`)
- Replaced the library header with `.library-top-bar` featuring `#library-group-title`, `.library-pill-switcher` (`#btn-view-desks` and `#btn-view-vc`), and `#btn-library-fullscreen`.
- Replaced the desk grid container with `#cozy-library-stage` containing `#cozy-library-room` (room backwall, bookcases, arched rain window, stone fireplace, hardwood floor plane with 4 spatial zone slots `#slot-zone-1`..`#slot-zone-4`) and `#library-vc-viewport` (in-canvas WebRTC grid).
- Built `#library-glass-dock` containing soundscape controls, sync timer, mic/cam/screen toggles, drawer button, and leave seat button.
- Added `#library-slide-drawer` with tabs for Room Chat and Sticky Notes corkboard.
- Updated `#desk-action-modal` with subject, goal, lamp, and posture selectors.

### 2. Styles (`app/static/css/style.css`)
- Styled `:fullscreen` mode (100vw, 100vh, hidden chrome).
- Built 3D spatial room backwall (grand bookcases, mahogany ladder, gothic arched window with animated rain-fall, stone fireplace with flickering fire).
- Built hardwood floor with perspective, Persian rug, and 4 physical room zones (`.zone-window-nook`, `.zone-fireplace-alcove`, `.zone-communal-center`, `.zone-foreground-quiet`).
- Styled `.spatial-desk-station` with carved wooden table, Banker's emerald lamp with warm radial glow (`0 0 24px rgba(255, 214, 138, 0.35)`), seated circular character avatar, minimalist caption (`FirstName • Timer ●`), and floating parchment paper note tooltip on hover with cheer reactions.
- Styled ghosted `+ Sit` button on empty desks.
- Built in-canvas VC viewport `.cozy-vc-viewport` filling the same stage viewport.
- Styled translucent glass dock `.library-bottom-dock` and slide-out glass drawer `.library-slide-drawer`.

### 3. JavaScript (`app/static/js/script.js`)
- Wired `updateLibraryGroupTitle()` to dynamically display `[Active Group Name] — Library`.
- Wired `#btn-library-fullscreen` to trigger `requestFullscreen()` on `#cozy-library`.
- Implemented `createSpatialDeskStation(desk, currentUserId)` and updated `renderLibraryDesks()` to map desks into the 4 physical zones.
- Updated `switchLibraryView("desks" | "vc")` to smoothly toggle between `#cozy-library-room` and `#library-vc-viewport` in the exact same viewport.
- Wired bottom dock controls (soundscapes, timer play/pause, mic, cam, screen share, leave seat, drawer toggle).
- Wired slide-out glass drawer with unread chat badge and tab switching.

---

## Verification
- `node --check server.js` and `node --check app/static/js/script.js` passed with 0 errors.
- `compile_applet` passed successfully.
- `lint_applet` passed with 0 errors.
- Dev server restarted and confirmed healthy via `curl http://localhost:3000/api/library/room`.
