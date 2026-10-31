# Exam Workspace AI Roadmap, Timed Mock Exam Simulator & Cozy Library PIP Video Call

An overhaul of the Exam Workspace with interactive hierarchical syllabus management, AI study plan generation, timed mock exams with instant AI auto-grading, mistake logging, and a standalone Cozy Library video call experience supporting Picture-in-Picture (PiP).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification:
> - **Test Analysis, Mocks & Practice Questions Location**: Integrated directly as sub-tabs inside each **Exam Workspace** (`Syllabus`, `Plan & Roadmap`, `Mock Tests & Practice`, `Test Analysis & Mistakes`).
> - **Mock Test & Analysis Scope**:
>   1. **AI Mock Test & Practice Question Generator** (custom topic/difficulty, timed test runner with immediate AI auto-grading and step-by-step solutions).
>   2. **Score Tracker & Weak-Topic Radar** (accuracy %, speed per question, subject strengths vs. gaps).
>   3. **Mistake Log** (tag errors by type: *Silly Error*, *Conceptual Gap*, *Time Pressure*, or *Formula Slip* with AI revision tips).
> - **Cozy Library VC & Picture-in-Picture (PiP)**:
>   - Joining/leaving the Voice & Video Call is **independent of sitting on a desk**. Users can join a study call without taking a desk seat or sit on a desk without being on a video call.
>   - Modern Video Call interface with grid view, floating call control bar, camera/mic toggle, screen share, and a **Picture-in-Picture (PiP)** floating video window so users can keep study partners visible while navigating other tabs or writing notes.

---

## 1. Overview & Core Concept

1. **Hierarchical Syllabus Management**:
   - Clean 3-level structure: **Subject ➔ Units / Chapters ➔ Topics** with 4-stage revision pills (`Not Started`, `Studied`, `Revision 1`, `Mastered`).
   - Dedicated buttons for **Add Subject**, **Add Chapter**, **Add Topic**, **Rename**, and **Delete** with clean prompt/inline editing.
   - **Load Built-in Syllabus** populates curated exam blueprints on demand.
   - **AI Search & Load Syllabus** (`POST /api/exams/ai-syllabus`) dynamically retrieves official unit topics via Google Search grounded Gemini AI.

2. **AI Study Plan & Roadmap Generator**:
   - Endpoint (`POST /api/exams/ai-plan`) creates a personalized phased preparation roadmap (e.g., *Phase 1: Foundation*, *Phase 2: High-Weightage Drills*, *Phase 3: Full Mocks & Revision*).
   - Includes **One-Click Sync** to push generated milestones and daily revision tasks straight into `Today's Plan` and `Calendar`.

3. **Timed Mock Exam Simulator & Test Analysis**:
   - Timed exam runner with countdown timer, question palette, question flagging, and instant AI grading (`POST /api/exams/ai-mock`).
   - Detailed score card: percentage, accuracy, time per question, and AI recommendations.
   - Mistake Logger allowing students to tag wrong questions by error category (*Silly Error*, *Conceptual Gap*, *Time Pressure*) and review weak concepts.

4. **Cozy Library Standalone Call & Picture-in-Picture**:
   - Decoupled VC session from physical desk occupancy.
   - Floating video canvas with HTML Video Picture-in-Picture API support (`video.requestPictureInPicture()`) allowing the user's call partner stream or grid to stay active on-screen anywhere in the browser.

---

## 2. User Experience & Visual Design

### Exam Workspace Layout & Sub-Tabs
- **Workspace Navigation**:
  - `Overview` ➔ Exam countdown card, target date, subject completion summary.
  - `Syllabus` ➔ Interactive 3-level tree (Subject ➔ Unit ➔ Topics) with revision stage pills, `+ Subject`, `+ Chapter`, `+ Topic`, `Rename`, `Delete`, `Load Built-In Syllabus`, `✦ AI Search & Load Syllabus`.
  - `Plan & Roadmap` ➔ AI Plan generator button (`✦ Generate AI Study Plan`), phased roadmap timeline, milestones, and `+ Today's Plan` sync actions.
  - `Mock Tests & Practice` ➔ AI Mock Generator (`Length`, `Difficulty`, `Subject/Unit Filter`), active timed exam interface with countdown timer and question navigator, instant auto-grading report.
  - `Test Analysis & Mistakes` ➔ Historical test scores, subject accuracy chart, weak-topic radar, and filterable Mistake Log (*Silly Error*, *Conceptual Gap*, *Time Pressure*).

### Cozy Library Call UI
- **Call Control Bar**: Floating pill bar at the bottom containing Mic toggle, Camera toggle, Screen Share, Grid/Focus view switcher, **Picture-in-Picture (PiP) toggle button**, and Leave Call.
- **PiP Behavior**: Clicking the PiP icon transfers the active remote video stream or call canvas to the native browser Picture-in-Picture window.

---

## 3. Key Product Decisions & Trade-Offs

1. **In-Workspace Mock Simulator vs. Standalone Page**:
   - *Chosen*: Integrated as a dedicated tab within each Exam Workspace.
   - *Why*: Keeps test performance and mistake logs closely tied to the target exam's syllabus and study roadmap.

2. **Decoupled Library Call vs. Mandatory Desk Occupancy**:
   - *Chosen*: Decouple VC joining/leaving from desk occupancy in `script.js`.
   - *Why*: Students often want to join a casual study voice call with group members without taking up a physical desk slot in the 3D room.

3. **Client Canvas PiP / HTML Video PiP**:
   - *Chosen*: Use standard HTML5 Video `requestPictureInPicture()` for the active peer video or composite video element in Chrome/Edge/Firefox, with graceful fallback.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            STUDYMATE FRONTEND                               │
├───────────────────┬────────────────────────┬────────────────────────────────┤
│  Exam Workspace   │  Mock Test Simulator   │    Cozy Library Video Call     │
│  - Syllabus Tree  │  - Timed Question Test │  - Modern Call Grid & Controls  │
│  - AI Plan & Sync │  - AI Auto-Grading     │  - Picture-in-Picture (PiP)    │
│  - Stage Revision │  - Mistake Log Tracker │  - Desk Unbound Standalone VC   │
└─────────┬─────────┴───────────┬────────────┴───────────────┬────────────────┘
          │                     │                            │
          ▼                     ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND ROUTES (Python)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  POST /api/exams/ai-syllabus ➔ Gemini 3.8 Flash + Google Search Grounding    │
│  POST /api/exams/ai-plan     ➔ Gemini 3.8 Flash Phased Plan & Daily Tasks   │
│  POST /api/exams/ai-mock     ➔ Gemini 3.8 Flash Question & Solution Generator│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Schema Extensions (`appData.exams[i]`)
- `mockTests`: Array of `{ id, title, durationMinutes, totalQuestions, score, totalMarks, accuracyPercent, dateCompleted, questions: [{ id, text, options, answer, explanation, userChoice, isCorrect, errorTag }] }`
- `mistakes`: Array of `{ id, mockId, questionText, subjectName, chapterName, userChoice, correctChoice, errorTag, notes, dateLogged }`
- `aiPlan`: `{ generatedAt, phasedRoadmap: [{ phaseName, duration, objectives, suggestedTasks: [] }] }`

---

## Implementation Steps

1. **Backend Endpoints (`app/api/routes.py`)**:
   - Verify `POST /api/exams/ai-syllabus`.
   - Add `POST /api/exams/ai-plan` (generates phased roadmap & daily tasks from subject list & days left).
   - Add `POST /api/exams/ai-mock` (generates structured multiple choice questions with options & explanations).

2. **Frontend Exam Workspace UI (`app/templates/app.html` & `app/static/js/script.js`)**:
   - Fix **Load Built-In Syllabus** to populate curated subjects/chapters/topics when clicked.
   - Fix **Add Subject**, **Add Chapter**, **Add Topic**, **Rename**, and **Delete** actions across all 3 hierarchy levels.
   - Add `Plan & Roadmap` tab with `✦ Generate AI Study Plan` button and roadmap timeline.
   - Add `Mock Tests & Practice` tab with Mock Generator, Timed Exam Runner, and auto-grader.
   - Add `Test Analysis & Mistakes` tab with Score Tracker and Mistake Logger.

3. **Cozy Library VC Uncoupling & Picture-in-Picture (`script.js` & `app.html`)**:
   - Update `joinVC()` and `leaveVC()` so joining or leaving the call is independent of sitting on a 3D desk.
   - Add PiP button to `#vc-call-controls` that invokes `videoElement.requestPictureInPicture()` on the active video stream.

4. **Verification & Testing**:
   - Validate JS syntax with `node --check`.
   - Compile and verify dev server health.
