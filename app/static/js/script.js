const STORAGE_KEY = "studymate-app-v4";
const OLD_STORAGE_KEYS = ["studymate-app-v3", "studymate-app-v2", "studymate-dashboard"];

const themes = [
  { id: "midnight", name: "Midnight Black", accent: "#8b6cff", secondaryAccent: "#35d4ff" },
  { id: "amoled", name: "AMOLED Black", accent: "#f8fafc", secondaryAccent: "#00f5a0" },
  { id: "ocean", name: "Ocean Blue", accent: "#38bdf8", secondaryAccent: "#2dd4bf" },
  { id: "nebula", name: "Purple Nebula", accent: "#a78bfa", secondaryAccent: "#f472b6" },
  { id: "forest", name: "Forest Green", accent: "#34d399", secondaryAccent: "#bef264" },
  { id: "sakura", name: "Sakura Pink", accent: "#f9a8d4", secondaryAccent: "#fb7185" },
  { id: "coffee", name: "Warm Coffee", accent: "#f59e0b", secondaryAccent: "#fbbf24" },
  { id: "light", name: "Minimal Light", accent: "#2563eb", secondaryAccent: "#14b8a6" }
];

const studyMateUser = window.STUDYMATE_USER || {};

const timerModes = [
  { id: "stopwatch", name: "Stopwatch", description: "Count up while you study.", focusMinutes: null, breakMinutes: 0 },
  { id: "pomodoro", name: "Pomodoro", description: "25 minutes focus, then a 5 minute break.", focusMinutes: 25, breakMinutes: 5 },
  { id: "deep-focus", name: "Deep Focus", description: "50 minutes focus, then a 10 minute break.", focusMinutes: 50, breakMinutes: 10 },
  { id: "custom", name: "Custom Timer", description: "Choose your own focus and break duration.", focusMinutes: 30, breakMinutes: 0 }
];

const examPresets = [
  { category: "Engineering", name: "JEE Main", subjects: ["Physics", "Chemistry", "Mathematics"] },
  { category: "Engineering", name: "JEE Advanced", subjects: ["Physics", "Chemistry", "Mathematics"] },
  { category: "Engineering", name: "GUJCET", subjects: ["Physics", "Chemistry", "Mathematics / Biology"] },
  { category: "Engineering", name: "BITSAT", subjects: ["Physics", "Chemistry", "Mathematics", "English"] },
  { category: "Engineering", name: "MHT CET", subjects: ["Physics", "Chemistry", "Mathematics"] },
  { category: "Medical", name: "NEET UG", subjects: ["Physics", "Chemistry", "Botany", "Zoology"] },
  { category: "University / Competitive", name: "CUET UG", subjects: [] },
  { category: "University / Competitive", name: "GATE", subjects: [] },
  { category: "University / Competitive", name: "CAT", subjects: ["Quantitative Aptitude", "DILR", "VARC"] },
  { category: "School", name: "Class 10 Boards", subjects: [] },
  { category: "School", name: "Class 12 Boards", subjects: [] },
  { category: "College", name: "Semester Exam", subjects: [] },
  { category: "College", name: "Internal Test", subjects: [] },
  { category: "Other", name: "Custom Exam", subjects: [] }
];

const menuToggle = document.getElementById("menu-toggle");
const navButtons = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");
const appLoader = document.getElementById("app-loader");

const todayDate = document.getElementById("today-date");
const dashboardGreeting = document.getElementById("dashboard-greeting");
const homeActiveSubject = document.getElementById("home-active-subject");
const homeActiveStatus = document.getElementById("home-active-status");
const homeSessionStart = document.getElementById("home-session-start");
const homeSessionElapsed = document.getElementById("home-session-elapsed");
const homeContinueSession = document.getElementById("home-continue-session");
const homeOpenSession = document.getElementById("home-open-session");
const homeGoalPercent = document.getElementById("home-goal-percent");
const homeGoalHours = document.getElementById("home-goal-hours");
const homeGoalBar = document.getElementById("home-goal-bar");
const homeGoalCopy = document.getElementById("home-goal-copy");
const homeTotalTime = document.getElementById("home-total-time");
const homeStreak = document.getElementById("home-streak");
const homeSubjectList = document.getElementById("home-subject-list");
const homeTaskPreview = document.getElementById("home-task-preview");
const homeDaySummary = document.getElementById("home-day-summary");
const homeActiveCopy = document.getElementById("home-active-copy");
const homeSessionMode = document.getElementById("home-session-mode");
const homeSubjectSelect = document.getElementById("home-subject-select");
const homeTaskCount = document.getElementById("home-task-count");
const homeOpenPlan = document.getElementById("home-open-plan");
const homeNextExam = document.getElementById("home-next-exam");
const homeWeekPreview = document.getElementById("home-week-preview");

const sessionStatus = document.getElementById("session-status");
const focusWorkspace = document.getElementById("focus-workspace");
const focusSetup = document.getElementById("focus-setup");
const focusActive = document.getElementById("focus-active");
const focusComplete = document.getElementById("focus-complete");
const focusOptionalSetup = document.getElementById("focus-optional-setup");
const preSessionDisplay = document.getElementById("pre-session-display");
const sessionDisplay = document.getElementById("session-display");
const sessionProgressBar = document.getElementById("session-progress-bar");
const timerModePrev = document.getElementById("timer-mode-prev");
const timerModeNext = document.getElementById("timer-mode-next");
const timerModeTitle = document.getElementById("timer-mode-title");
const timerModeDescription = document.getElementById("timer-mode-description");
const timerModeIndicators = document.getElementById("timer-mode-indicators");
const preSessionModeMeta = document.getElementById("pre-session-mode-meta");
const customTimerSettings = document.getElementById("custom-timer-settings");
const customFocusInput = document.getElementById("custom-focus-input");
const customBreakInput = document.getElementById("custom-break-input");
const sessionSubjectSelect = document.getElementById("session-subject-select");
const sessionGoalInput = document.getElementById("session-goal-input");
const openSubjectModalButton = document.getElementById("open-subject-modal");
const subjectModal = document.getElementById("subject-modal");
const closeSubjectModalButton = document.getElementById("close-subject-modal");
const sessionPhaseLabel = document.getElementById("session-phase-label");
const sessionActiveSubject = document.getElementById("session-active-subject");
const sessionActiveGoal = document.getElementById("session-active-goal");
const sessionModePill = document.getElementById("session-mode-pill");
const sessionPhaseCopy = document.getElementById("session-phase-copy");
const sessionNextPhase = document.getElementById("session-next-phase");
const sessionStartButton = document.getElementById("session-start");
const sessionPauseButton = document.getElementById("session-pause");
const sessionResetButton = document.getElementById("session-reset");
const sessionSkipButton = document.getElementById("session-skip");
const sessionFinishButton = document.getElementById("session-finish");
const focusGoalProgress = document.getElementById("focus-goal-progress");
const focusSessionCount = document.getElementById("focus-session-count");
const openDistractionModalButton = document.getElementById("open-distraction-modal");
const focusDistractionModal = document.getElementById("focus-distraction-modal");
const closeFocusDistractionButton = document.getElementById("close-focus-distraction");
const focusDistractionForm = document.getElementById("focus-distraction-form");
const focusDistractionCategory = document.getElementById("focus-distraction-category");
const focusDistractionNote = document.getElementById("focus-distraction-note");
const completeSessionTitle = document.getElementById("complete-session-title");
const completeSessionSummary = document.getElementById("complete-session-summary");
const goalResultOptions = document.getElementById("goal-result-options");
const sessionReviewNote = document.getElementById("session-review-note");
const saveSessionReviewButton = document.getElementById("save-session-review");
const startAnotherSessionButton = document.getElementById("start-another-session");
const sessionTotalToday = document.getElementById("session-total-today");
const sessionSubjectBreakdown = document.getElementById("session-subject-breakdown");
const recentSessionList = document.getElementById("recent-session-list");
const historyTabs = document.querySelectorAll(".history-tab");
const subjectForm = document.getElementById("subject-form");
const subjectInput = document.getElementById("subject-input");
const intentionForm = document.getElementById("intention-form");
const intentionInput = document.getElementById("intention-input");
const intentionCount = document.getElementById("intention-count");

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskDateInput = document.getElementById("task-date-input");
const taskSubjectInput = document.getElementById("task-subject-input");
const taskRepeatInput = document.getElementById("task-repeat-input");
const pendingTaskList = document.getElementById("pending-task-list");
const completedTaskList = document.getElementById("completed-task-list");
const openTaskModalButton = document.getElementById("open-task-modal");
const closeTaskModalButton = document.getElementById("close-task-modal");
const taskModal = document.getElementById("task-modal");
const completedTaskSummary = document.getElementById("completed-task-summary");
const completedTaskDetails = document.getElementById("completed-task-details");
const planDateLabel = document.getElementById("plan-date-label");
const planTaskSummary = document.getElementById("plan-task-summary");
const planSummaryGoal = document.getElementById("plan-summary-goal");
const planSummaryPlanned = document.getElementById("plan-summary-planned");
const planSummaryDone = document.getElementById("plan-summary-done");
const planGoalProgress = document.getElementById("plan-goal-progress");
const planGoalCopy = document.getElementById("plan-goal-copy");
const planGoalBar = document.getElementById("plan-goal-bar");

const goalForm = document.getElementById("goal-form");
const goalInput = document.getElementById("goal-input");
const goalDisplay = document.getElementById("goal-display");
const goalDecreaseButton = document.getElementById("goal-decrease");
const goalIncreaseButton = document.getElementById("goal-increase");
const plannerPrev = document.getElementById("planner-prev");
const plannerNext = document.getElementById("planner-next");
const plannerMonthLabel = document.getElementById("planner-month-label");
const calendarGrid = document.getElementById("calendar-grid");
const selectedDateLabel = document.getElementById("selected-date-label");
const plannerForm = document.getElementById("planner-form");
const plannerTypeInput = document.getElementById("planner-type-input");
const plannerTitleInput = document.getElementById("planner-title-input");
const plannerItems = document.getElementById("planner-items");

const analyticsTabs = document.querySelectorAll(".analytics-tab");
const insightsContent = document.getElementById("insights-content");
const leaderboardTable = document.getElementById("leaderboard-table");
const leaderboardTabs = document.querySelectorAll(".leaderboard-tab");

const openExamModalButton = document.getElementById("open-exam-modal");
const closeExamModalButton = document.getElementById("close-exam-modal");
const examModal = document.getElementById("exam-modal");
const examPresetStep = document.getElementById("exam-preset-step");
const examPresetList = document.getElementById("exam-preset-list");
const examBackToPresets = document.getElementById("exam-back-to-presets");
const examForm = document.getElementById("exam-form");
const selectedExamLabel = document.getElementById("selected-exam-label");
const customExamNameField = document.getElementById("custom-exam-name-field");
const examNameInput = document.getElementById("exam-name-input");
const examDateInput = document.getElementById("exam-date-input");
const examTitleInput = document.getElementById("exam-title-input");
const examSubjectsInput = document.getElementById("exam-subjects-input");
const examList = document.getElementById("exam-list");
const examCountLabel = document.getElementById("exam-count-label");
const examListView = document.getElementById("exam-list-view");
const examWorkspace = document.getElementById("exam-workspace");
const backToExamsButton = document.getElementById("back-to-exams");
const examWorkspaceType = document.getElementById("exam-workspace-type");
const examWorkspaceTitle = document.getElementById("exam-workspace-title");
const examWorkspaceCountdown = document.getElementById("exam-workspace-countdown");
const editExamButton = document.getElementById("edit-exam-button");
const deleteExamButton = document.getElementById("delete-exam-button");
const examTabs = document.querySelectorAll(".exam-tab");
const examTabPanels = document.querySelectorAll(".exam-tab-panel");

const distractionForm = document.getElementById("distraction-form");
const distractionCategory = document.getElementById("distraction-category");
const distractionInput = document.getElementById("distraction-input");
const distractionList = document.getElementById("distraction-list");

const themeGrid = document.getElementById("theme-grid");
const accentInput = document.getElementById("accent-input");
const saveAccentButton = document.getElementById("save-accent");
const resetAccentButton = document.getElementById("reset-accent");

const createGroupButton = document.getElementById("create-group-button");
const joinGroupButton = document.getElementById("join-group-button");
const groupsPageHeader = document.getElementById("groups-page-header");
const groupsListView = document.getElementById("groups-list-view");
const groupWorkspace = document.getElementById("group-workspace");
const groupCardList = document.getElementById("group-card-list");
const groupCountLabel = document.getElementById("group-count-label");
const backToGroupsButton = document.getElementById("back-to-groups");
const groupWorkspaceIcon = document.getElementById("group-workspace-icon");
const groupWorkspaceName = document.getElementById("group-workspace-name");
const groupWorkspaceDescription = document.getElementById("group-workspace-description");
const groupWorkspaceMeta = document.getElementById("group-workspace-meta");
const groupInviteButton = document.getElementById("group-invite-button");
const groupSettingsButton = document.getElementById("group-settings-button");
const groupTabs = document.querySelectorAll(".group-tab");
const groupTabPanels = document.querySelectorAll(".group-tab-panel");
const groupStudyingNow = document.getElementById("group-studying-now");
const groupOverviewSummary = document.getElementById("group-overview-summary");
const groupCurrentChallenge = document.getElementById("group-current-challenge");
const groupActivityList = document.getElementById("group-activity-list");
const createRoomButton = document.getElementById("create-room-button");
const groupRoomList = document.getElementById("group-room-list");
const groupRoomLive = document.getElementById("group-room-live");
const createChallengeButton = document.getElementById("create-challenge-button");
const challengeStatusFilters = document.getElementById("challenge-status-filters");
const challengeListView = document.getElementById("challenge-list-view");
const challengeDetailView = document.getElementById("challenge-detail-view");
const challengeDetailContent = document.getElementById("challenge-detail-content");
const backToChallengesButton = document.getElementById("back-to-challenges");
const groupChallengeList = document.getElementById("group-challenge-list");
const groupMemberList = document.getElementById("group-member-list");
const groupRankingFilters = document.getElementById("group-ranking-filters");
const groupRankingList = document.getElementById("group-ranking-list");
const groupModal = document.getElementById("group-modal");
const groupModalTitle = document.getElementById("group-modal-title");
const closeGroupModalButton = document.getElementById("close-group-modal");
const groupForm = document.getElementById("group-form");
const groupNameInput = document.getElementById("group-name-input");
const groupIconInput = document.getElementById("group-icon-input");
const groupDescriptionInput = document.getElementById("group-description-input");
const groupPrivacyInput = document.getElementById("group-privacy-input");
const saveGroupButton = document.getElementById("save-group-button");
const deleteGroupButton = document.getElementById("delete-group-button");
const joinGroupModal = document.getElementById("join-group-modal");
const closeJoinGroupModalButton = document.getElementById("close-join-group-modal");
const joinGroupForm = document.getElementById("join-group-form");
const joinCodeInput = document.getElementById("join-code-input");
const joinGroupMessage = document.getElementById("join-group-message");
const inviteModal = document.getElementById("invite-modal");
const closeInviteModalButton = document.getElementById("close-invite-modal");
const inviteCodeDisplay = document.getElementById("invite-code-display");
const copyInviteButton = document.getElementById("copy-invite-button");
const inviteCopyMessage = document.getElementById("invite-copy-message");
const roomModal = document.getElementById("room-modal");
const closeRoomModalButton = document.getElementById("close-room-modal");
const roomForm = document.getElementById("room-form");
const roomNameInput = document.getElementById("room-name-input");
const roomSubjectInput = document.getElementById("room-subject-input");
const roomMaxInput = document.getElementById("room-max-input");
const roomPrivacyInput = document.getElementById("room-privacy-input");
const activeRoomName = document.getElementById("active-room-name");
const activeRoomDescription = document.getElementById("active-room-description");
const activeRoomSubject = document.getElementById("active-room-subject");
const activeRoomTimer = document.getElementById("active-room-timer");
const activeRoomStatus = document.getElementById("active-room-status");
const activeRoomMembers = document.getElementById("active-room-members");
const roomStatusControls = document.getElementById("room-status-controls");
const leaveRoomButton = document.getElementById("leave-room-button");
const challengeModal = document.getElementById("challenge-modal");
const closeChallengeModalButton = document.getElementById("close-challenge-modal");
const challengeForm = document.getElementById("challenge-form");
const challengeStepLabel = document.getElementById("challenge-step-label");
const challengeSteps = document.querySelectorAll(".challenge-step");
const challengeFormatOptions = document.getElementById("challenge-format-options");
const challengeMetricOptions = document.getElementById("challenge-metric-options");
const challengeDurationOptions = document.getElementById("challenge-duration-options");
const challengeParticipantOptions = document.getElementById("challenge-participant-options");
const challengeParticipantHelp = document.getElementById("challenge-participant-help");
const challengeTitleInput = document.getElementById("challenge-title-input");
const challengeTargetInput = document.getElementById("challenge-target-input");
const challengeStartInput = document.getElementById("challenge-start-input");
const challengeEndInput = document.getElementById("challenge-end-input");
const challengePrevButton = document.getElementById("challenge-prev-button");
const challengeNextButton = document.getElementById("challenge-next-button");
const challengeCreateButton = document.getElementById("challenge-create-button");

let sessionTimerId = null;
let roomTimerId = null;
let appData = createDefaultData();
let selectedExamPreset = null;
let challengeDraft = createChallengeDraft();

function createDefaultData() {
  const generalSubject = createSubject("General Study");

  return {
    date: getTodayKey(),
    theme: "midnight",
    accentColor: null,
    sidebarCollapsed: false,
    studySeconds: 0,
    goalHours: 2,
    streak: 0,
    focusIntention: "",
    selectedSubjectId: generalSubject.id,
    sessionState: "pre-session",
    currentSessionDraft: { goal: "" },
    pendingSessionReview: null,
    timerModeIndex: 0,
    customFocusMinutes: 30,
    customBreakMinutes: 0,
    selectedHistoryRange: "today",
    selectedAnalyticsRange: "today",
    selectedLeaderboardRange: "today",
    selectedExamId: null,
    selectedExamTab: "overview",
    plannerMonth: new Date().getMonth(),
    plannerYear: new Date().getFullYear(),
    selectedPlannerDate: getTodayKey(),
    activeSession: null,
    tasks: [],
    subjects: [generalSubject],
    sessions: [],
    dailyHistory: {},
    plannerItems: [],
    exams: [],
    distractions: [],
    studyCircles: [createDefaultStudyCircle()],
    selectedCircleId: null,
    groupsView: "list",
    selectedCircleTab: "overview",
    selectedRankingRange: "today",
    selectedChallengeStatus: "active",
    selectedChallengeId: null,
    activeRoomId: null
  };
}

function createSubject(name) {
  return {
    id: createId(),
    name,
    seconds: 0
  };
}

function createDefaultStudyCircle() {
  return {
    id: createId(),
    name: "StudyMate Circle",
    icon: "SM",
    description: "A calm shared space for daily focus sessions and accountability.",
    inviteCode: generateInviteCode(),
    members: [
      { id: "you", name: "You", status: "Studying", subject: "General Study", totalSeconds: 0, streak: 0 },
      { id: "maya", name: "Maya", status: "Short Break", subject: "Physics", totalSeconds: 4200, streak: 3 },
      { id: "arif", name: "Arif", status: "Paused", subject: "DBMS", totalSeconds: 3000, streak: 2 }
    ],
    rooms: [],
    challenges: [],
    activity: []
  };
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDaysToDate(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function loadData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData) {
    appData = parseSavedData(savedData);
  } else {
    appData = loadOlderData();
  }

  normalizeData();

  if (appData.date !== getTodayKey()) {
    resetDailyData();
  }

  saveData();

  if (appData.activeSession && appData.sessionState !== "paused") {
    resumeSessionTimer();
  }
}

function loadOlderData() {
  for (const key of OLD_STORAGE_KEYS) {
    const oldData = localStorage.getItem(key);

    if (oldData) {
      return migrateOldData(oldData);
    }
  }

  return createDefaultData();
}

function parseSavedData(savedData) {
  try {
    return {
      ...createDefaultData(),
      ...JSON.parse(savedData)
    };
  } catch (error) {
    return createDefaultData();
  }
}

function migrateOldData(oldData) {
  try {
    const parsed = JSON.parse(oldData);
    const migrated = createDefaultData();

    migrated.theme = parsed.theme || migrated.theme;
    migrated.accentColor = parsed.accentColor || null;
    migrated.sidebarCollapsed = Boolean(parsed.sidebarCollapsed);
    migrated.studySeconds = Number(parsed.studySeconds || parsed.overallSeconds || parsed.completedSeconds || 0);
    migrated.goalHours = Number(parsed.goalHours || (parsed.goalMinutes ? parsed.goalMinutes / 60 : migrated.goalHours));
    migrated.streak = Number(parsed.streak || 0);
    migrated.focusIntention = parsed.focusIntention || "";
    migrated.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    migrated.sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
    migrated.dailyHistory = parsed.dailyHistory && typeof parsed.dailyHistory === "object" ? parsed.dailyHistory : {};
    migrated.distractions = Array.isArray(parsed.distractions) ? parsed.distractions : [];

    if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
      migrated.subjects = parsed.subjects.map(function (subject) {
        return {
          id: subject.id || createId(),
          name: subject.name || "Subject",
          seconds: Number(subject.seconds || 0)
        };
      });
      migrated.selectedSubjectId = migrated.subjects[0].id;
    }

    if (Array.isArray(parsed.studyCircles) && parsed.studyCircles.length > 0) {
      migrated.studyCircles = parsed.studyCircles;
      migrated.selectedCircleId = parsed.selectedCircleId || parsed.studyCircles[0].id;
      migrated.selectedCircleTab = parsed.selectedCircleTab || "overview";
      migrated.selectedRankingRange = parsed.selectedRankingRange || "today";
      migrated.selectedChallengeStatus = parsed.selectedChallengeStatus || "active";
      migrated.selectedChallengeId = parsed.selectedChallengeId || null;
      migrated.activeRoomId = parsed.activeRoomId || null;
    }

    return migrated;
  } catch (error) {
    return createDefaultData();
  }
}

function normalizeData() {
  if (!Array.isArray(appData.tasks)) appData.tasks = [];
  if (!Array.isArray(appData.subjects) || appData.subjects.length === 0) appData.subjects = [createSubject("General Study")];
  if (!Array.isArray(appData.sessions)) appData.sessions = [];
  if (!appData.dailyHistory || typeof appData.dailyHistory !== "object") appData.dailyHistory = {};
  if (!Array.isArray(appData.plannerItems)) appData.plannerItems = [];
  if (!Array.isArray(appData.exams)) appData.exams = [];
  if (!Array.isArray(appData.distractions)) appData.distractions = [];
  if (!Array.isArray(appData.studyCircles) || appData.studyCircles.length === 0) appData.studyCircles = [createDefaultStudyCircle()];

  appData.studySeconds = Number(appData.studySeconds) || 0;
  appData.goalHours = Number(appData.goalHours) || 2;
  appData.streak = Number(appData.streak) || 0;
  appData.focusIntention = appData.focusIntention || "";
  appData.sessionState = ["pre-session", "active", "paused", "break", "complete"].includes(appData.sessionState) ? appData.sessionState : "pre-session";
  appData.currentSessionDraft = appData.currentSessionDraft && typeof appData.currentSessionDraft === "object" ? appData.currentSessionDraft : { goal: "" };
  appData.currentSessionDraft.goal = appData.currentSessionDraft.goal || "";
  appData.pendingSessionReview = appData.pendingSessionReview && typeof appData.pendingSessionReview === "object" ? appData.pendingSessionReview : null;
  if (appData.activeSession && appData.sessionState === "pre-session") {
    appData.sessionState = appData.activeSession.phase === "break" ? "break" : "active";
  }
  appData.timerModeIndex = Number(appData.timerModeIndex) || 0;
  appData.timerModeIndex = appData.timerModeIndex % timerModes.length;
  appData.customFocusMinutes = Number(appData.customFocusMinutes) || 30;
  appData.customBreakMinutes = Number(appData.customBreakMinutes) || 0;
  appData.selectedHistoryRange = appData.selectedHistoryRange || "today";
  appData.selectedAnalyticsRange = appData.selectedAnalyticsRange || "today";
  appData.selectedLeaderboardRange = appData.selectedLeaderboardRange || "today";
  appData.groupsView = appData.groupsView === "workspace" ? "workspace" : "list";
  appData.selectedCircleTab = ["overview", "rooms", "challenges", "members", "ranking", "chat"].includes(appData.selectedCircleTab)
    ? appData.selectedCircleTab
    : "overview";
  appData.selectedRankingRange = ["today", "week", "month", "challenge"].includes(appData.selectedRankingRange)
    ? appData.selectedRankingRange
    : "today";
  appData.selectedChallengeStatus = ["active", "upcoming", "completed"].includes(appData.selectedChallengeStatus)
    ? appData.selectedChallengeStatus
    : "active";
  appData.selectedExamId = appData.selectedExamId || null;
  appData.selectedExamTab = appData.selectedExamTab || "overview";
  appData.plannerMonth = Number.isInteger(appData.plannerMonth) ? appData.plannerMonth : new Date().getMonth();
  appData.plannerYear = Number(appData.plannerYear) || new Date().getFullYear();
  appData.selectedPlannerDate = appData.selectedPlannerDate || getTodayKey();
  appData.selectedSubjectId = getSubjectById(appData.selectedSubjectId) ? appData.selectedSubjectId : appData.subjects[0].id;
  appData.tasks = appData.tasks.map(normalizeTask);
  appData.dailyHistory = normalizeDailyHistory(appData.dailyHistory);
  appData.distractions = appData.distractions.map(normalizeDistraction);
  appData.plannerItems = appData.plannerItems.map(normalizePlannerItem);
  appData.exams = appData.exams.map(normalizeExam);
  if (appData.selectedExamId && !getExamById(appData.selectedExamId)) appData.selectedExamId = null;
  appData.studyCircles = appData.studyCircles.map(normalizeCircle);
  if (appData.selectedChallengeId && !getChallengeById(appData.selectedChallengeId)) appData.selectedChallengeId = null;

  appData.selectedCircleId = null;
  appData.groupsView = "list";

  if (appData.activeRoomId && !getRoomById(appData.activeRoomId)) {
    appData.activeRoomId = null;
  }
}

function normalizeTask(task) {
  const repeat = task.repeat === "daily" ? "daily" : "never";
  const completedDates = Array.isArray(task.completedDates) ? task.completedDates : [];

  return {
    id: task.id || createId(),
    text: task.text || "Untitled task",
    completed: repeat === "daily" ? completedDates.includes(getTodayKey()) : Boolean(task.completed),
    date: task.date || "",
    subjectId: task.subjectId || "",
    repeat,
    completedDates
  };
}

function normalizeDailyHistory(history) {
  const normalized = {};
  Object.keys(history || {}).forEach(function (dateKey) {
    const entry = history[dateKey] || {};
    normalized[dateKey] = {
      studySeconds: Number(entry.studySeconds || 0),
      sessions: Number(entry.sessions || 0),
      subjectTotals: entry.subjectTotals && typeof entry.subjectTotals === "object" ? entry.subjectTotals : {},
      tasksCompleted: Number(entry.tasksCompleted || 0),
      tasksPlanned: Number(entry.tasksPlanned || 0),
      goalHours: Number(entry.goalHours || appData.goalHours || 2),
      distractions: Array.isArray(entry.distractions) ? entry.distractions : []
    };
  });
  return normalized;
}

function normalizeDistraction(entry) {
  return {
    id: entry.id || createId(),
    category: entry.category || "Other",
    reason: entry.reason || entry.note || "",
    time: entry.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: entry.date || appData.date || getTodayKey(),
    timestamp: entry.timestamp || new Date().toISOString(),
    sessionId: entry.sessionId || null
  };
}

function normalizePlannerItem(item) {
  return {
    id: item.id || createId(),
    date: item.date || getTodayKey(),
    type: item.type || "task",
    title: item.title || "Untitled plan"
  };
}

function normalizeExam(exam) {
  const flatTopics = Array.isArray(exam.topics) ? exam.topics : [];
  const rawSubjects = Array.isArray(exam.subjects) && exam.subjects.length > 0
    ? exam.subjects
    : [{ name: exam.subject || "General Study", topics: flatTopics }];

  return {
    id: exam.id || createId(),
    name: exam.name || "Untitled Exam",
    type: exam.type || "Custom Exam",
    date: exam.date || getTodayKey(),
    time: exam.time || "",
    notes: exam.notes || "",
    createdAt: exam.createdAt || new Date().toISOString(),
    milestones: Array.isArray(exam.milestones) ? exam.milestones.map(normalizeExamMilestone) : [],
    subjects: rawSubjects.map(normalizeExamSubject)
  };
}

function normalizeExamSubject(subject) {
  const subjectName = typeof subject === "string" ? subject : subject.name;
  const oldTopics = Array.isArray(subject.topics) ? subject.topics : [];
  const chapters = Array.isArray(subject.chapters) && subject.chapters.length > 0
    ? subject.chapters
    : oldTopics.length > 0 ? [{ name: "General", topics: oldTopics }] : [];

  return {
    id: subject.id || createId(),
    name: subjectName || "Subject",
    chapters: chapters.map(normalizeExamChapter)
  };
}

function normalizeExamChapter(chapter) {
  return {
    id: chapter.id || createId(),
    name: chapter.name || "Chapter",
    topics: Array.isArray(chapter.topics) ? chapter.topics.map(normalizeExamTopic) : []
  };
}

function normalizeExamTopic(topic) {
  if (typeof topic === "string") {
    return { id: createId(), name: topic, completed: false };
  }

  return {
    id: topic.id || createId(),
    name: topic.name || topic.title || "Topic",
    completed: Boolean(topic.completed)
  };
}

function normalizeExamMilestone(milestone) {
  return {
    id: milestone.id || createId(),
    title: milestone.title || "Milestone",
    subjectId: milestone.subjectId || "",
    dueDate: milestone.dueDate || "",
    completed: Boolean(milestone.completed)
  };
}

function normalizeCircle(circle) {
  const members = normalizeMembers(circle.members);
  return {
    id: circle.id || createId(),
    name: circle.name || "Untitled Circle",
    icon: (circle.icon || "SC").slice(0, 3).toUpperCase(),
    description: circle.description || "A shared StudyMate circle.",
    inviteCode: circle.inviteCode || generateInviteCode(),
    privacy: circle.privacy === "public" ? "public" : "private",
    members,
    rooms: normalizeRooms(circle.rooms),
    challenges: normalizeChallenges(circle.challenges, members),
    activity: normalizeGroupActivity(circle.activity),
    createdAt: circle.createdAt || new Date().toISOString()
  };
}

function normalizeMembers(members) {
  const normalized = Array.isArray(members) && members.length > 0 ? members : [];

  if (!normalized.some(function (member) { return member.id === "you"; })) {
    normalized.unshift({ id: "you", name: "You", status: "Paused", totalSeconds: appData.studySeconds || 0 });
  }

  return normalized.map(function (member) {
    return {
      id: member.id || createId(),
      name: member.name || "Student",
      status: member.status || "Paused",
      subject: member.subject || member.currentSubject || "General Study",
      totalSeconds: Number(member.totalSeconds || member.studySeconds || 0),
      streak: Number(member.streak || 0),
      tasksCompleted: Number(member.tasksCompleted || 0)
    };
  });
}

function normalizeRooms(rooms) {
  if (!Array.isArray(rooms)) return [];

  return rooms.map(function (room) {
    return {
      id: room.id || createId(),
      name: room.name || "Focus Room",
      icon: (room.icon || "FR").slice(0, 3).toUpperCase(),
      description: room.description || "A temporary focus session.",
      subject: room.subject || "General Study",
      maxMembers: Number(room.maxMembers) || 8,
      privacy: room.privacy === "private" ? "private" : "public",
      status: room.status || "Paused",
      elapsedSeconds: Number(room.elapsedSeconds || 0),
      statusStartedAt: room.statusStartedAt || null,
      members: normalizeRoomMembers(room.members)
    };
  });
}

function normalizeRoomMembers(members) {
  if (!Array.isArray(members)) return [];

  return members.map(function (member) {
    return {
      id: member.id || createId(),
      name: member.name || "Student",
      status: member.status || "Paused",
      subject: member.subject || "General Study",
      joinedAt: member.joinedAt || new Date().toISOString()
    };
  });
}

function normalizeChallenges(challenges, members) {
  if (!Array.isArray(challenges)) return [];

  return challenges.map(function (challenge) {
    const metric = challenge.metric || challenge.type || "study-time";
    const format = challenge.format || (challenge.type === "group-goal" ? "group-goal" : "solo");
    const normalized = {
      id: challenge.id || createId(),
      title: challenge.title || "Group Challenge",
      format,
      metric,
      target: Number(challenge.target || 1),
      unit: challenge.unit || getChallengeUnit(metric),
      startDate: challenge.startDate || getTodayKey(),
      endDate: challenge.endDate || addDaysToDate(getTodayKey(), 7),
      participantMode: challenge.participantMode || "all",
      participants: Array.isArray(challenge.participants) ? challenge.participants : ["you"],
      entries: Array.isArray(challenge.entries) ? challenge.entries : [],
      progress: Number(challenge.progress || 0),
      yourProgress: Number(challenge.yourProgress || 0),
      completedAt: challenge.completedAt || "",
      result: challenge.result || null,
      createdAt: challenge.createdAt || new Date().toISOString()
    };

    if (normalized.entries.length === 0) {
      normalized.entries = buildChallengeEntries(normalized, members || []);
    }

    return normalized;
  });
}

function buildChallengeEntries(challenge, members) {
  const activeMembers = members.length > 0 ? members : [{ id: "you", name: "You", totalSeconds: appData.studySeconds || 0, tasksCompleted: getCompletedTaskCount(), streak: appData.streak || 0 }];

  if (challenge.format === "group-goal") {
    return [{
      id: "group",
      name: "Group Total",
      memberIds: activeMembers.map(function (member) { return member.id; }),
      progress: getGroupMetricProgress(activeMembers, challenge.metric)
    }];
  }

  if (challenge.format === "duo") {
    return chunkMembers(activeMembers, 2).map(function (pair, index) {
      return {
        id: createId(),
        name: `Team ${index + 1}`,
        memberIds: pair.map(function (member) { return member.id; }),
        progress: getGroupMetricProgress(pair, challenge.metric)
      };
    });
  }

  if (challenge.format === "teams") {
    return chunkMembers(activeMembers, Math.max(2, Math.ceil(activeMembers.length / 2))).map(function (team, index) {
      return {
        id: createId(),
        name: `Team ${index + 1}`,
        memberIds: team.map(function (member) { return member.id; }),
        progress: getGroupMetricProgress(team, challenge.metric)
      };
    });
  }

  return activeMembers.map(function (member) {
    return {
      id: member.id,
      name: member.name,
      memberIds: [member.id],
      progress: getMemberMetricProgress(member, challenge.metric)
    };
  });
}

function chunkMembers(members, size) {
  const chunks = [];
  members.forEach(function (member, index) {
    const chunkIndex = Math.floor(index / size);
    if (!chunks[chunkIndex]) chunks[chunkIndex] = [];
    chunks[chunkIndex].push(member);
  });
  return chunks;
}

function normalizeGroupActivity(activity) {
  if (!Array.isArray(activity)) return [];

  return activity.slice(0, 12).map(function (item) {
    return {
      id: item.id || createId(),
      text: item.text || "Group activity",
      createdAt: item.createdAt || new Date().toISOString()
    };
  });
}

function syncDailyHistory(dateKey) {
  if (!dateKey) return;
  appData.dailyHistory[dateKey] = buildDailyHistoryEntry(dateKey);
}

function buildDailyHistoryEntry(dateKey) {
  const sessions = getSessionsForDate(dateKey);
  const subjectTotals = getSubjectTotalsFromSessions(sessions);
  const distractions = getDistractionsForDate(dateKey);
  const tasks = getTasksForDate(dateKey);
  const completedTasks = tasks.filter(function (task) {
    return isTaskCompletedOnDate(task, dateKey);
  });
  let studySeconds = getSecondsFromSessions(sessions);

  if (dateKey === getTodayKey()) {
    studySeconds = Math.max(studySeconds, appData.studySeconds);
    appData.subjects.forEach(function (subject) {
      if (subject.seconds > 0) subjectTotals[subject.name] = Math.max(subjectTotals[subject.name] || 0, subject.seconds);
    });
  }

  return {
    studySeconds,
    sessions: sessions.length,
    subjectTotals,
    tasksCompleted: completedTasks.length,
    tasksPlanned: tasks.length,
    goalHours: Number(appData.goalHours || 2),
    distractions
  };
}

function getSessionsForDate(dateKey) {
  return appData.sessions.filter(function (session) {
    return (session.date || getDateKeyFromDate(new Date(session.startedAt))) === dateKey;
  });
}

function getSubjectTotalsFromSessions(sessions) {
  return sessions.reduce(function (totals, session) {
    const subjectName = session.subjectName || getSubjectName(session.subjectId);
    totals[subjectName] = (totals[subjectName] || 0) + Number(session.durationSeconds || 0);
    return totals;
  }, {});
}

function getDistractionsForDate(dateKey) {
  return appData.distractions.filter(function (entry) {
    return (entry.date || appData.date || getTodayKey()) === dateKey;
  });
}

function getTasksForDate(dateKey) {
  return appData.tasks.filter(function (task) {
    if (task.repeat === "daily") return true;
    if (task.date) return task.date === dateKey;
    return dateKey === getTodayKey();
  });
}

function isTaskCompletedOnDate(task, dateKey) {
  if (task.repeat === "daily") {
    return Array.isArray(task.completedDates) && task.completedDates.includes(dateKey);
  }

  return Boolean(task.completed) && (!task.date || task.date === dateKey);
}

function resetDailyData() {
  syncDailyHistory(appData.date);
  appData.date = getTodayKey();
  appData.studySeconds = 0;
  appData.distractions = [];
  appData.subjects = appData.subjects.map(function (subject) {
    return { ...subject, seconds: 0 };
  });
  syncDailyHistory(getTodayKey());
}

function saveData() {
  syncDailyHistory(getTodayKey());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function showSection(sectionId) {
  sections.forEach(function (section) {
    section.classList.toggle("active", section.id === sectionId);
  });

  navButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
}

function formatLongTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

function formatShortTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours === 0 && minutes === 0 && safeSeconds > 0) return "<1m";
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function formatGoalHours(hours) {
  const totalMinutes = Math.round(Number(hours) * 60);
  const displayHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;

  if (displayHours === 0) return `${displayMinutes}m`;
  if (displayMinutes === 0) return `${displayHours}h`;
  return `${displayHours}h ${displayMinutes}m`;
}

function formatClockTime(dateString) {
  if (!dateString) return "Not started";
  return new Date(dateString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getSelectedTimerMode() {
  return timerModes[appData.timerModeIndex] || timerModes[0];
}

function getTimerFocusSeconds() {
  const mode = getSelectedTimerMode();
  const focusMinutes = mode.id === "custom" ? appData.customFocusMinutes : mode.focusMinutes;
  return focusMinutes ? focusMinutes * 60 : null;
}

function getTimerBreakSeconds() {
  const mode = getSelectedTimerMode();
  const breakMinutes = mode.id === "custom" ? appData.customBreakMinutes : mode.breakMinutes;
  return breakMinutes ? breakMinutes * 60 : 0;
}

function getDateKeyFromDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRangeStart(range) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (range === "week") {
    start.setDate(start.getDate() - 6);
  }

  if (range === "month") {
    start.setDate(1);
  }

  return start;
}

function getSessionsForRange(range) {
  const start = getRangeStart(range);
  return appData.sessions.filter(function (session) {
    return new Date(session.startedAt) >= start;
  });
}

function getTasksForRange(range) {
  if (range === "today") {
    return getTodayTasks();
  }

  const start = getRangeStart(range);
  return appData.tasks.filter(function (task) {
    if (!task.date) return true;
    return new Date(`${task.date}T00:00:00`) >= start;
  });
}

function isTaskCompletedToday(task) {
  if (task.repeat === "daily") {
    return Array.isArray(task.completedDates) && task.completedDates.includes(getTodayKey());
  }

  return Boolean(task.completed);
}

function isTaskVisibleToday(task) {
  if (task.repeat === "daily") return true;
  if (task.completed) return task.date === getTodayKey();
  if (!task.date) return true;
  return task.date <= getTodayKey();
}

function getTodayTasks() {
  return appData.tasks.filter(isTaskVisibleToday);
}

function getPendingTodayTasks() {
  return getTodayTasks().filter(function (task) {
    return !isTaskCompletedToday(task);
  });
}

function getCompletedTodayTasks() {
  return getTodayTasks().filter(isTaskCompletedToday);
}

function getNearestExam() {
  const today = getTodayKey();
  return appData.exams
    .filter(function (exam) { return exam.date >= today; })
    .sort(function (first, second) { return new Date(first.date) - new Date(second.date); })[0];
}

function getExamById(examId) {
  return appData.exams.find(function (exam) {
    return String(exam.id) === String(examId);
  });
}

function getSelectedExam() {
  return getExamById(appData.selectedExamId);
}

function getExamDaysLeft(dateKey) {
  const today = new Date(`${getTodayKey()}T00:00:00`);
  const examDate = new Date(`${dateKey}T00:00:00`);
  return Math.round((examDate - today) / 86400000);
}

function getExamStats(exam) {
  let totalTopics = 0;
  let completedTopics = 0;

  exam.subjects.forEach(function (subject) {
    subject.chapters.forEach(function (chapter) {
      chapter.topics.forEach(function (topic) {
        totalTopics += 1;
        if (topic.completed) completedTopics += 1;
      });
    });
  });

  const completedMilestones = exam.milestones.filter(function (milestone) {
    return milestone.completed;
  }).length;

  return {
    totalTopics,
    completedTopics,
    remainingTopics: Math.max(totalTopics - completedTopics, 0),
    progressPercent: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
    completedMilestones,
    totalMilestones: exam.milestones.length
  };
}

function getExamSubjectSummary(exam) {
  if (exam.subjects.length === 0) return "No subjects yet";
  if (exam.subjects.length <= 3) {
    return exam.subjects.map(function (subject) { return subject.name; }).join(" · ");
  }
  return `${exam.subjects.length} subjects`;
}

function getCountdownMessage(daysLeft) {
  if (daysLeft < 0) return "Exam completed";
  if (daysLeft <= 2) return "Keep it simple. Revise what matters most.";
  if (daysLeft <= 7) return "Prioritize high-value revision.";
  if (daysLeft <= 14) return "Time to get specific.";
  if (daysLeft <= 30) return "Focus on unfinished areas.";
  if (daysLeft <= 60) return "Good time to start tightening the plan.";
  return "Plenty of time. Build consistency.";
}

function getExamStatusLabel(daysLeft) {
  if (daysLeft < 0) return "Completed";
  if (daysLeft <= 7) return "Very close";
  if (daysLeft <= 14) return "Soon";
  if (daysLeft <= 30) return "Coming up";
  return "Plenty of time";
}

function getRangeLabel(range) {
  if (range === "week") return "This Week";
  if (range === "month") return "This Month";
  return "Today";
}

function getCompletedTaskCount() {
  return appData.tasks.filter(function (task) {
    return task.completed;
  }).length;
}

function getGoalPercent() {
  const goalSeconds = appData.goalHours * 3600;
  if (goalSeconds <= 0) return 0;
  return Math.min(Math.round((appData.studySeconds / goalSeconds) * 100), 100);
}

function getSecondsFromSessions(sessions) {
  return sessions.reduce(function (total, session) {
    return total + Number(session.durationSeconds || 0);
  }, 0);
}

function getSubjectName(subjectId) {
  const subject = getSubjectById(subjectId);
  return subject ? subject.name : "No subject";
}

function getSubjectById(subjectId) {
  return appData.subjects.find(function (subject) {
    return String(subject.id) === String(subjectId);
  });
}

function getSelectedSubject() {
  return getSubjectById(appData.selectedSubjectId) || appData.subjects[0];
}

function getSessionElapsedSeconds() {
  if (!appData.activeSession) return 0;
  if (appData.sessionState === "paused") return appData.activeSession.elapsedSeconds;
  return appData.activeSession.elapsedSeconds + Math.floor((Date.now() - new Date(appData.activeSession.startedAt).getTime()) / 1000);
}

function updateAllDisplays() {
  updateHome();
  updateSessionPage();
  updateGoal();
  updateInsights();
  renderSubjectOptions();
  renderTaskSubjectOptions();
  renderRecentSessions();
  renderPlanner();
  renderExams();
  renderLeaderboard();
}

function updateHome() {
  const pendingTasks = getPendingTodayTasks();
  const completedTasks = getCompletedTodayTasks();
  const selectedSubject = getSelectedSubject();
  const goalPercent = getGoalPercent();
  const greeting = getGreeting();
  const nearestExam = getNearestExam();
  const summaryParts = [
    `${pendingTasks.length} ${pendingTasks.length === 1 ? "task" : "tasks"} left today`,
    `${formatShortTime(appData.studySeconds)} studied`
  ];

  if (nearestExam) {
    summaryParts.push(`next exam ${getExamCountdown(nearestExam.date).toLowerCase()}`);
  }

  dashboardGreeting.textContent = `${greeting}, ${studyMateUser.displayName || "StudyMate learner"}`;
  todayDate.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  homeDaySummary.textContent = summaryParts.join(" - ");
  homeTotalTime.textContent = formatShortTime(appData.studySeconds);
  homeStreak.textContent = `${appData.streak}-day streak`;
  homeGoalPercent.textContent = `${goalPercent}%`;
  homeGoalHours.textContent = `of ${formatGoalHours(appData.goalHours)} goal`;
  homeGoalBar.style.width = `${goalPercent}%`;
  homeGoalCopy.textContent = `${formatShortTime(appData.studySeconds)} / ${formatGoalHours(appData.goalHours)}`;

  if (appData.activeSession) {
    homeActiveSubject.textContent = "Continue where you left off";
    homeActiveCopy.textContent = selectedSubject.name;
    homeActiveStatus.textContent = appData.activeSession.phase === "break" ? "Break" : "Running";
    homeSessionStart.textContent = appData.activeSession.mode;
    homeSessionMode.textContent = "";
    homeSessionElapsed.textContent = formatLongTime(getSessionElapsedSeconds());
    homeContinueSession.textContent = "Continue";
    homeSubjectSelect.disabled = true;
  } else {
    homeActiveSubject.textContent = "Ready to focus?";
    homeActiveCopy.textContent = "Choose what you want to study today.";
    homeActiveStatus.textContent = "";
    homeSessionStart.textContent = getSelectedTimerMode().name;
    homeSessionMode.textContent = "Not started";
    homeSessionElapsed.textContent = "0h 00m 00s";
    homeContinueSession.textContent = "Start Session";
    homeSubjectSelect.disabled = false;
  }

  homeTaskCount.textContent = `${pendingTasks.length} left - ${completedTasks.length} done`;
  homeTaskPreview.innerHTML = "";
  if (pendingTasks.length === 0) {
    appendSimpleItem(homeTaskPreview, "Nothing planned yet. Add today's first task ->");
  } else {
    pendingTasks.slice(0, 3).forEach(function (task) {
      appendTaskPreview(homeTaskPreview, task);
    });

    if (pendingTasks.length > 3) {
      appendSimpleItem(homeTaskPreview, `${pendingTasks.length - 3} more in Plan.`);
    }
  }

  renderHomeSubjectOptions();
  renderHomeNextExam(nearestExam);
  renderHomeWeekPreview();
  renderSubjectBreakdown(homeSubjectList);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function updateSessionPage() {
  const mode = getSelectedTimerMode();
  const elapsed = getSessionElapsedSeconds();
  const focusSeconds = appData.activeSession ? appData.activeSession.focusSeconds : getTimerFocusSeconds();
  const isCountdown = Boolean(focusSeconds);
  const remaining = isCountdown ? Math.max(focusSeconds - elapsed, 0) : elapsed;
  const progressPercent = isCountdown ? Math.min((elapsed / focusSeconds) * 100, 100) : 0;
  const state = getFocusState();
  const subject = appData.activeSession
    ? getSubjectById(appData.activeSession.subjectId) || getSelectedSubject()
    : getSelectedSubject();
  const goal = appData.activeSession ? appData.activeSession.goal : appData.currentSessionDraft.goal;

  timerModeTitle.textContent = mode.name;
  timerModeDescription.textContent = mode.description;
  preSessionDisplay.textContent = formatPreSessionTimer(mode);
  preSessionModeMeta.textContent = getModeMetaText(mode);
  customTimerSettings.classList.toggle("active", mode.id === "custom");
  customFocusInput.value = appData.customFocusMinutes;
  customBreakInput.value = appData.customBreakMinutes;
  sessionGoalInput.value = appData.currentSessionDraft.goal || "";
  focusWorkspace.dataset.sessionState = state;
  focusSetup.hidden = state !== "pre-session";
  focusActive.hidden = !["active", "paused", "break"].includes(state);
  focusComplete.hidden = state !== "complete";
  focusOptionalSetup.hidden = state !== "pre-session";
  if (state === "complete") renderCompletionReview(appData.pendingSessionReview);
  sessionDisplay.textContent = isCountdown ? formatLongTime(remaining) : formatLongTime(elapsed);
  sessionStatus.textContent = getFocusStatusLabel(state);
  sessionPhaseLabel.textContent = appData.activeSession && appData.activeSession.phase === "break" ? "Break" : "Focus";
  sessionPhaseCopy.textContent = isCountdown
    ? `${formatLongTime(remaining)} remaining`
    : state === "paused" ? "Paused" : "Counting up while you study.";
  sessionNextPhase.textContent = getNextPhaseCopy();
  sessionActiveSubject.textContent = subject.name;
  sessionActiveGoal.textContent = goal ? goal : "No session goal set.";
  sessionModePill.textContent = appData.activeSession ? appData.activeSession.mode : mode.name;
  sessionPauseButton.textContent = state === "paused" ? "Resume" : "Pause";
  sessionSkipButton.hidden = !appData.activeSession || appData.activeSession.modeId === "stopwatch";
  sessionProgressBar.style.width = `${progressPercent}%`;
  sessionTotalToday.textContent = formatShortTime(appData.studySeconds);
  focusGoalProgress.textContent = `${getGoalPercent()}%`;
  focusSessionCount.textContent = getSessionsForDate(getTodayKey()).length;
  intentionInput.value = appData.focusIntention;
  intentionCount.textContent = `${appData.focusIntention.length}/180`;
  renderTimerModeIndicators();
  renderSubjectBreakdown(sessionSubjectBreakdown);
}

function renderTimerModeIndicators() {
  timerModeIndicators.innerHTML = "";
  timerModes.forEach(function (mode, index) {
    const label = document.createElement("span");
    label.className = "mode-dot";
    label.classList.toggle("active", index === appData.timerModeIndex);
    label.setAttribute("aria-label", mode.name);
    timerModeIndicators.appendChild(label);
  });
}

function formatPreSessionTimer(mode) {
  const focusMinutes = mode.id === "custom" ? appData.customFocusMinutes : mode.focusMinutes;
  if (!focusMinutes) return "0h 00m 00s";
  return formatLongTime(focusMinutes * 60);
}

function getModeMetaText(mode) {
  const focusMinutes = mode.id === "custom" ? appData.customFocusMinutes : mode.focusMinutes;
  const breakMinutes = mode.id === "custom" ? appData.customBreakMinutes : mode.breakMinutes;
  if (!focusMinutes) return "Open timer - no break";
  return `${focusMinutes}m focus - ${breakMinutes ? `${breakMinutes}m break` : "no break"}`;
}

function getFocusState() {
  if (appData.pendingSessionReview) return "complete";
  if (!appData.activeSession) return "pre-session";
  if (appData.sessionState === "paused") return "paused";
  if (appData.activeSession.phase === "break") return "break";
  return "active";
}

function getFocusStatusLabel(state) {
  const labels = {
    "pre-session": "Not started",
    active: "Studying",
    paused: "Paused",
    break: "Break",
    complete: "Complete"
  };
  return labels[state] || "Not started";
}

function getNextPhaseCopy() {
  if (!appData.activeSession) return "Choose a session style to see the next phase.";
  if (appData.activeSession.phase === "break") return "Next: back to setup.";
  if (!appData.activeSession.breakSeconds) return "Next: session review.";
  return `Next: ${Math.round(appData.activeSession.breakSeconds / 60)}m break`;
}

function updateGoal() {
  const goalPercent = getGoalPercent();
  goalInput.value = appData.goalHours;
  goalDisplay.textContent = formatGoalHours(appData.goalHours);
  planGoalProgress.textContent = `${goalPercent}%`;
  planGoalCopy.textContent = `${formatShortTime(appData.studySeconds)} / ${formatGoalHours(appData.goalHours)}`;
  planGoalBar.style.width = `${goalPercent}%`;
  planSummaryGoal.textContent = formatGoalHours(appData.goalHours);
}

function updateInsights() {
  const range = appData.selectedAnalyticsRange;
  syncDailyHistory(getTodayKey());

  analyticsTabs.forEach(function (tab) {
    const isActive = tab.dataset.analyticsRange === range;
    tab.classList.toggle("active", isActive);
    tab.classList.toggle("secondary-button", !isActive);
  });

  insightsContent.innerHTML = "";

  if (range === "week") {
    renderWeekInsights();
    return;
  }

  if (range === "month") {
    renderMonthInsights();
    return;
  }

  renderTodayInsights();
}

function renderSubjectOptions() {
  const currentValue = sessionSubjectSelect.value || appData.selectedSubjectId;
  sessionSubjectSelect.innerHTML = "";

  appData.subjects.forEach(function (subject) {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.name;
    sessionSubjectSelect.appendChild(option);
  });

  sessionSubjectSelect.value = getSubjectById(currentValue) ? currentValue : appData.selectedSubjectId;
}

function renderTaskSubjectOptions() {
  if (!taskSubjectInput) return;

  const currentValue = taskSubjectInput.value;
  taskSubjectInput.innerHTML = "";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "No subject";
  taskSubjectInput.appendChild(emptyOption);

  appData.subjects.forEach(function (subject) {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.name;
    taskSubjectInput.appendChild(option);
  });

  taskSubjectInput.value = getSubjectById(currentValue) ? currentValue : "";
}

function renderHomeSubjectOptions() {
  const currentValue = homeSubjectSelect.value || appData.selectedSubjectId;
  homeSubjectSelect.innerHTML = "";

  appData.subjects.forEach(function (subject) {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.name;
    homeSubjectSelect.appendChild(option);
  });

  homeSubjectSelect.value = getSubjectById(currentValue) ? currentValue : appData.selectedSubjectId;
}

function appendTaskPreview(parent, task) {
  const item = document.createElement("li");
  const taskText = document.createElement("span");
  const taskMeta = document.createElement("small");
  const metaParts = [];

  taskText.textContent = task.text;
  if (task.date) metaParts.push(task.date === getTodayKey() ? "Today" : task.date);
  if (task.subjectId) metaParts.push(getSubjectName(task.subjectId));
  if (task.repeat === "daily") metaParts.push("Daily");
  taskMeta.textContent = metaParts.join(" - ");

  item.appendChild(taskText);
  if (taskMeta.textContent) item.appendChild(taskMeta);
  parent.appendChild(item);
}

function renderHomeNextExam(exam) {
  homeNextExam.innerHTML = "";

  if (!exam) {
    homeNextExam.className = "compact-empty";
    homeNextExam.innerHTML = "";
    const empty = document.createElement("span");
    const action = document.createElement("button");
    empty.textContent = "No exams saved yet.";
    action.type = "button";
    action.className = "text-button";
    action.textContent = "Add your first exam →";
    action.addEventListener("click", function () { showSection("exams"); openExamModal(); });
    homeNextExam.appendChild(empty);
    homeNextExam.appendChild(action);
    return;
  }

  homeNextExam.className = "exam-mini";
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const progress = document.createElement("small");
  const action = document.createElement("button");
  const stats = getExamStats(exam);

  title.textContent = exam.name;
  meta.textContent = `${getExamCountdown(exam.date)} - ${getExamSubjectSummary(exam)}`;
  progress.textContent = `${stats.progressPercent}% complete`;
  action.type = "button";
  action.className = "text-button";
  action.textContent = "Open Exam";
  action.addEventListener("click", function () { openExamWorkspace(exam.id); });

  homeNextExam.appendChild(title);
  homeNextExam.appendChild(meta);
  homeNextExam.appendChild(progress);
  homeNextExam.appendChild(action);
}

function renderHomeWeekPreview() {
  homeWeekPreview.innerHTML = "";
  const sessions = getSessionsForRange("week");
  const totalsByDate = {};

  sessions.forEach(function (session) {
    totalsByDate[session.date] = (totalsByDate[session.date] || 0) + Number(session.durationSeconds || 0);
  });

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const dateKey = getDateKeyFromDate(date);
    const seconds = dateKey === getTodayKey()
      ? Math.max(totalsByDate[dateKey] || 0, appData.studySeconds)
      : totalsByDate[dateKey] || 0;

    const day = document.createElement("div");
    const bar = document.createElement("span");
    const label = document.createElement("small");
    day.className = "week-day";
    bar.style.height = `${Math.max(Math.min(seconds / 90, 56), seconds > 0 ? 8 : 3)}px`;
    label.textContent = date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
    day.appendChild(bar);
    day.appendChild(label);
    homeWeekPreview.appendChild(day);
  }
}

function renderSubjectBreakdown(container) {
  container.innerHTML = "";
  const subjectsWithTime = appData.subjects.filter(function (subject) {
    return subject.seconds > 0;
  });

  if (subjectsWithTime.length === 0) {
    appendSimpleItem(container, "No subject time yet. Start a session to see your breakdown.");
    return;
  }

  subjectsWithTime
    .slice()
    .sort(function (first, second) { return second.seconds - first.seconds; })
    .forEach(function (subject) {
      const row = document.createElement("div");
      row.className = "insight-row";
      const name = document.createElement("span");
      const time = document.createElement("strong");
      name.textContent = subject.name;
      time.textContent = formatShortTime(subject.seconds);
      row.appendChild(name);
      row.appendChild(time);
      container.appendChild(row);
    });
}

function renderTodayInsights() {
  const today = getTodayKey();
  const entry = getHistoryEntry(today);
  const sessions = getSessionsForDate(today);
  const tasks = getTasksForDate(today);
  const completedTasks = tasks.filter(function (task) { return isTaskCompletedOnDate(task, today); });
  const goalSeconds = Math.max(1, Number(entry.goalHours || appData.goalHours || 2) * 3600);
  const goalPercent = Math.min(100, Math.round((entry.studySeconds / goalSeconds) * 100));

  insightsContent.appendChild(createInsightSummaryStrip([
    { label: "Studied", value: formatShortTime(entry.studySeconds) },
    { label: "Sessions", value: String(entry.sessions) },
    { label: "Tasks done", value: `${completedTasks.length}/${tasks.length}` },
    { label: "Goal progress", value: `${goalPercent}%` }
  ]));

  const layout = createElement("div", "insights-main-grid");
  layout.appendChild(createPanel("Today timeline", renderTodayTimeline(sessions)));
  layout.appendChild(createPanel("Session review", renderTodaySessionReview(sessions)));
  insightsContent.appendChild(layout);

  const lower = createElement("div", "insights-lower-grid");
  lower.appendChild(createPanel("Subject breakdown", renderSubjectDistribution(entry.subjectTotals, entry.studySeconds)));
  lower.appendChild(createPanel("Tasks and goal", renderTaskGoalReview(tasks.length, completedTasks.length, entry.studySeconds, goalSeconds)));
  lower.appendChild(createPanel("Top distractions today", renderDistractionReview(entry.distractions)));
  insightsContent.appendChild(lower);

  insightsContent.appendChild(renderInsightSentences([entry], "today"));
}

function renderWeekInsights() {
  const days = getRecentDateKeys(7);
  const entries = days.map(getHistoryEntry);
  const totalSeconds = sumEntries(entries, "studySeconds");
  const activeDays = entries.filter(function (entry) { return entry.studySeconds > 0; }).length;
  const averageSeconds = Math.round(totalSeconds / 7);
  const goalRate = getGoalCompletionRate(entries);

  insightsContent.appendChild(createInsightSummaryStrip([
    { label: "Weekly total", value: formatShortTime(totalSeconds) },
    { label: "Average per day", value: formatShortTime(averageSeconds) },
    { label: "Active days", value: `${activeDays}/7` },
    { label: "Goal completion", value: `${goalRate}%` }
  ]));

  const layout = createElement("div", "insights-main-grid");
  layout.appendChild(createPanel("Weekly study chart", renderWeeklyStudyChart(days, entries)));
  layout.appendChild(createPanel("Weekly patterns", renderWeeklyPatterns(days, entries)));
  insightsContent.appendChild(layout);

  const lower = createElement("div", "insights-lower-grid two-column");
  lower.appendChild(createPanel("Subject distribution", renderSubjectDistribution(mergeSubjectTotals(entries), totalSeconds)));
  lower.appendChild(createPanel("Task performance", renderTaskPerformance(entries)));
  lower.appendChild(createPanel("Goal consistency", renderGoalConsistency(days, entries)));
  insightsContent.appendChild(lower);

  insightsContent.appendChild(renderInsightSentences(entries, "week"));
}

function renderMonthInsights() {
  const days = getMonthDateKeys();
  const entries = days.map(getHistoryEntry);
  const totalSeconds = sumEntries(entries, "studySeconds");
  const activeDays = entries.filter(function (entry) { return entry.studySeconds > 0; }).length;
  const totalSessions = sumEntries(entries, "sessions");
  const averageStudyDay = activeDays ? Math.round(totalSeconds / activeDays) : 0;
  const longestStreak = getLongestEntryStreak(entries);

  insightsContent.appendChild(createInsightSummaryStrip([
    { label: "Month total", value: formatShortTime(totalSeconds) },
    { label: "Active days", value: String(activeDays) },
    { label: "Avg study day", value: formatShortTime(averageStudyDay) },
    { label: "Sessions", value: String(totalSessions) },
    { label: "Longest streak", value: `${longestStreak} days` }
  ]));

  const layout = createElement("div", "insights-main-grid");
  layout.appendChild(createPanel("Monthly heatmap", renderMonthlyHeatmap(days, entries)));
  layout.appendChild(createPanel("Performance summary", renderMonthlySummary(days, entries)));
  insightsContent.appendChild(layout);

  const lower = createElement("div", "insights-lower-grid two-column");
  lower.appendChild(createPanel("Weekly comparison", renderMonthlyWeekComparison(days, entries)));
  lower.appendChild(createPanel("Subject trends", renderMonthlySubjectTrends(days, entries)));
  insightsContent.appendChild(lower);

  insightsContent.appendChild(renderInsightSentences(entries, "month"));
}

function createInsightSummaryStrip(items) {
  const strip = createElement("div", "insight-summary-strip");
  items.forEach(function (item) {
    const block = createElement("div", "insight-summary-item");
    const value = document.createElement("strong");
    const label = document.createElement("span");
    value.textContent = item.value;
    label.textContent = item.label;
    block.appendChild(value);
    block.appendChild(label);
    strip.appendChild(block);
  });
  return strip;
}

function createPanel(title, content) {
  const panel = createElement("article", "panel insight-panel");
  const heading = document.createElement("h3");
  heading.textContent = title;
  panel.appendChild(heading);
  panel.appendChild(content);
  return panel;
}

function renderTodayTimeline(sessions) {
  const timeline = createElement("div", "study-timeline");
  if (sessions.length === 0) {
    appendCompactEmpty(timeline, "No study sessions yet today.");
    return timeline;
  }

  const labels = createElement("div", "timeline-labels");
  ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"].forEach(function (label) {
    const tick = document.createElement("span");
    tick.textContent = label;
    labels.appendChild(tick);
  });
  timeline.appendChild(labels);

  const track = createElement("div", "timeline-track");
  sessions.slice().reverse().forEach(function (session) {
    const start = new Date(session.startedAt);
    const end = new Date(session.endedAt || session.startedAt);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const durationMinutes = Math.max(5, Math.round((end - start) / 60000));
    const left = Math.max(0, Math.min(100, ((startMinutes - 360) / 960) * 100));
    const width = Math.max(8, Math.min(100 - left, (durationMinutes / 960) * 100));
    const block = createElement("span", "timeline-block");
    block.style.left = `${left}%`;
    block.style.width = `${width}%`;
    block.title = `${session.subjectName || getSubjectName(session.subjectId)}: ${formatShortTime(session.durationSeconds)}`;
    block.textContent = session.subjectName || getSubjectName(session.subjectId);
    track.appendChild(block);
  });
  timeline.appendChild(track);
  return timeline;
}

function renderTodaySessionReview(sessions) {
  const list = createElement("div", "insight-compact-list");
  if (sessions.length === 0) {
    appendCompactEmpty(list, "Complete a study session to review it here.");
    return list;
  }

  const longest = sessions.reduce(function (best, session) {
    return Number(session.durationSeconds || 0) > Number(best.durationSeconds || 0) ? session : best;
  }, sessions[0]);
  const average = Math.round(getSecondsFromSessions(sessions) / sessions.length);
  const modes = countBy(sessions, function (session) { return session.mode || "Timer"; });
  appendInsightRow(list, "Longest session", formatShortTime(longest.durationSeconds));
  appendInsightRow(list, "Average", formatShortTime(average));
  appendInsightRow(list, "Most used", getTopCountLabel(modes, "None"));
  appendInsightRow(list, "Breaks logged", "Not tracked yet");
  return list;
}

function renderSubjectDistribution(subjectTotals, totalSeconds) {
  const list = createElement("div", "subject-distribution-list");
  const rows = Object.keys(subjectTotals || {})
    .map(function (name) { return { name, seconds: Number(subjectTotals[name] || 0) }; })
    .filter(function (row) { return row.seconds > 0; })
    .sort(function (first, second) { return second.seconds - first.seconds; });

  if (rows.length === 0) {
    appendCompactEmpty(list, "No subject time for this period yet.");
    return list;
  }

  rows.forEach(function (row) {
    const percent = totalSeconds ? Math.round((row.seconds / totalSeconds) * 100) : 0;
    const item = createElement("div", "subject-distribution-row");
    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const meta = document.createElement("span");
    const progress = createElement("div", "mini-progress");
    const fill = document.createElement("span");
    name.textContent = row.name;
    meta.textContent = `${formatShortTime(row.seconds)} - ${percent}%`;
    fill.style.width = `${percent}%`;
    copy.appendChild(name);
    copy.appendChild(meta);
    progress.appendChild(fill);
    item.appendChild(copy);
    item.appendChild(progress);
    list.appendChild(item);
  });
  return list;
}

function renderTaskGoalReview(planned, completed, studiedSeconds, goalSeconds) {
  const list = createElement("div", "insight-compact-list");
  const taskPercent = planned ? Math.round((completed / planned) * 100) : 0;
  const goalPercent = Math.min(100, Math.round((studiedSeconds / goalSeconds) * 100));
  appendProgressRow(list, "Tasks", `${completed} of ${planned} completed`, taskPercent);
  appendProgressRow(list, "Goal", `${formatShortTime(studiedSeconds)} of ${formatShortTime(goalSeconds)}`, goalPercent);
  return list;
}

function renderDistractionReview(distractions) {
  const list = createElement("div", "insight-compact-list");
  if (!distractions || distractions.length === 0) {
    appendCompactEmpty(list, "No distractions logged today.");
    return list;
  }

  const counts = countBy(distractions, function (entry) { return entry.category || "Other"; });
  Object.keys(counts)
    .sort(function (first, second) { return counts[second] - counts[first]; })
    .slice(0, 5)
    .forEach(function (category) {
      appendInsightRow(list, category, String(counts[category]));
    });
  return list;
}

function renderWeeklyStudyChart(days, entries) {
  const chart = createElement("div", "insight-bar-chart weekly-chart");
  const maxSeconds = Math.max(...entries.map(function (entry) { return entry.studySeconds; }), 1);
  const mostSeconds = Math.max(...entries.map(function (entry) { return entry.studySeconds; }), 0);
  days.forEach(function (dateKey, index) {
    const date = new Date(`${dateKey}T00:00:00`);
    const entry = entries[index];
    const column = createElement("div", "insight-bar-column");
    const fill = createElement("span", "insight-bar-fill");
    const label = document.createElement("small");
    fill.style.height = `${Math.max((entry.studySeconds / maxSeconds) * 100, entry.studySeconds > 0 ? 8 : 2)}%`;
    fill.title = `${date.toLocaleDateString(undefined, { weekday: "long" })}: ${formatShortTime(entry.studySeconds)}`;
    if (dateKey === getTodayKey()) fill.classList.add("today");
    if (entry.studySeconds > 0 && entry.studySeconds === mostSeconds) fill.classList.add("best");
    label.textContent = date.toLocaleDateString(undefined, { weekday: "short" });
    column.appendChild(fill);
    column.appendChild(label);
    chart.appendChild(column);
  });
  return chart;
}

function renderWeeklyPatterns(days, entries) {
  const list = createElement("div", "insight-compact-list");
  const bestIndex = getBestEntryIndex(entries);
  const subjectTotals = mergeSubjectTotals(entries);
  const distractions = entries.flatMap(function (entry) { return entry.distractions; });
  const longestSession = getLongestSessionForDates(days);

  if (sumEntries(entries, "studySeconds") === 0) {
    appendCompactEmpty(list, "Study across a few days to unlock weekly patterns.");
    return list;
  }

  appendInsightRow(list, "Most productive day", bestIndex >= 0 ? new Date(`${days[bestIndex]}T00:00:00`).toLocaleDateString(undefined, { weekday: "long" }) : "-");
  appendInsightRow(list, "Most studied subject", getTopSubjectLabel(subjectTotals));
  appendInsightRow(list, "Longest session", longestSession ? formatShortTime(longestSession.durationSeconds) : "-");
  appendInsightRow(list, "Most common distraction", getTopCountLabel(countBy(distractions, function (entry) { return entry.category || "Other"; }), "None"));
  return list;
}

function renderTaskPerformance(entries) {
  const list = createElement("div", "insight-compact-list");
  const planned = sumEntries(entries, "tasksPlanned");
  const completed = sumEntries(entries, "tasksCompleted");
  const rate = planned ? Math.round((completed / planned) * 100) : 0;
  appendInsightRow(list, "Tasks completed", String(completed));
  appendInsightRow(list, "Carried over", String(Math.max(0, planned - completed)));
  appendProgressRow(list, "Completion rate", `${rate}%`, rate);
  return list;
}

function renderGoalConsistency(days, entries) {
  const row = createElement("div", "goal-consistency-row");
  days.forEach(function (dateKey, index) {
    const entry = entries[index];
    const goalSeconds = Math.max(1, Number(entry.goalHours || appData.goalHours || 2) * 3600);
    const percent = Math.min(100, Math.round((entry.studySeconds / goalSeconds) * 100));
    const item = createElement("div", "goal-day");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    label.textContent = new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3);
    value.textContent = entry.studySeconds === 0 ? "-" : percent >= 100 ? "Done" : `${percent}%`;
    item.classList.toggle("complete", percent >= 100);
    item.appendChild(label);
    item.appendChild(value);
    row.appendChild(item);
  });
  return row;
}

function renderMonthlyHeatmap(days, entries) {
  const wrap = createElement("div", "monthly-heatmap");
  const maxSeconds = Math.max(...entries.map(function (entry) { return entry.studySeconds; }), 1);
  days.forEach(function (dateKey, index) {
    const date = new Date(`${dateKey}T00:00:00`);
    const entry = entries[index];
    const cell = createElement("span", "heatmap-cell");
    const intensity = entry.studySeconds === 0 ? 0 : Math.max(1, Math.ceil((entry.studySeconds / maxSeconds) * 4));
    cell.dataset.intensity = String(intensity);
    cell.title = `${date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}: ${formatShortTime(entry.studySeconds)}`;
    cell.textContent = String(date.getDate());
    wrap.appendChild(cell);
  });

  if (sumEntries(entries, "studySeconds") === 0) {
    appendCompactEmpty(wrap, "Your monthly heatmap will fill as you study.");
  }

  return wrap;
}

function renderMonthlyWeekComparison(days, entries) {
  const weeks = getMonthWeeks(days, entries);
  const chart = createElement("div", "insight-bar-chart week-comparison-chart");
  const maxSeconds = Math.max(...weeks.map(function (week) { return week.seconds; }), 1);
  weeks.forEach(function (week) {
    const column = createElement("div", "insight-bar-column");
    const fill = createElement("span", "insight-bar-fill");
    const label = document.createElement("small");
    fill.style.height = `${Math.max((week.seconds / maxSeconds) * 100, week.seconds > 0 ? 8 : 2)}%`;
    fill.title = `${week.label}: ${formatShortTime(week.seconds)}`;
    label.textContent = week.label;
    column.appendChild(fill);
    column.appendChild(label);
    chart.appendChild(column);
  });
  return chart;
}

function renderMonthlySubjectTrends(days, entries) {
  const list = createElement("div", "insight-compact-list");
  const weeks = getMonthWeeks(days, entries);
  const monthSubjects = Object.keys(mergeSubjectTotals(entries))
    .sort(function (first, second) {
      return mergeSubjectTotals(entries)[second] - mergeSubjectTotals(entries)[first];
    })
    .slice(0, 4);

  if (monthSubjects.length === 0) {
    appendCompactEmpty(list, "Subject trends will appear after more study sessions.");
    return list;
  }

  monthSubjects.forEach(function (subject) {
    const trend = weeks.map(function (week) {
      const seconds = week.entries.reduce(function (total, entry) {
        return total + Number((entry.subjectTotals || {})[subject] || 0);
      }, 0);
      return `${week.label}: ${formatShortTime(seconds)}`;
    }).join(" | ");
    appendInsightRow(list, subject, trend);
  });
  return list;
}

function renderMonthlySummary(days, entries) {
  const list = createElement("div", "insight-compact-list");
  const weeks = getMonthWeeks(days, entries);
  const bestWeek = weeks.slice().sort(function (first, second) { return second.seconds - first.seconds; })[0];
  const subjectTotals = mergeSubjectTotals(entries);
  const tasksCompleted = sumEntries(entries, "tasksCompleted");
  appendInsightRow(list, "Best week", bestWeek && bestWeek.seconds > 0 ? bestWeek.label : "-");
  appendInsightRow(list, "Most consistent subject", getTopSubjectLabel(subjectTotals));
  appendInsightRow(list, "Tasks completed", String(tasksCompleted));
  appendInsightRow(list, "Goal completion", `${getGoalCompletionRate(entries)}%`);
  appendInsightRow(list, "Longest streak", `${getLongestEntryStreak(entries)} days`);
  return list;
}

function renderInsightSentences(entries, range) {
  const panel = createPanel("Observations", createElement("div", "insight-sentence-list"));
  const list = panel.querySelector(".insight-sentence-list");
  const totalSeconds = sumEntries(entries, "studySeconds");
  const subjectTotals = mergeSubjectTotals(entries);
  const distractions = entries.flatMap(function (entry) { return entry.distractions; });
  const topSubject = getTopSubject(subjectTotals);
  const topDistraction = getTopCountLabel(countBy(distractions, function (entry) { return entry.category || "Other"; }), "");

  if (totalSeconds === 0) {
    appendCompactEmpty(list, "Study a little longer and patterns will start appearing here.");
    return panel;
  }

  if (topSubject) {
    const percent = Math.round((topSubject.seconds / totalSeconds) * 100);
    appendCompactEmpty(list, `${topSubject.name} received ${percent}% of your ${range} study time.`);
  }

  if (topDistraction) {
    appendCompactEmpty(list, `${topDistraction} was your most logged distraction.`);
  }

  if (range !== "today") {
    const activeDays = entries.filter(function (entry) { return entry.studySeconds > 0; }).length;
    appendCompactEmpty(list, `You studied on ${activeDays} of ${entries.length} days in this ${range}.`);
  }

  return panel;
}

function createElement(tagName, className) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  return element;
}

function appendCompactEmpty(parent, text) {
  const item = document.createElement("p");
  item.className = "compact-empty";
  item.textContent = text;
  parent.appendChild(item);
}

function appendInsightRow(parent, label, value) {
  const row = createElement("div", "insight-detail-row");
  const labelElement = document.createElement("span");
  const valueElement = document.createElement("strong");
  labelElement.textContent = label;
  valueElement.textContent = value;
  row.appendChild(labelElement);
  row.appendChild(valueElement);
  parent.appendChild(row);
}

function appendProgressRow(parent, label, value, percent) {
  const row = createElement("div", "insight-progress-row");
  const top = createElement("div", "insight-progress-copy");
  const labelElement = document.createElement("span");
  const valueElement = document.createElement("strong");
  const bar = createElement("div", "mini-progress");
  const fill = document.createElement("span");
  labelElement.textContent = label;
  valueElement.textContent = value;
  fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  top.appendChild(labelElement);
  top.appendChild(valueElement);
  bar.appendChild(fill);
  row.appendChild(top);
  row.appendChild(bar);
  parent.appendChild(row);
}

function getHistoryEntry(dateKey) {
  if (dateKey === getTodayKey()) syncDailyHistory(dateKey);
  return appData.dailyHistory[dateKey] || buildDailyHistoryEntry(dateKey);
}

function getRecentDateKeys(days) {
  const keys = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    keys.push(getDateKeyFromDate(date));
  }
  return keys;
}

function getMonthDateKeys() {
  const keys = [];
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), 1);
  while (date.getMonth() === today.getMonth() && date <= today) {
    keys.push(getDateKeyFromDate(date));
    date.setDate(date.getDate() + 1);
  }
  return keys;
}

function sumEntries(entries, key) {
  return entries.reduce(function (total, entry) {
    return total + Number(entry[key] || 0);
  }, 0);
}

function mergeSubjectTotals(entries) {
  return entries.reduce(function (totals, entry) {
    Object.keys(entry.subjectTotals || {}).forEach(function (subjectName) {
      totals[subjectName] = (totals[subjectName] || 0) + Number(entry.subjectTotals[subjectName] || 0);
    });
    return totals;
  }, {});
}

function countBy(items, getKey) {
  return items.reduce(function (counts, item) {
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function getTopCountLabel(counts, emptyLabel) {
  const keys = Object.keys(counts || {});
  if (keys.length === 0) return emptyLabel;
  return keys.sort(function (first, second) { return counts[second] - counts[first]; })[0];
}

function getTopSubject(subjectTotals) {
  const subjects = Object.keys(subjectTotals || {});
  if (subjects.length === 0) return null;
  const name = subjects.sort(function (first, second) {
    return subjectTotals[second] - subjectTotals[first];
  })[0];
  return { name, seconds: Number(subjectTotals[name] || 0) };
}

function getTopSubjectLabel(subjectTotals) {
  const subject = getTopSubject(subjectTotals);
  return subject ? subject.name : "-";
}

function getGoalCompletionRate(entries) {
  if (entries.length === 0) return 0;
  const totalPercent = entries.reduce(function (total, entry) {
    const goalSeconds = Math.max(1, Number(entry.goalHours || appData.goalHours || 2) * 3600);
    return total + Math.min(100, Math.round((entry.studySeconds / goalSeconds) * 100));
  }, 0);
  return Math.round(totalPercent / entries.length);
}

function getBestEntryIndex(entries) {
  let bestIndex = -1;
  let bestSeconds = 0;
  entries.forEach(function (entry, index) {
    if (entry.studySeconds > bestSeconds) {
      bestSeconds = entry.studySeconds;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function getLongestSessionForDates(dateKeys) {
  const dateSet = new Set(dateKeys);
  return appData.sessions
    .filter(function (session) { return dateSet.has(session.date || getDateKeyFromDate(new Date(session.startedAt))); })
    .sort(function (first, second) { return Number(second.durationSeconds || 0) - Number(first.durationSeconds || 0); })[0] || null;
}

function getLongestEntryStreak(entries) {
  let current = 0;
  let longest = 0;
  entries.forEach(function (entry) {
    if (entry.studySeconds > 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });
  return longest;
}

function getMonthWeeks(days, entries) {
  const weeks = [];
  days.forEach(function (dateKey, index) {
    const weekIndex = Math.floor((new Date(`${dateKey}T00:00:00`).getDate() - 1) / 7);
    if (!weeks[weekIndex]) {
      weeks[weekIndex] = { label: `Week ${weekIndex + 1}`, seconds: 0, entries: [] };
    }
    weeks[weekIndex].seconds += entries[index].studySeconds;
    weeks[weekIndex].entries.push(entries[index]);
  });
  return weeks.filter(Boolean);
}

function renderRecentSessions() {
  recentSessionList.innerHTML = "";
  const sessions = appData.selectedHistoryRange === "previous"
    ? appData.sessions.filter(function (session) { return session.date !== getTodayKey(); })
    : appData.sessions.filter(function (session) { return session.date === getTodayKey(); });

  historyTabs.forEach(function (tab) {
    const isActive = tab.dataset.historyRange === appData.selectedHistoryRange;
    tab.classList.toggle("active", isActive);
    tab.classList.toggle("secondary-button", !isActive);
  });

  if (sessions.length === 0) {
    appendSimpleItem(recentSessionList, "No saved sessions yet.");
    return;
  }

  sessions.slice(0, 8).forEach(function (session) {
    const item = document.createElement("article");
    item.className = "session-history-row";
    const topLine = document.createElement("div");
    const bottomLine = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("span");
    const time = document.createElement("span");
    const duration = document.createElement("strong");
    const result = document.createElement("small");
    title.textContent = session.subjectName || getSubjectName(session.subjectId);
    meta.textContent = session.mode || "Timer";
    time.textContent = `${formatClockTime(session.startedAt)} -> ${formatClockTime(session.endedAt)}`;
    duration.textContent = formatShortTime(session.durationSeconds);
    result.textContent = session.goalResult ? `Goal: ${formatGoalResult(session.goalResult)}` : "";
    topLine.className = "session-row-top";
    bottomLine.className = "session-row-bottom";
    topLine.appendChild(title);
    topLine.appendChild(meta);
    topLine.appendChild(duration);
    bottomLine.appendChild(time);
    if (result.textContent) bottomLine.appendChild(result);
    item.appendChild(topLine);
    item.appendChild(bottomLine);
    recentSessionList.appendChild(item);
  });
}

function formatGoalResult(result) {
  const labels = { yes: "completed", partly: "partly done", no: "not finished" };
  return labels[result] || result;
}

function startSession() {
  if (appData.activeSession || appData.pendingSessionReview) return;

  appData.customFocusMinutes = Math.max(1, Number(customFocusInput.value) || appData.customFocusMinutes);
  appData.customBreakMinutes = Math.max(0, Number(customBreakInput.value) || 0);
  appData.selectedSubjectId = sessionSubjectSelect.value || appData.selectedSubjectId;
  appData.currentSessionDraft.goal = sessionGoalInput.value.trim();
  const mode = getSelectedTimerMode();
  appData.activeSession = {
    id: createId(),
    mode: mode.name,
    modeId: mode.id,
    phase: "focus",
    subjectId: appData.selectedSubjectId,
    goal: appData.currentSessionDraft.goal,
    roomId: appData.activeRoomId || null,
    startedAt: new Date().toISOString(),
    elapsedSeconds: 0,
    focusSeconds: getTimerFocusSeconds(),
    breakSeconds: getTimerBreakSeconds()
  };
  appData.sessionState = "active";

  saveData();
  resumeSessionTimer();
  updateAllDisplays();
}

function resumeSessionTimer() {
  if (sessionTimerId) return;
  sessionTimerId = setInterval(tickStudySession, 1000);
}

function tickStudySession() {
  if (!appData.activeSession) {
    clearInterval(sessionTimerId);
    sessionTimerId = null;
    return;
  }

  updateSessionPage();
  updateHome();

  if (appData.activeSession.focusSeconds && getSessionElapsedSeconds() >= appData.activeSession.focusSeconds) {
    if (appData.activeSession.phase === "focus") {
      completeFocusPhase();
    } else {
      completeBreakPhase();
    }
  }
}

function pauseSession(shouldRecordSession = true) {
  if (!appData.activeSession) return;

  if (shouldRecordSession) {
    toggleSessionPause();
    return;
  }

  resetActiveSession();
}

function toggleSessionPause() {
  if (!appData.activeSession) return;

  if (appData.sessionState === "paused") {
    appData.activeSession.startedAt = new Date().toISOString();
    appData.sessionState = appData.activeSession.phase === "break" ? "break" : "active";
    saveData();
    resumeSessionTimer();
    updateAllDisplays();
    return;
  }

  appData.activeSession.elapsedSeconds = getSessionElapsedSeconds();
  appData.sessionState = "paused";
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  saveData();
  updateAllDisplays();
}

function resetActiveSession() {
  if (!appData.activeSession) return;
  appData.activeSession = null;
  appData.sessionState = "pre-session";
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  saveData();
  updateAllDisplays();
}

function finalizeFocusSession(shouldShowReview = true) {
  if (!appData.activeSession) return null;

  const durationSeconds = getSessionElapsedSeconds();
  const subject = getSubjectById(appData.activeSession.subjectId) || getSelectedSubject();
  const activeSession = appData.activeSession;

  if (appData.activeSession.phase === "focus") {
    appData.studySeconds += durationSeconds;
    subject.seconds += durationSeconds;
  }

  let review = null;
  if (durationSeconds > 0 && activeSession.phase === "focus") {
    review = {
      id: activeSession.id,
      date: getTodayKey(),
      subjectId: subject.id,
      subjectName: subject.name,
      mode: activeSession.mode,
      modeId: activeSession.modeId,
      goal: activeSession.goal || "",
      roomId: activeSession.roomId || null,
      startedAt: activeSession.startedAt,
      endedAt: new Date().toISOString(),
      durationSeconds,
      goalResult: "",
      reviewNote: ""
    };
    if (shouldShowReview) {
      appData.pendingSessionReview = review;
      renderCompletionReview(review);
    } else {
      appData.sessions.unshift(review);
    }
  }

  appData.activeSession = null;
  appData.sessionState = shouldShowReview && review ? "complete" : "pre-session";
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  saveData();
  updateAllDisplays();
  return review;
}

function completeFocusPhase() {
  const activeSession = appData.activeSession;
  if (!activeSession) return;

  finalizeFocusSession(!activeSession.breakSeconds);

  if (activeSession.breakSeconds > 0) {
    appData.activeSession = {
      id: createId(),
      mode: activeSession.mode,
      modeId: activeSession.modeId,
      phase: "break",
      subjectId: activeSession.subjectId,
      goal: activeSession.goal || "",
      roomId: activeSession.roomId || null,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      focusSeconds: activeSession.breakSeconds,
      breakSeconds: 0
    };
    appData.sessionState = "break";
    saveData();
    resumeSessionTimer();
  }

  updateAllDisplays();
}

function completeBreakPhase() {
  if (!appData.activeSession) return;
  appData.activeSession = null;
  appData.sessionState = "pre-session";
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  saveData();
  updateAllDisplays();
}

function skipSession() {
  if (!appData.activeSession) return;

  if (appData.activeSession.phase === "focus") {
    completeFocusPhase();
  } else {
    completeBreakPhase();
  }
}

function finishSession() {
  if (!appData.activeSession) return;
  if (appData.activeSession.phase === "break") {
    completeBreakPhase();
    return;
  }
  finalizeFocusSession(true);
}

function renderCompletionReview(review) {
  if (!review) return;
  completeSessionTitle.textContent = `${review.subjectName} complete`;
  completeSessionSummary.innerHTML = "";
  [
    ["Subject", review.subjectName],
    ["Mode", review.mode],
    ["Duration", formatShortTime(review.durationSeconds)],
    ["Goal", review.goal || "No goal set"]
  ].forEach(function (item) {
    const block = document.createElement("div");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    label.textContent = item[0];
    value.textContent = item[1];
    block.appendChild(label);
    block.appendChild(value);
    completeSessionSummary.appendChild(block);
  });
  setGoalResult(review.goalResult || "yes");
  sessionReviewNote.value = review.reviewNote || "";
}

function setGoalResult(result) {
  if (!appData.pendingSessionReview) return;
  appData.pendingSessionReview.goalResult = result;
  goalResultOptions.querySelectorAll("button").forEach(function (button) {
    button.classList.toggle("active", button.dataset.goalResult === result);
  });
}

function saveSessionReview(startAnother = false) {
  if (!appData.pendingSessionReview) return;
  const review = {
    ...appData.pendingSessionReview,
    goalResult: appData.pendingSessionReview.goalResult || "yes",
    reviewNote: sessionReviewNote.value.trim()
  };
  appData.sessions.unshift(review);
  appData.pendingSessionReview = null;
  appData.sessionState = "pre-session";
  if (startAnother) appData.currentSessionDraft.goal = "";
  saveData();
  updateAllDisplays();
}

function changeTimerMode(direction) {
  if (appData.activeSession) return;
  appData.timerModeIndex = (appData.timerModeIndex + direction + timerModes.length) % timerModes.length;
  saveData();
  updateSessionPage();
}

function saveCustomTimerSettings() {
  if (appData.activeSession) return;
  appData.customFocusMinutes = Math.max(1, Number(customFocusInput.value) || 1);
  appData.customBreakMinutes = Math.max(0, Number(customBreakInput.value) || 0);
  saveData();
  updateSessionPage();
}

function resetSession() {
  resetActiveSession();
}

function changeSessionSubject() {
  appData.selectedSubjectId = sessionSubjectSelect.value;

  if (appData.activeSession) {
    appData.activeSession.subjectId = appData.selectedSubjectId;
  }

  saveData();
  updateAllDisplays();
}

function openSubjectModal() {
  subjectModal.hidden = false;
  subjectInput.value = "";
  subjectInput.focus();
}

function closeSubjectModal() {
  subjectModal.hidden = true;
}

function addSubject(event) {
  event.preventDefault();
  const subjectName = subjectInput.value.trim();

  if (!subjectName) return;

  const existingSubject = appData.subjects.find(function (subject) {
    return subject.name.toLowerCase() === subjectName.toLowerCase();
  });

  if (existingSubject) {
    appData.selectedSubjectId = existingSubject.id;
  } else {
    const subject = createSubject(subjectName);
    appData.subjects.push(subject);
    appData.selectedSubjectId = subject.id;
  }

  subjectInput.value = "";
  closeSubjectModal();
  saveData();
  updateAllDisplays();
}

function openFocusDistractionModal() {
  focusDistractionModal.hidden = false;
  focusDistractionNote.value = "";
  focusDistractionNote.focus();
}

function closeFocusDistractionModal() {
  focusDistractionModal.hidden = true;
}

function addFocusDistraction(event) {
  event.preventDefault();
  const now = new Date();
  appData.distractions.unshift({
    id: createId(),
    category: focusDistractionCategory.value,
    reason: focusDistractionNote.value.trim(),
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: getTodayKey(),
    timestamp: now.toISOString(),
    sessionId: appData.activeSession ? appData.activeSession.id : null
  });
  closeFocusDistractionModal();
  saveData();
  updateAllDisplays();
}

function saveIntention(event) {
  event.preventDefault();
  appData.focusIntention = intentionInput.value.trim();
  saveData();
  updateAllDisplays();
}

function createTask(text, date, subjectId, repeat) {
  return {
    id: createId(),
    text,
    completed: false,
    date,
    subjectId,
    repeat,
    completedDates: []
  };
}

function addTask(event) {
  event.preventDefault();
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  appData.tasks.push(createTask(taskText, taskDateInput.value, taskSubjectInput.value, taskRepeatInput.value));
  taskInput.value = "";
  taskDateInput.value = "";
  taskSubjectInput.value = "";
  taskRepeatInput.value = "never";
  saveData();
  closeTaskModal();
  renderTasks();
  updateAllDisplays();
}

function toggleTask(taskId) {
  appData.tasks = appData.tasks.map(function (task) {
    if (task.id !== taskId) return task;

    if (task.repeat === "daily") {
      const completedDates = Array.isArray(task.completedDates) ? task.completedDates.slice() : [];
      const todayIndex = completedDates.indexOf(getTodayKey());

      if (todayIndex >= 0) {
        completedDates.splice(todayIndex, 1);
      } else {
        completedDates.push(getTodayKey());
      }

      return { ...task, completed: completedDates.includes(getTodayKey()), completedDates };
    }

    return { ...task, completed: !task.completed };
  });
  saveData();
  renderTasks();
  updateAllDisplays();
}

function deleteTask(taskId) {
  appData.tasks = appData.tasks.filter(function (task) {
    return task.id !== taskId;
  });
  saveData();
  renderTasks();
  updateAllDisplays();
}

function renderTasks() {
  const pendingTasks = getPendingTodayTasks();
  const completedTasks = getCompletedTodayTasks();

  pendingTaskList.innerHTML = "";
  completedTaskList.innerHTML = "";
  planDateLabel.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  planTaskSummary.textContent = pendingTasks.length === 0
    ? "Nothing planned yet."
    : `${pendingTasks.length} still open today.`;
  planSummaryPlanned.textContent = getTodayTasks().length;
  planSummaryDone.textContent = completedTasks.length;
  completedTaskSummary.textContent = `Completed (${completedTasks.length})`;
  completedTaskDetails.open = false;

  renderTaskGroup(pendingTaskList, pendingTasks);
  renderTaskGroup(completedTaskList, completedTasks);
}

function renderTaskGroup(listElement, tasks) {
  if (tasks.length === 0) {
    appendSimpleItem(listElement, "Nothing here yet.");
    return;
  }

  tasks.forEach(function (task) {
    const listItem = document.createElement("li");
    listItem.className = "task-row";
    if (task.completed) listItem.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = isTaskCompletedToday(task);
    checkbox.addEventListener("change", function () { toggleTask(task.id); });

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const taskMeta = document.createElement("small");
    taskMeta.className = "task-meta";
    const metaParts = [];
    if (task.date) metaParts.push(task.date);
    if (task.subjectId) metaParts.push(getSubjectName(task.subjectId));
    if (task.repeat === "daily") metaParts.push("Daily");
    taskMeta.textContent = metaParts.join(" - ");

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.title = "Delete task";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", function () { deleteTask(task.id); });

    listItem.appendChild(checkbox);
    const taskContent = document.createElement("span");
    taskContent.className = "task-content";
    taskContent.appendChild(taskText);
    if (taskMeta.textContent) taskContent.appendChild(taskMeta);
    listItem.appendChild(taskContent);
    listItem.appendChild(deleteButton);
    listElement.appendChild(listItem);
  });
}

function saveGoal(event) {
  event.preventDefault();
  const goalHours = Number(goalInput.value);
  if (goalHours <= 0) return;

  appData.goalHours = goalHours;
  saveData();
  updateAllDisplays();
}

function changeGoalBy(amount) {
  appData.goalHours = Math.max(0.25, Number((appData.goalHours + amount).toFixed(2)));
  saveData();
  updateAllDisplays();
}

function openTaskModal() {
  taskModal.hidden = false;
  taskDateInput.value = getTodayKey();
  taskInput.focus();
}

function closeTaskModal() {
  taskModal.hidden = true;
}

function handleTaskModalBackdrop(event) {
  if (event.target === taskModal) {
    closeTaskModal();
  }
}

function startOrContinueFromHome() {
  if (appData.activeSession) {
    showSection("focus-hub");
    return;
  }

  appData.selectedSubjectId = homeSubjectSelect.value || appData.selectedSubjectId;
  sessionSubjectSelect.value = appData.selectedSubjectId;
  startSession();
}

function renderPlanner() {
  renderCalendar();
  renderPlannerItems();
}

function renderCalendar() {
  const monthDate = new Date(appData.plannerYear, appData.plannerMonth, 1);
  const firstDay = monthDate.getDay();
  const daysInMonth = new Date(appData.plannerYear, appData.plannerMonth + 1, 0).getDate();

  plannerMonthLabel.textContent = monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  calendarGrid.innerHTML = "";

  for (let blank = 0; blank < firstDay; blank += 1) {
    const spacer = document.createElement("span");
    spacer.className = "calendar-day calendar-day-empty";
    calendarGrid.appendChild(spacer);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = getDateKeyFromDate(new Date(appData.plannerYear, appData.plannerMonth, day));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.classList.toggle("active", dateKey === appData.selectedPlannerDate);
    button.classList.toggle("today", dateKey === getTodayKey());
    button.textContent = day;

    const itemsForDay = appData.plannerItems.filter(function (item) { return item.date === dateKey; });
    const examsForDay = appData.exams.filter(function (exam) { return exam.date === dateKey; });
    if (itemsForDay.length > 0 || examsForDay.length > 0) {
      const dots = document.createElement("span");
      dots.className = "calendar-dots";
      if (itemsForDay.length > 0) dots.appendChild(createCalendarDot("Plan"));
      if (examsForDay.length > 0) dots.appendChild(createCalendarDot("Exam"));
      button.appendChild(dots);
    }

    button.addEventListener("click", function () {
      appData.selectedPlannerDate = dateKey;
      saveData();
      renderPlanner();
    });

    calendarGrid.appendChild(button);
  }
}

function createCalendarDot(label) {
  const dot = document.createElement("span");
  dot.className = "calendar-dot";
  dot.title = label;
  return dot;
}

function addPlannerItem(event) {
  event.preventDefault();
  const title = plannerTitleInput.value.trim();
  if (!title) return;

  appData.plannerItems.push({
    id: createId(),
    date: appData.selectedPlannerDate,
    type: plannerTypeInput.value,
    title
  });

  plannerTitleInput.value = "";
  saveData();
  renderPlanner();
}

function renderPlannerItems() {
  const selectedDate = new Date(`${appData.selectedPlannerDate}T00:00:00`);
  const itemsForDay = appData.plannerItems.filter(function (item) {
    return item.date === appData.selectedPlannerDate;
  });
  const examsForDay = appData.exams.filter(function (exam) {
    return exam.date === appData.selectedPlannerDate;
  });

  selectedDateLabel.textContent = selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  plannerItems.innerHTML = "";

  if (itemsForDay.length === 0 && examsForDay.length === 0) {
    appendSimpleItem(plannerItems, "Nothing planned for this date yet.");
    return;
  }

  itemsForDay.forEach(function (item) {
    const card = document.createElement("article");
    card.className = "planner-item";
    const title = document.createElement("strong");
    const type = document.createElement("small");
    const deleteButton = document.createElement("button");

    title.textContent = item.title;
    type.textContent = item.type;
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () { deletePlannerItem(item.id); });

    card.appendChild(title);
    card.appendChild(type);
    card.appendChild(deleteButton);
    plannerItems.appendChild(card);
  });

  examsForDay.forEach(function (exam) {
    const card = document.createElement("article");
    card.className = "planner-item";
    const title = document.createElement("strong");
    const type = document.createElement("small");
    const action = document.createElement("button");
    title.textContent = exam.name;
    type.textContent = `Exam - ${exam.type}`;
    action.type = "button";
    action.className = "text-button";
    action.textContent = "Open Exam";
    action.addEventListener("click", function () { openExamWorkspace(exam.id); });
    card.appendChild(title);
    card.appendChild(type);
    card.appendChild(action);
    plannerItems.appendChild(card);
  });
}

function deletePlannerItem(itemId) {
  appData.plannerItems = appData.plannerItems.filter(function (item) {
    return item.id !== itemId;
  });
  saveData();
  renderPlanner();
}

function changePlannerMonth(direction) {
  const nextDate = new Date(appData.plannerYear, appData.plannerMonth + direction, 1);
  appData.plannerMonth = nextDate.getMonth();
  appData.plannerYear = nextDate.getFullYear();
  saveData();
  renderPlanner();
}

function addExam(event) {
  event.preventDefault();
  if (!selectedExamPreset) return;

  const subjectNames = examSubjectsInput.value
    .split(",")
    .map(function (subject) { return subject.trim(); })
    .filter(Boolean);
  const isCustom = selectedExamPreset.name === "Custom Exam";
  const customName = examNameInput.value.trim();
  const title = examTitleInput.value.trim();
  const existingExam = getExamById(appData.selectedExamId);
  const baseName = isCustom ? customName : selectedExamPreset.name;
  const examName = examForm.dataset.mode === "edit"
    ? customName || (existingExam ? existingExam.name : baseName)
    : title && !isCustom ? `${baseName} - ${title}` : baseName;

  if (!examName || !examDateInput.value) return;

  const exam = {
    id: createId(),
    type: selectedExamPreset.name,
    name: examName,
    date: examDateInput.value,
    time: "",
    subjects: subjectNames.map(function (subjectName) {
      return { id: createId(), name: subjectName, chapters: [] };
    }),
    notes: "",
    milestones: [],
    createdAt: new Date().toISOString()
  };

  if (existingExam && examForm.dataset.mode === "edit") {
    existingExam.type = exam.type;
    existingExam.name = exam.name;
    existingExam.date = exam.date;
    existingExam.subjects = mergeExamSubjects(existingExam.subjects, subjectNames);
  } else {
    appData.exams.push(exam);
    appData.selectedExamId = exam.id;
  }

  closeExamModal();
  saveData();
  renderExams();
  renderPlanner();
  updateHome();
  if (appData.selectedExamId) renderExamWorkspace();
}

function mergeExamSubjects(existingSubjects, subjectNames) {
  return subjectNames.map(function (subjectName) {
    const existing = existingSubjects.find(function (subject) {
      return subject.name.toLowerCase() === subjectName.toLowerCase();
    });
    return existing || { id: createId(), name: subjectName, chapters: [] };
  });
}

function renderExams() {
  examList.innerHTML = "";
  examCountLabel.textContent = `${appData.exams.length} ${appData.exams.length === 1 ? "exam" : "exams"}`;

  if (appData.exams.length === 0) {
    const empty = document.createElement("article");
    empty.className = "exam-empty-state";
    const title = document.createElement("h3");
    const copy = document.createElement("p");
    const action = document.createElement("button");
    title.textContent = "No exams yet.";
    copy.textContent = "Add the exam you're preparing for.";
    action.type = "button";
    action.textContent = "+ Add Exam";
    action.addEventListener("click", openExamModal);
    empty.appendChild(title);
    empty.appendChild(copy);
    empty.appendChild(action);
    examList.appendChild(empty);
    return;
  }

  appData.exams
    .slice()
    .sort(function (first, second) { return new Date(first.date) - new Date(second.date); })
    .forEach(function (exam) {
      const stats = getExamStats(exam);
      const daysLeft = getExamDaysLeft(exam.date);
      const card = document.createElement("button");
      const header = document.createElement("span");
      const title = document.createElement("strong");
      const type = document.createElement("small");
      const countdown = document.createElement("span");
      const subjects = document.createElement("span");
      const progressText = document.createElement("span");
      const progressBar = document.createElement("span");
      const progressFill = document.createElement("span");
      const status = document.createElement("span");

      card.type = "button";
      card.className = "exam-card";
      card.addEventListener("click", function () { openExamWorkspace(exam.id); });
      header.className = "exam-card-header";
      type.className = "muted-text";
      countdown.className = "exam-countdown";
      subjects.className = "muted-text";
      progressText.className = "exam-progress-text";
      progressBar.className = "progress-bar exam-card-progress";
      status.className = "status-pill exam-status";

      title.textContent = exam.name;
      type.textContent = exam.type;
      countdown.textContent = getExamCountdown(exam.date);
      subjects.textContent = getExamSubjectSummary(exam);
      progressText.textContent = `${stats.progressPercent}% complete`;
      progressFill.style.width = `${stats.progressPercent}%`;
      status.textContent = getExamStatusLabel(daysLeft);

      header.appendChild(title);
      header.appendChild(status);
      progressBar.appendChild(progressFill);
      card.appendChild(header);
      card.appendChild(type);
      card.appendChild(countdown);
      card.appendChild(subjects);
      card.appendChild(progressText);
      card.appendChild(progressBar);
      examList.appendChild(card);
    });

  if (appData.selectedExamId && getSelectedExam()) {
    examListView.hidden = true;
    examWorkspace.hidden = false;
    renderExamWorkspace();
  }
}

function getExamCountdown(dateKey) {
  const today = new Date(`${getTodayKey()}T00:00:00`);
  const examDate = new Date(`${dateKey}T00:00:00`);
  const daysLeft = Math.round((examDate - today) / 86400000);

  if (daysLeft < 0) return "Completed";
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

function openExamWorkspace(examId) {
  appData.selectedExamId = examId;
  appData.selectedExamTab = appData.selectedExamTab || "overview";
  examListView.hidden = true;
  examWorkspace.hidden = false;
  showSection("exams");
  saveData();
  renderExamWorkspace();
}

function closeExamWorkspace() {
  appData.selectedExamId = null;
  examListView.hidden = false;
  examWorkspace.hidden = true;
  saveData();
  renderExams();
}

function renderExamWorkspace() {
  const exam = getSelectedExam();
  if (!exam) {
    closeExamWorkspace();
    return;
  }

  examWorkspaceType.textContent = exam.type;
  examWorkspaceTitle.textContent = exam.name;
  examWorkspaceCountdown.textContent = `${getExamCountdown(exam.date)} - ${getCountdownMessage(getExamDaysLeft(exam.date))}`;

  examTabs.forEach(function (tab) {
    const isActive = tab.dataset.examTab === appData.selectedExamTab;
    tab.classList.toggle("active", isActive);
    tab.classList.toggle("secondary-button", !isActive);
  });

  examTabPanels.forEach(function (panel) {
    panel.classList.toggle("active", panel.id === `exam-tab-${appData.selectedExamTab}`);
  });

  renderExamOverview(exam);
  renderExamSyllabus(exam);
  renderExamPlan(exam);
  renderExamProgress(exam);
}

function renderExamOverview(exam) {
  const panel = document.getElementById("exam-tab-overview");
  const stats = getExamStats(exam);
  panel.innerHTML = "";
  panel.appendChild(createExamSummaryStrip(exam, stats));

  const progressArea = document.createElement("article");
  progressArea.className = "secondary-surface exam-progress-area";
  progressArea.innerHTML = `<h3>Syllabus Progress</h3><strong>${stats.progressPercent}% complete</strong><p class="muted-text">${stats.remainingTopics} topics remaining</p>`;
  const bar = document.createElement("div");
  const fill = document.createElement("span");
  bar.className = "progress-bar";
  fill.style.width = `${stats.progressPercent}%`;
  bar.appendChild(fill);
  progressArea.appendChild(bar);
  panel.appendChild(progressArea);

  const next = document.createElement("article");
  next.className = "inline-section";
  const nextMilestone = exam.milestones.find(function (milestone) { return !milestone.completed; });
  next.innerHTML = `<h3>Next Planned Step</h3><p class="muted-text">${nextMilestone ? nextMilestone.title : "No milestones yet. Create the next thing you want to finish."}</p>`;
  panel.appendChild(next);
}

function createExamSummaryStrip(exam, stats) {
  const strip = document.createElement("div");
  strip.className = "summary-strip exam-summary-strip";
  [
    ["Countdown", getExamCountdown(exam.date)],
    ["Exam Date", exam.date],
    ["Subjects", exam.subjects.length],
    ["Remaining", stats.remainingTopics]
  ].forEach(function (item) {
    const cell = document.createElement("div");
    cell.innerHTML = `<span>${item[0]}</span><strong>${item[1]}</strong>`;
    strip.appendChild(cell);
  });
  return strip;
}

function renderExamSyllabus(exam) {
  const panel = document.getElementById("exam-tab-syllabus");
  panel.innerHTML = "";
  const toolbar = document.createElement("div");
  toolbar.className = "exam-toolbar";
  toolbar.innerHTML = "<h3>Syllabus</h3>";
  toolbar.appendChild(createSmallAction("Add subject", function () { addExamSubject(exam.id); }));
  panel.appendChild(toolbar);

  if (exam.subjects.length === 0) {
    appendSimpleItem(panel, "No syllabus topics yet. Add your first subject ->");
    return;
  }

  exam.subjects.forEach(function (subject) {
    panel.appendChild(renderSubjectSyllabus(exam, subject));
  });
}

function renderSubjectSyllabus(exam, subject) {
  const details = document.createElement("details");
  details.className = "syllabus-subject";
  details.open = true;
  const summary = document.createElement("summary");
  const stats = getSubjectStats(subject);
  summary.innerHTML = `<strong>${subject.name}</strong><span>${stats.progressPercent}%</span>`;
  details.appendChild(summary);

  const actions = document.createElement("div");
  actions.className = "compact-actions";
  actions.appendChild(createSmallAction("Add chapter", function () { addExamChapter(exam.id, subject.id); }));
  actions.appendChild(createSmallAction("Delete subject", function () { deleteExamSubject(exam.id, subject.id); }, "danger"));
  details.appendChild(actions);

  subject.chapters.forEach(function (chapter) {
    details.appendChild(renderChapterSyllabus(exam, subject, chapter));
  });
  return details;
}

function renderChapterSyllabus(exam, subject, chapter) {
  const details = document.createElement("details");
  details.className = "syllabus-chapter";
  const stats = getChapterStats(chapter);
  const summary = document.createElement("summary");
  summary.innerHTML = `<strong>${chapter.name}</strong><span>${stats.completedTopics}/${stats.totalTopics}</span>`;
  details.appendChild(summary);

  const list = document.createElement("ul");
  list.className = "shared-list syllabus-topic-list";
  chapter.topics.forEach(function (topic) {
    const item = document.createElement("li");
    const checkbox = document.createElement("input");
    const label = document.createElement("span");
    const edit = createSmallAction("Edit", function () { editExamTopic(exam.id, subject.id, chapter.id, topic.id); });
    const del = createSmallAction("×", function () { deleteExamTopic(exam.id, subject.id, chapter.id, topic.id); }, "danger");
    checkbox.type = "checkbox";
    checkbox.checked = topic.completed;
    checkbox.addEventListener("change", function () { toggleExamTopic(exam.id, subject.id, chapter.id, topic.id); });
    label.textContent = topic.name;
    item.classList.toggle("completed", topic.completed);
    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(edit);
    item.appendChild(del);
    list.appendChild(item);
  });
  details.appendChild(list);

  const actions = document.createElement("div");
  actions.className = "compact-actions";
  actions.appendChild(createSmallAction("Add topic", function () { addExamTopic(exam.id, subject.id, chapter.id); }));
  actions.appendChild(createSmallAction("Delete chapter", function () { deleteExamChapter(exam.id, subject.id, chapter.id); }, "danger"));
  details.appendChild(actions);
  return details;
}

function renderExamPlan(exam) {
  const panel = document.getElementById("exam-tab-plan");
  panel.innerHTML = "";
  const toolbar = document.createElement("div");
  toolbar.className = "exam-toolbar";
  toolbar.innerHTML = "<h3>Milestones</h3>";
  toolbar.appendChild(createSmallAction("Add milestone", function () { addExamMilestone(exam.id); }));
  panel.appendChild(toolbar);

  const list = document.createElement("ul");
  list.className = "shared-list exam-milestone-list";
  if (exam.milestones.length === 0) {
    appendSimpleItem(list, "No milestones yet. Create the next thing you want to finish.");
  } else {
    exam.milestones.forEach(function (milestone) {
      const item = document.createElement("li");
      const checkbox = document.createElement("input");
      const title = document.createElement("span");
      const meta = document.createElement("small");
      const del = createSmallAction("×", function () { deleteExamMilestone(exam.id, milestone.id); }, "danger");
      checkbox.type = "checkbox";
      checkbox.checked = milestone.completed;
      checkbox.addEventListener("change", function () { toggleExamMilestone(exam.id, milestone.id); });
      title.textContent = milestone.title;
      meta.textContent = milestone.dueDate || "No due date";
      item.classList.toggle("completed", milestone.completed);
      item.appendChild(checkbox);
      item.appendChild(title);
      item.appendChild(meta);
      item.appendChild(del);
      list.appendChild(item);
    });
  }
  panel.appendChild(list);
}

function renderExamProgress(exam) {
  const panel = document.getElementById("exam-tab-progress");
  const stats = getExamStats(exam);
  panel.innerHTML = "";
  panel.appendChild(createExamSummaryStrip(exam, stats));
  const list = document.createElement("div");
  list.className = "shared-list exam-progress-list";
  exam.subjects.forEach(function (subject) {
    const row = document.createElement("div");
    const subjectStats = getSubjectStats(subject);
    row.className = "insight-row";
    row.innerHTML = `<span>${subject.name}</span><strong>${subjectStats.progressPercent}%</strong>`;
    list.appendChild(row);
  });
  if (exam.subjects.length === 0) appendSimpleItem(list, "Add subjects to see subject progress.");
  panel.appendChild(list);
}

function createSmallAction(text, handler, tone) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = tone === "danger" ? "text-danger-button" : "text-button";
  button.textContent = text;
  button.addEventListener("click", handler);
  return button;
}

function getSubjectStats(subject) {
  let totalTopics = 0;
  let completedTopics = 0;
  subject.chapters.forEach(function (chapter) {
    const stats = getChapterStats(chapter);
    totalTopics += stats.totalTopics;
    completedTopics += stats.completedTopics;
  });
  return {
    totalTopics,
    completedTopics,
    progressPercent: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)
  };
}

function getChapterStats(chapter) {
  const totalTopics = chapter.topics.length;
  const completedTopics = chapter.topics.filter(function (topic) { return topic.completed; }).length;
  return {
    totalTopics,
    completedTopics,
    progressPercent: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)
  };
}

function addExamSubject(examId) {
  const name = prompt("Subject name");
  if (!name) return;
  const exam = getExamById(examId);
  if (!exam) return;
  exam.subjects.push({ id: createId(), name: name.trim(), chapters: [] });
  persistExamChange();
}

function deleteExamSubject(examId, subjectId) {
  const exam = getExamById(examId);
  if (!exam) return;
  exam.subjects = exam.subjects.filter(function (subject) { return subject.id !== subjectId; });
  persistExamChange();
}

function addExamChapter(examId, subjectId) {
  const name = prompt("Chapter name");
  if (!name) return;
  const subject = getExamSubject(examId, subjectId);
  if (!subject) return;
  subject.chapters.push({ id: createId(), name: name.trim(), topics: [] });
  persistExamChange();
}

function deleteExamChapter(examId, subjectId, chapterId) {
  const subject = getExamSubject(examId, subjectId);
  if (!subject) return;
  subject.chapters = subject.chapters.filter(function (chapter) { return chapter.id !== chapterId; });
  persistExamChange();
}

function addExamTopic(examId, subjectId, chapterId) {
  const name = prompt("Topic name");
  if (!name) return;
  const chapter = getExamChapter(examId, subjectId, chapterId);
  if (!chapter) return;
  chapter.topics.push({ id: createId(), name: name.trim(), completed: false });
  persistExamChange();
}

function editExamTopic(examId, subjectId, chapterId, topicId) {
  const topic = getExamTopic(examId, subjectId, chapterId, topicId);
  if (!topic) return;
  const name = prompt("Edit topic", topic.name);
  if (!name) return;
  topic.name = name.trim();
  persistExamChange();
}

function deleteExamTopic(examId, subjectId, chapterId, topicId) {
  const chapter = getExamChapter(examId, subjectId, chapterId);
  if (!chapter) return;
  chapter.topics = chapter.topics.filter(function (topic) { return topic.id !== topicId; });
  persistExamChange();
}

function toggleExamTopic(examId, subjectId, chapterId, topicId) {
  const topic = getExamTopic(examId, subjectId, chapterId, topicId);
  if (!topic) return;
  topic.completed = !topic.completed;
  persistExamChange();
}

function addExamMilestone(examId) {
  const title = prompt("Milestone title");
  if (!title) return;
  const dueDate = prompt("Due date (YYYY-MM-DD), optional") || "";
  const exam = getExamById(examId);
  if (!exam) return;
  exam.milestones.push({ id: createId(), title: title.trim(), subjectId: "", dueDate: dueDate.trim(), completed: false });
  persistExamChange();
}

function toggleExamMilestone(examId, milestoneId) {
  const exam = getExamById(examId);
  if (!exam) return;
  const milestone = exam.milestones.find(function (candidate) { return candidate.id === milestoneId; });
  if (!milestone) return;
  milestone.completed = !milestone.completed;
  persistExamChange();
}

function deleteExamMilestone(examId, milestoneId) {
  const exam = getExamById(examId);
  if (!exam) return;
  exam.milestones = exam.milestones.filter(function (milestone) { return milestone.id !== milestoneId; });
  persistExamChange();
}

function getExamSubject(examId, subjectId) {
  const exam = getExamById(examId);
  return exam ? exam.subjects.find(function (subject) { return subject.id === subjectId; }) : null;
}

function getExamChapter(examId, subjectId, chapterId) {
  const subject = getExamSubject(examId, subjectId);
  return subject ? subject.chapters.find(function (chapter) { return chapter.id === chapterId; }) : null;
}

function getExamTopic(examId, subjectId, chapterId, topicId) {
  const chapter = getExamChapter(examId, subjectId, chapterId);
  return chapter ? chapter.topics.find(function (topic) { return topic.id === topicId; }) : null;
}

function persistExamChange() {
  saveData();
  renderExams();
  renderPlanner();
  updateHome();
  renderExamWorkspace();
}

function deleteSelectedExam() {
  const exam = getSelectedExam();
  if (!exam) return;
  if (!confirm(`Delete ${exam.name}?`)) return;
  appData.exams = appData.exams.filter(function (candidate) { return candidate.id !== exam.id; });
  appData.selectedExamId = null;
  saveData();
  closeExamWorkspace();
  renderPlanner();
  updateHome();
}

function editSelectedExam() {
  const exam = getSelectedExam();
  if (!exam) return;
  openExamModal(exam);
}

function renderExamPresets() {
  examPresetList.innerHTML = "";
  const categories = [...new Set(examPresets.map(function (preset) { return preset.category; }))];
  categories.forEach(function (category) {
    const group = document.createElement("section");
    const heading = document.createElement("h4");
    const grid = document.createElement("div");
    group.className = "exam-preset-group";
    grid.className = "exam-preset-grid";
    heading.textContent = category;
    group.appendChild(heading);

    examPresets
      .filter(function (preset) { return preset.category === category; })
      .forEach(function (preset) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "exam-preset-button";
        button.textContent = preset.name;
        button.addEventListener("click", function () { chooseExamPreset(preset); });
        grid.appendChild(button);
      });

    group.appendChild(grid);
    examPresetList.appendChild(group);
  });
}

function openExamModal(exam) {
  const isExistingExam = exam && exam.id && Array.isArray(exam.subjects);
  examModal.hidden = false;
  renderExamPresets();

  if (isExistingExam) {
    examForm.dataset.mode = "edit";
    selectedExamPreset = examPresets.find(function (preset) { return preset.name === exam.type; }) || { category: "Other", name: exam.type || "Custom Exam", subjects: [] };
    examPresetStep.hidden = true;
    examForm.hidden = false;
    selectedExamLabel.textContent = selectedExamPreset.name;
    customExamNameField.hidden = false;
    examNameInput.value = exam.name;
    examDateInput.value = exam.date;
    examTitleInput.value = "";
    examSubjectsInput.value = exam.subjects.map(function (subject) { return subject.name; }).join(", ");
    examNameInput.focus();
    return;
  }

  selectedExamPreset = null;
  examForm.dataset.mode = "create";
  examPresetStep.hidden = false;
  examForm.hidden = true;
  examForm.reset();
  selectedExamLabel.textContent = "Choose exam";
  customExamNameField.hidden = true;
}

function closeExamModal() {
  examModal.hidden = true;
  selectedExamPreset = null;
  examForm.dataset.mode = "create";
  examForm.reset();
  examPresetStep.hidden = false;
  examForm.hidden = true;
}

function chooseExamPreset(preset) {
  if (!preset || !preset.name) return;
  selectedExamPreset = {
    category: preset.category,
    name: preset.name,
    subjects: Array.isArray(preset.subjects) ? preset.subjects.slice() : []
  };
  const isCustom = selectedExamPreset.name === "Custom Exam";
  examPresetStep.hidden = true;
  examForm.hidden = false;
  selectedExamLabel.textContent = selectedExamPreset.name;
  customExamNameField.hidden = !isCustom;
  examNameInput.required = isCustom;
  examNameInput.value = "";
  examTitleInput.value = "";
  examDateInput.value = "";
  examSubjectsInput.value = selectedExamPreset.subjects.join(", ");
  if (isCustom) {
    examNameInput.focus();
  } else {
    examDateInput.focus();
  }
}

function showExamPresetStep() {
  selectedExamPreset = null;
  examPresetStep.hidden = false;
  examForm.hidden = true;
  examForm.reset();
  selectedExamLabel.textContent = "Choose exam";
}

function handleExamModalBackdrop(event) {
  if (event.target === examModal) closeExamModal();
}

function addDistraction(event) {
  event.preventDefault();
  const reason = distractionInput.value.trim();
  if (!reason) return;
  const now = new Date();

  appData.distractions.unshift({
    id: createId(),
    category: distractionCategory.value,
    reason,
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: getTodayKey(),
    timestamp: now.toISOString(),
    sessionId: appData.activeSession ? appData.activeSession.id : null
  });

  distractionInput.value = "";
  saveData();
  renderDistractions();
}

function renderDistractions() {
  distractionList.innerHTML = "";
  if (appData.distractions.length === 0) {
    appendSimpleItem(distractionList, "No distractions logged today.");
    return;
  }

  appData.distractions.slice(0, 8).forEach(function (entry) {
    const item = document.createElement("li");
    const category = document.createElement("strong");
    const reason = document.createTextNode(`: ${entry.reason}`);
    const time = document.createElement("span");
    category.textContent = entry.category;
    time.textContent = entry.time;
    item.appendChild(category);
    item.appendChild(reason);
    item.appendChild(time);
    distractionList.appendChild(item);
  });
}

function renderLeaderboard() {
  leaderboardTable.innerHTML = "";
  const range = appData.selectedLeaderboardRange;
  const sessions = getSessionsForRange(range);
  const rangeSeconds = range === "today" ? appData.studySeconds : getSecondsFromSessions(sessions);
  const rangeTasks = getTasksForRange(range).filter(function (task) { return task.completed; }).length;

  leaderboardTabs.forEach(function (tab) {
    const isActive = tab.dataset.leaderboardRange === range;
    tab.classList.toggle("active", isActive);
    tab.classList.toggle("secondary-button", !isActive);
  });

  const users = [
    { rank: 1, name: "You", time: formatShortTime(rangeSeconds), streak: `${appData.streak} days`, tasks: rangeTasks, source: "Your local data" },
    { rank: 2, name: "Demo Maya", time: "3h 20m", streak: "5 days", tasks: 6, source: "Demo data" },
    { rank: 3, name: "Demo Arif", time: "2h 45m", streak: "3 days", tasks: 4, source: "Demo data" }
  ];

  users.forEach(function (user) {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    ["#" + user.rank, user.name, user.time, user.streak, `${user.tasks} tasks (${user.source})`].forEach(function (value, index) {
      const cell = document.createElement(index === 0 ? "strong" : "span");
      cell.textContent = value;
      row.appendChild(cell);
    });
    leaderboardTable.appendChild(row);
  });
}

function renderThemes() {
  themeGrid.innerHTML = "";
  themes.forEach(function (theme) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-option";
    button.textContent = theme.name;
    button.classList.toggle("active", appData.theme === theme.id);
    button.addEventListener("click", function () {
      appData.theme = theme.id;
      appData.accentColor = theme.accent;
      applyAppearance();
      saveData();
      renderThemes();
    });
    themeGrid.appendChild(button);
  });
}

function getCurrentTheme() {
  return themes.find(function (theme) {
    return theme.id === appData.theme;
  }) || themes[0];
}

function applyAppearance() {
  const theme = getCurrentTheme();
  const accent = appData.accentColor || theme.accent;
  document.body.dataset.theme = appData.theme;
  document.documentElement.style.setProperty("--primary", accent);
  document.documentElement.style.setProperty("--primary-dark", accent);
  document.documentElement.style.setProperty("--accent", theme.secondaryAccent);
  accentInput.value = accent;
}

function saveAccentColor() {
  appData.accentColor = accentInput.value;
  applyAppearance();
  saveData();
  renderThemes();
}

function resetAccentColor() {
  appData.accentColor = getCurrentTheme().accent;
  applyAppearance();
  saveData();
}

function toggleSidebar() {
  appData.sidebarCollapsed = !appData.sidebarCollapsed;
  applySidebarState();
  saveData();
}

function applySidebarState() {
  document.body.classList.toggle("sidebar-collapsed", appData.sidebarCollapsed);
}

function leaveFocusRoom(shouldRender = true) {
  const room = getRoomById(appData.activeRoomId);
  if (room) {
    room.members = room.members.filter(function (member) { return member.id !== "you"; });
  }

  appData.activeRoomId = null;
  stopRoomTimer();
  saveData();
  if (shouldRender) renderStudyCircles();
}

function getRoomElapsedSeconds(room) {
  if (room.status !== "Studying" || !room.statusStartedAt) return room.elapsedSeconds;
  return room.elapsedSeconds + Math.floor((Date.now() - new Date(room.statusStartedAt).getTime()) / 1000);
}

function startRoomTimer() {
  if (roomTimerId) return;
  roomTimerId = setInterval(renderActiveRoom, 1000);
}

function stopRoomTimer() {
  clearInterval(roomTimerId);
  roomTimerId = null;
}

function getCircleById(circleId) {
  return appData.studyCircles.find(function (circle) {
    return String(circle.id) === String(circleId);
  });
}

function getRoomById(roomId) {
  for (const circle of appData.studyCircles) {
    const room = circle.rooms.find(function (candidate) {
      return String(candidate.id) === String(roomId);
    });
    if (room) return room;
  }
  return null;
}

function appendMemberRow(parent, label, value) {
  const row = document.createElement("div");
  row.className = "member-row";
  const name = document.createElement("span");
  const status = document.createElement("strong");
  name.textContent = label;
  status.textContent = value;
  row.appendChild(name);
  row.appendChild(status);
  parent.appendChild(row);
}

function renderStudyCircles() {
  const selectedCircle = getSelectedCircle();
  const isWorkspaceView = appData.groupsView === "workspace" && selectedCircle;

  groupsPageHeader.hidden = Boolean(isWorkspaceView);
  groupsListView.hidden = Boolean(isWorkspaceView);
  groupWorkspace.hidden = !isWorkspaceView;

  if (isWorkspaceView) {
    groupCardList.innerHTML = "";
    renderGroupWorkspace(selectedCircle);
    renderActiveRoom();
    return;
  }

  appData.groupsView = "list";
  appData.selectedCircleId = null;
  renderGroupList();
}

function renderGroupList() {
  groupCardList.innerHTML = "";
  groupCountLabel.textContent = `${appData.studyCircles.length} ${appData.studyCircles.length === 1 ? "group" : "groups"}`;

  if (appData.studyCircles.length === 0) {
    appendSimpleItem(groupCardList, "No groups yet. Create one with your study partners.");
    return;
  }

  appData.studyCircles.forEach(function (circle) {
    const card = document.createElement("button");
    const top = document.createElement("span");
    const icon = document.createElement("span");
    const titleWrap = document.createElement("span");
    const name = document.createElement("strong");
    const description = document.createElement("small");
    const stats = document.createElement("span");
    const challenge = getCurrentChallenge(circle);
    const challengePreview = document.createElement("span");

    card.type = "button";
    card.className = "group-card";
    top.className = "group-card-top";
    icon.className = "group-avatar";
    titleWrap.className = "group-card-title";
    stats.className = "group-card-stats";
    challengePreview.className = "group-card-challenge";

    icon.textContent = circle.icon;
    name.textContent = circle.name;
    description.textContent = circle.description;
    stats.innerHTML = `<span>${circle.members.length} members</span><span>${getActiveMemberCount(circle)} studying now</span><span>${formatShortTime(getGroupStudySeconds(circle))} today</span>`;
    challengePreview.textContent = challenge ? `Challenge: ${challenge.title}` : "No active challenge";

    titleWrap.appendChild(name);
    titleWrap.appendChild(description);
    top.appendChild(icon);
    top.appendChild(titleWrap);
    card.appendChild(top);
    card.appendChild(stats);
    card.appendChild(challengePreview);
    card.addEventListener("click", function () { openGroupWorkspace(circle.id); });
    groupCardList.appendChild(card);
  });
}

function renderGroupWorkspace(circle) {
  if (!circle) return;

  groupWorkspaceIcon.textContent = circle.icon;
  groupWorkspaceName.textContent = circle.name;
  groupWorkspaceDescription.textContent = circle.description;
  groupWorkspaceMeta.innerHTML = "";
  [`${circle.members.length} members`, `${getActiveMemberCount(circle)} studying now`, `${circle.rooms.length} rooms`].forEach(function (label) {
    const item = document.createElement("span");
    item.textContent = label;
    groupWorkspaceMeta.appendChild(item);
  });

  groupTabs.forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.groupTab === appData.selectedCircleTab);
  });

  groupTabPanels.forEach(function (panel) {
    panel.classList.toggle("active", panel.id === `group-tab-${appData.selectedCircleTab}`);
  });

  renderGroupOverview(circle);
  renderGroupRooms(circle);
  renderGroupChallenges(circle);
  renderGroupMembers(circle);
  renderGroupRanking(circle);
}

function openGroupWorkspace(circleId) {
  appData.selectedCircleId = circleId;
  appData.groupsView = "workspace";
  appData.selectedCircleTab = appData.selectedCircleTab || "overview";
  saveData();
  renderStudyCircles();
}

function closeGroupWorkspace() {
  appData.selectedCircleId = null;
  appData.groupsView = "list";
  saveData();
  renderStudyCircles();
}

function renderGroupOverview(circle) {
  groupStudyingNow.innerHTML = "";
  groupOverviewSummary.innerHTML = "";
  const activeMembers = circle.members.filter(function (member) {
    return ["Studying", "Short Break", "Long Break"].includes(member.status);
  });

  if (activeMembers.length === 0) {
    appendSimpleItem(groupStudyingNow, "No one is studying in this local prototype right now.");
  } else {
    activeMembers.forEach(function (member) {
      groupStudyingNow.appendChild(createCompactRow(member.name, `${member.status} - ${member.subject}`, formatShortTime(member.totalSeconds)));
    });
  }

  [
    ["Group study time", formatShortTime(getGroupStudySeconds(circle))],
    ["Studying now", getActiveMemberCount(circle)],
    ["Sessions today", getGroupSessionCount(circle)]
  ].forEach(function (item) {
    const cell = document.createElement("div");
    cell.innerHTML = `<span>${item[0]}</span><strong>${item[1]}</strong>`;
    groupOverviewSummary.appendChild(cell);
  });

  renderCurrentChallenge(circle);
  renderGroupActivity(circle);
}

function renderCurrentChallenge(circle) {
  groupCurrentChallenge.innerHTML = "";
  const challenge = getCurrentChallenge(circle);
  if (!challenge) {
    appendSimpleItem(groupCurrentChallenge, "No current challenge. Create one when the group has a shared target.");
    return;
  }

  groupCurrentChallenge.appendChild(createChallengeCard(challenge, true));
}

function renderGroupActivity(circle) {
  groupActivityList.innerHTML = "";
  if (circle.activity.length === 0) {
    appendSimpleItem(groupActivityList, "Local activity will appear here after rooms or challenges are used.");
    return;
  }

  circle.activity.slice(0, 5).forEach(function (item) {
    groupActivityList.appendChild(createCompactRow(item.text, formatActivityTime(item.createdAt), ""));
  });
}

function renderGroupRooms(circle) {
  groupRoomList.innerHTML = "";
  if (circle.rooms.length === 0) {
    appendSimpleItem(groupRoomList, "No focus rooms active. Start a room when you're ready to study together.");
    return;
  }

  circle.rooms.forEach(function (room) {
    const card = document.createElement("article");
    const header = document.createElement("div");
    const title = document.createElement("h3");
    const purpose = document.createElement("p");
    const stats = document.createElement("div");
    const live = document.createElement("strong");
    const action = document.createElement("button");
    const activeRoomMembers = room.members.filter(function (member) {
      return member.status === "Studying";
    }).length;

    card.className = "room-card";
    header.className = "room-card-header";
    purpose.className = "muted-text";
    stats.className = "room-card-stats";
    live.className = "room-live-copy";
    title.textContent = room.name;
    purpose.textContent = room.subject;
    live.textContent = room.status === "Studying"
      ? `${activeRoomMembers || room.members.length} studying now`
      : `${room.members.length} ${room.members.length === 1 ? "member" : "members"} - ${room.status}`;
    stats.innerHTML = `<span>${formatShortTime(getRoomElapsedSeconds(room))} elapsed</span><span>${room.maxMembers} max</span>`;
    action.type = "button";
    action.textContent = appData.activeRoomId === room.id ? "Joined" : room.status === "Paused" ? "Open" : "Join Room";
    action.className = appData.activeRoomId === room.id ? "secondary-button" : "";
    action.disabled = appData.activeRoomId !== room.id && room.members.length >= room.maxMembers;
    action.addEventListener("click", function () { joinFocusRoom(room.id); });

    header.appendChild(title);
    header.appendChild(action);
    card.appendChild(header);
    card.appendChild(purpose);
    card.appendChild(live);
    card.appendChild(stats);
    groupRoomList.appendChild(card);
  });
}

function renderGroupChallenges(circle) {
  groupChallengeList.innerHTML = "";
  challengeStatusFilters.querySelectorAll("button").forEach(function (button) {
    button.classList.toggle("active", button.dataset.challengeStatus === appData.selectedChallengeStatus);
  });

  const selectedChallenge = getChallengeById(appData.selectedChallengeId);
  challengeListView.hidden = Boolean(selectedChallenge);
  challengeDetailView.hidden = !selectedChallenge;

  if (selectedChallenge) {
    renderChallengeDetail(circle, selectedChallenge);
    return;
  }

  const challenges = circle.challenges.filter(function (challenge) {
    return getChallengeStatus(challenge) === appData.selectedChallengeStatus;
  });

  if (challenges.length === 0) {
    const emptyCopy = appData.selectedChallengeStatus === "completed"
      ? "No completed challenges yet. Finished challenges will stay here."
      : appData.selectedChallengeStatus === "upcoming"
        ? "No upcoming challenges yet."
        : "No active challenges yet. Create a competition or group goal.";
    appendSimpleItem(groupChallengeList, emptyCopy);
    return;
  }

  challenges.forEach(function (challenge) {
    groupChallengeList.appendChild(createChallengeCard(challenge, false, circle));
  });
}

function renderGroupMembers(circle) {
  groupMemberList.innerHTML = "";
  circle.members.forEach(function (member) {
    const row = document.createElement("div");
    row.className = "member-table-row";
    row.innerHTML = `
      <span class="group-avatar">${getInitials(member.name)}</span>
      <span><strong>${member.name}</strong><small>${member.status} - ${member.subject}</small></span>
      <span>${formatShortTime(member.totalSeconds)} today</span>
      <span>${member.streak}-day streak</span>
    `;
    groupMemberList.appendChild(row);
  });
}

function renderGroupRanking(circle) {
  groupRankingList.innerHTML = "";
  groupRankingFilters.querySelectorAll("button").forEach(function (button) {
    button.classList.toggle("active", button.dataset.rankingRange === appData.selectedRankingRange);
  });

  const header = document.createElement("div");
  header.className = "ranking-row ranking-head";
  header.innerHTML = "<span>Rank</span><span>Name</span><span>Study time</span><span>Streak</span><span>Tasks</span>";
  groupRankingList.appendChild(header);

  circle.members
    .slice()
    .sort(function (first, second) { return second.totalSeconds - first.totalSeconds; })
    .forEach(function (member, index) {
      const row = document.createElement("div");
      row.className = "ranking-row";
      row.innerHTML = `<span>#${index + 1}</span><span>${member.name}</span><span>${formatShortTime(member.totalSeconds)}</span><span>${member.streak}</span><span>${member.tasksCompleted}</span>`;
      groupRankingList.appendChild(row);
    });
}

function openGroupModal(mode) {
  const circle = getSelectedCircle();
  groupForm.dataset.mode = mode;
  groupModal.hidden = false;
  groupModalTitle.textContent = mode === "edit" ? "Group Settings" : "Create Group";
  saveGroupButton.textContent = mode === "edit" ? "Save Changes" : "Create Group";
  deleteGroupButton.hidden = mode !== "edit";
  groupNameInput.value = mode === "edit" && circle ? circle.name : "";
  groupIconInput.value = mode === "edit" && circle ? circle.icon : "";
  groupDescriptionInput.value = mode === "edit" && circle ? circle.description : "";
  groupPrivacyInput.value = mode === "edit" && circle ? circle.privacy : "private";
  groupNameInput.focus();
}

function closeGroupModal() {
  groupModal.hidden = true;
  groupForm.reset();
  groupForm.dataset.mode = "create";
}

function saveGroup(event) {
  event.preventDefault();
  const selectedCircle = getSelectedCircle();
  const circleName = groupNameInput.value.trim();
  const circleIcon = groupIconInput.value.trim().slice(0, 3).toUpperCase() || getInitials(circleName);
  const circleDescription = groupDescriptionInput.value.trim() || "A shared StudyMate group.";
  if (!circleName) return;

  if (selectedCircle && groupForm.dataset.mode === "edit") {
    selectedCircle.name = circleName;
    selectedCircle.icon = circleIcon;
    selectedCircle.description = circleDescription;
    selectedCircle.privacy = groupPrivacyInput.value;
    addGroupActivity(selectedCircle, "Group settings were updated.");
  } else {
    const newCircle = {
      id: createId(),
      name: circleName,
      icon: circleIcon,
      description: circleDescription,
      privacy: groupPrivacyInput.value,
      inviteCode: generateInviteCode(),
      members: [{ id: "you", name: "You", status: "Paused", subject: getSelectedSubject().name, totalSeconds: appData.studySeconds, streak: appData.streak, tasksCompleted: getCompletedTaskCount() }],
      rooms: [],
      challenges: [],
      activity: [],
      createdAt: new Date().toISOString()
    };
    addGroupActivity(newCircle, "You created the group.");
    appData.studyCircles.push(newCircle);
    appData.selectedCircleId = newCircle.id;
    appData.groupsView = "workspace";
    appData.selectedCircleTab = "overview";
  }

  closeGroupModal();
  saveData();
  renderStudyCircles();
}

function deleteSelectedGroup() {
  const circle = getSelectedCircle();
  if (!circle) return;
  if (!confirm(`Delete ${circle.name}?`)) return;

  appData.studyCircles = appData.studyCircles.filter(function (candidate) { return candidate.id !== circle.id; });
  appData.selectedCircleId = null;
  appData.groupsView = "list";
  if (appData.activeRoomId && !getRoomById(appData.activeRoomId)) appData.activeRoomId = null;
  closeGroupModal();
  saveData();
  renderStudyCircles();
}

function openJoinGroupModal() {
  joinGroupModal.hidden = false;
  joinGroupForm.reset();
  joinGroupMessage.textContent = "";
  joinCodeInput.focus();
}

function closeJoinGroupModal() {
  joinGroupModal.hidden = true;
  joinGroupForm.reset();
  joinGroupMessage.textContent = "";
}

function joinGroupByCode(event) {
  event.preventDefault();
  const code = joinCodeInput.value.trim().toUpperCase();
  const circle = appData.studyCircles.find(function (candidate) {
    return candidate.inviteCode.toUpperCase() === code;
  });

  if (!circle) {
    joinGroupMessage.textContent = "This code is not saved in this browser yet. Shared joining needs accounts and a backend later.";
    return;
  }

  appData.selectedCircleId = circle.id;
  appData.groupsView = "workspace";
  appData.selectedCircleTab = "overview";
  closeJoinGroupModal();
  saveData();
  renderStudyCircles();
}

function openInviteModal() {
  const circle = getSelectedCircle();
  if (!circle) return;
  inviteModal.hidden = false;
  inviteCodeDisplay.textContent = circle.inviteCode;
  inviteCopyMessage.textContent = "Sharing across devices requires accounts and a backend later.";
}

function closeInviteModal() {
  inviteModal.hidden = true;
}

function copyInviteCode() {
  const circle = getSelectedCircle();
  if (!circle) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(circle.inviteCode);
    inviteCopyMessage.textContent = "Code copied for this local prototype.";
  } else {
    inviteCopyMessage.textContent = circle.inviteCode;
  }
}

function openRoomModal() {
  roomModal.hidden = false;
  roomForm.reset();
  roomMaxInput.value = 8;
  roomNameInput.focus();
}

function closeRoomModal() {
  roomModal.hidden = true;
  roomForm.reset();
  roomMaxInput.value = 8;
}

function createFocusRoom(event) {
  event.preventDefault();
  const circle = getSelectedCircle();
  if (!circle) return;

  circle.rooms.unshift({
    id: createId(),
    name: roomNameInput.value.trim(),
    icon: getInitials(roomNameInput.value.trim()),
    description: "A local prototype focus room.",
    subject: roomSubjectInput.value.trim(),
    maxMembers: Math.max(2, Number(roomMaxInput.value) || 8),
    privacy: roomPrivacyInput.value,
    status: "Paused",
    elapsedSeconds: 0,
    statusStartedAt: null,
    members: []
  });

  addGroupActivity(circle, `Created room: ${roomNameInput.value.trim()}.`);
  closeRoomModal();
  appData.selectedCircleTab = "rooms";
  saveData();
  renderStudyCircles();
}

function joinFocusRoom(roomId) {
  const room = getRoomById(roomId);
  if (!room) return;

  leaveFocusRoom(false);
  if (!room.members.some(function (member) { return member.id === "you"; })) {
    room.members.push({ id: "you", name: "You", status: room.status, subject: room.subject, joinedAt: new Date().toISOString() });
  }

  appData.activeRoomId = room.id;
  appData.selectedCircleTab = "rooms";
  const circle = getCircleForRoom(room.id);
  if (circle) addGroupActivity(circle, `You joined ${room.name}.`);
  saveData();
  renderStudyCircles();
}

function renderActiveRoom() {
  const room = getRoomById(appData.activeRoomId);

  if (!room) {
    groupRoomLive.hidden = true;
    activeRoomName.textContent = "No room joined";
    activeRoomDescription.textContent = "Join a room to see the local prototype session.";
    activeRoomSubject.textContent = "-";
    activeRoomTimer.textContent = "0h 00m";
    activeRoomStatus.textContent = "Paused";
    activeRoomMembers.innerHTML = "";
    roomStatusControls.innerHTML = "";
    leaveRoomButton.disabled = true;
    return;
  }

  groupRoomLive.hidden = false;
  leaveRoomButton.disabled = false;
  activeRoomName.textContent = room.name;
  activeRoomDescription.textContent = room.description;
  activeRoomSubject.textContent = room.subject;
  activeRoomTimer.textContent = formatShortTime(getRoomElapsedSeconds(room));
  activeRoomStatus.textContent = room.status;
  renderRoomStatusControls(room);
  renderActiveRoomMembers(room);
}

function renderRoomStatusControls(room) {
  const statuses = ["Studying", "Short Break", "Long Break", "Paused"];
  roomStatusControls.innerHTML = "";
  statuses.forEach(function (status) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = room.status === status ? "active" : "";
    button.textContent = status;
    button.addEventListener("click", function () { updateRoomStatus(room.id, status); });
    roomStatusControls.appendChild(button);
  });
}

function renderActiveRoomMembers(room) {
  activeRoomMembers.innerHTML = "";
  const members = room.members.length > 0 ? room.members : [{ id: "you", name: "You", status: room.status, subject: room.subject }];
  members.forEach(function (member) {
    activeRoomMembers.appendChild(createCompactRow(member.name, `${member.status} - ${member.subject || room.subject}`, getMemberRoomTime(member)));
  });
}

function updateRoomStatus(roomId, status) {
  const room = getRoomById(roomId);
  if (!room) return;

  room.elapsedSeconds = getRoomElapsedSeconds(room);
  room.status = status;
  room.statusStartedAt = status === "Studying" ? new Date().toISOString() : null;
  room.members = room.members.map(function (member) {
    return member.id === "you" ? { ...member, status, subject: room.subject } : member;
  });

  if (status === "Studying") startRoomTimer();
  if (status !== "Studying") stopRoomTimer();

  const circle = getCircleForRoom(room.id);
  if (circle) addGroupActivity(circle, `You changed ${room.name} to ${status}.`);
  saveData();
  renderStudyCircles();
}

function getSelectedCircle() {
  return getCircleById(appData.selectedCircleId);
}

function getCircleForRoom(roomId) {
  return appData.studyCircles.find(function (circle) {
    return circle.rooms.some(function (room) {
      return String(room.id) === String(roomId);
    });
  });
}

function openChallengeModal() {
  challengeDraft = createChallengeDraft();
  challengeModal.hidden = false;
  challengeForm.reset();
  challengeTitleInput.value = "7-Day Study Sprint";
  challengeTargetInput.value = 20;
  challengeStartInput.value = challengeDraft.startDate;
  challengeEndInput.value = challengeDraft.endDate;
  renderChallengeModalStep();
  challengeTitleInput.focus();
}

function closeChallengeModal() {
  challengeModal.hidden = true;
  challengeForm.reset();
  challengeDraft = createChallengeDraft();
}

function createChallengeDraft() {
  return {
    step: 1,
    format: "solo",
    metric: "study-time",
    durationDays: 7,
    participantMode: "all",
    startDate: getTodayKey(),
    endDate: addDaysToDate(getTodayKey(), 7)
  };
}

function renderChallengeModalStep() {
  challengeSteps.forEach(function (step) {
    step.classList.toggle("active", Number(step.dataset.challengeStep) === challengeDraft.step);
  });

  challengeStepLabel.textContent = `Step ${challengeDraft.step} of 4`;
  challengePrevButton.hidden = challengeDraft.step === 1;
  challengeNextButton.hidden = challengeDraft.step === 4;
  challengeCreateButton.hidden = challengeDraft.step !== 4;

  updateOptionState(challengeFormatOptions, "challengeFormat", challengeDraft.format);
  updateOptionState(challengeMetricOptions, "challengeMetric", challengeDraft.metric);
  updateDurationOptionState();
  updateOptionState(challengeParticipantOptions, "participantMode", challengeDraft.participantMode);
  updateParticipantHelp();
}

function updateOptionState(container, dataKey, value) {
  container.querySelectorAll("button").forEach(function (button) {
    button.classList.toggle("active", button.dataset[dataKey] === value);
  });
}

function updateDurationOptionState() {
  challengeDurationOptions.querySelectorAll("button").forEach(function (button) {
    button.classList.toggle("active", String(button.dataset.durationDays) === String(challengeDraft.durationDays));
  });
}

function updateParticipantHelp() {
  const help = {
    solo: "Solo challenges can include everyone or selected members.",
    duo: "Duo challenges combine two members per pair. Random pairs work in this local prototype.",
    teams: "Team challenges combine larger groups. Random teams work in this local prototype.",
    "group-goal": "Group goals include everyone working toward one shared target."
  };
  challengeParticipantHelp.textContent = help[challengeDraft.format];

  challengeParticipantOptions.querySelectorAll("button").forEach(function (button) {
    const mode = button.dataset.participantMode;
    const isGroupGoal = challengeDraft.format === "group-goal";
    button.hidden = isGroupGoal ? mode !== "all" : false;
  });
}

function goToChallengeStep(direction) {
  if (challengeDraft.step === 3) syncChallengeDurationFields();
  challengeDraft.step = Math.min(4, Math.max(1, challengeDraft.step + direction));
  renderChallengeModalStep();
}

function syncChallengeDurationFields() {
  challengeDraft.startDate = challengeStartInput.value || getTodayKey();
  challengeDraft.endDate = challengeEndInput.value || addDaysToDate(challengeDraft.startDate, Number(challengeDraft.durationDays) || 7);
}

function createChallenge(event) {
  event.preventDefault();
  const circle = getSelectedCircle();
  if (!circle) return;

  syncChallengeDurationFields();
  const metric = challengeDraft.metric;
  const format = challengeDraft.format;
  const title = challengeTitleInput.value.trim() || getDefaultChallengeTitle(format, metric);
  const challenge = {
    id: createId(),
    title,
    format,
    metric,
    target: Math.max(1, Number(challengeTargetInput.value) || 1),
    unit: getChallengeUnit(metric),
    startDate: challengeDraft.startDate,
    endDate: challengeDraft.endDate,
    participantMode: challengeDraft.participantMode,
    participants: circle.members.map(function (member) { return member.id; }),
    entries: [],
    progress: 0,
    yourProgress: 0,
    completedAt: "",
    result: null,
    createdAt: new Date().toISOString()
  };

  challenge.entries = buildChallengeEntries(challenge, circle.members);
  refreshChallengeProgress(challenge, circle);

  circle.challenges.unshift(challenge);
  addGroupActivity(circle, `Challenge started: ${challenge.title}.`);
  closeChallengeModal();
  appData.selectedCircleTab = "challenges";
  appData.selectedChallengeStatus = getChallengeStatus(challenge);
  appData.selectedChallengeId = challenge.id;
  saveData();
  renderStudyCircles();
}

function updateChallengeProgress(challengeId, amount) {
  const circle = getSelectedCircle();
  if (!circle) return;
  const challenge = circle.challenges.find(function (candidate) { return candidate.id === challengeId; });
  if (!challenge) return;

  const entry = challenge.entries.find(function (candidate) {
    return candidate.memberIds.includes("you") || candidate.id === "group";
  });
  if (entry) entry.progress = Math.max(0, entry.progress + amount);
  refreshChallengeProgress(challenge, circle);
  addGroupActivity(circle, `Updated challenge progress: ${challenge.title}.`);
  saveData();
  renderStudyCircles();
}

function createChallengeCard(challenge, compact, circle) {
  const card = document.createElement("article");
  const status = getChallengeStatus(challenge);
  const leader = getChallengeLeader(challenge);
  const progressPercent = getChallengeProgressPercent(challenge);
  card.className = compact ? "challenge-card challenge-strip compact" : "challenge-card";
  card.innerHTML = `
    <div class="section-mini-header">
      <div>
        <h3>${challenge.title}</h3>
        <p class="muted-text">${formatChallengeFormat(challenge.format)} - ${formatChallengeMetric(challenge.metric)} - ${getChallengeTimeLabel(challenge)}</p>
      </div>
      <span class="status-pill">${status}</span>
    </div>
    <div class="challenge-progress">
      <span>${challenge.format === "group-goal" ? "Group progress" : "Current leader"}</span>
      <strong>${challenge.format === "group-goal" ? `${formatChallengeValue(challenge.progress, challenge.metric)} / ${formatChallengeValue(challenge.target, challenge.metric)}` : `${leader.name} - ${formatChallengeValue(leader.progress, challenge.metric)}`}</strong>
      <div class="progress-bar"><span style="width: ${progressPercent}%"></span></div>
    </div>
  `;

  if (!compact) {
    const actions = document.createElement("div");
    actions.className = "compact-actions";
    actions.appendChild(createSmallAction("Open", function () {
      appData.selectedChallengeId = challenge.id;
      saveData();
      renderStudyCircles();
    }));
    actions.appendChild(createSmallAction("+1", function () { updateChallengeProgress(challenge.id, 1); }));
    actions.appendChild(createSmallAction("-1", function () { updateChallengeProgress(challenge.id, -1); }));
    card.appendChild(actions);
  } else if (circle) {
    card.addEventListener("click", function () {
      appData.selectedCircleTab = "challenges";
      appData.selectedChallengeId = challenge.id;
      saveData();
      renderStudyCircles();
    });
  }

  return card;
}

function renderChallengeDetail(circle, challenge) {
  refreshChallengeProgress(challenge, circle);
  const leader = getChallengeLeader(challenge);
  const isGroupGoal = challenge.format === "group-goal";
  const status = getChallengeStatus(challenge);
  const result = status === "completed" ? getChallengeResult(challenge) : null;
  challengeDetailContent.innerHTML = "";

  const header = document.createElement("article");
  header.className = "challenge-detail-header";
  header.innerHTML = `
    <div>
      <p class="eyebrow">${formatChallengeFormat(challenge.format)} - ${formatChallengeMetric(challenge.metric)}</p>
      <h3>${challenge.title}</h3>
      <p class="muted-text">${getChallengeTimeLabel(challenge)}</p>
    </div>
    <div class="summary-strip compact">
      <div><span>Status</span><strong>${status}</strong></div>
      <div><span>${isGroupGoal ? "Progress" : "Leader"}</span><strong>${isGroupGoal ? `${formatChallengeValue(challenge.progress, challenge.metric)} / ${formatChallengeValue(challenge.target, challenge.metric)}` : leader.name}</strong></div>
      <div><span>Your progress</span><strong>${formatChallengeValue(challenge.yourProgress, challenge.metric)}</strong></div>
    </div>
  `;
  challengeDetailContent.appendChild(header);

  if (result) {
    const resultBox = document.createElement("article");
    resultBox.className = "challenge-result-box";
    resultBox.innerHTML = `<h3>${isGroupGoal ? result.title : "Challenge Complete"}</h3><p>${result.copy}</p>`;
    challengeDetailContent.appendChild(resultBox);
  }

  const list = document.createElement("div");
  list.className = isGroupGoal ? "challenge-contribution-list" : "challenge-leaderboard";
  const rows = challenge.entries.slice().sort(function (first, second) {
    return second.progress - first.progress;
  });

  rows.forEach(function (entry, index) {
    const row = document.createElement("div");
    row.className = "ranking-row";
    row.innerHTML = `<span>${isGroupGoal ? "" : `#${index + 1}`}</span><span>${entry.name}<small>${getEntryMembers(entry, circle)}</small></span><span>${formatChallengeValue(entry.progress, challenge.metric)}</span><span>${getEntryPercent(entry, challenge)}%</span><span>${entry.memberIds.includes("you") ? "You" : ""}</span>`;
    list.appendChild(row);
  });

  challengeDetailContent.appendChild(list);
}

function createCompactRow(title, meta, value) {
  const row = document.createElement("div");
  row.className = "compact-row";
  const copy = document.createElement("span");
  const titleEl = document.createElement("strong");
  const metaEl = document.createElement("small");
  const valueEl = document.createElement("span");
  titleEl.textContent = title;
  metaEl.textContent = meta;
  valueEl.textContent = value;
  copy.appendChild(titleEl);
  copy.appendChild(metaEl);
  row.appendChild(copy);
  if (value) row.appendChild(valueEl);
  return row;
}

function getActiveMemberCount(circle) {
  return circle.members.filter(function (member) {
    return ["Studying", "Short Break", "Long Break"].includes(member.status);
  }).length;
}

function getGroupStudySeconds(circle) {
  return circle.members.reduce(function (total, member) {
    return total + Number(member.totalSeconds || 0);
  }, 0);
}

function getCurrentChallenge(circle) {
  return circle.challenges.find(function (challenge) {
    return getChallengeStatus(challenge) === "active";
  }) || null;
}

function getChallengeById(challengeId) {
  for (const circle of appData.studyCircles) {
    const challenge = circle.challenges.find(function (candidate) {
      return String(candidate.id) === String(challengeId);
    });
    if (challenge) return challenge;
  }
  return null;
}

function refreshChallengeProgress(challenge, circle) {
  if (challenge.entries.length === 0) {
    challenge.entries = buildChallengeEntries(challenge, circle.members);
  }

  challenge.entries.forEach(function (entry) {
    if (entry.manual) return;
    const members = circle.members.filter(function (member) {
      return entry.memberIds.includes(member.id);
    });
    entry.progress = challenge.format === "group-goal"
      ? getGroupMetricProgress(circle.members, challenge.metric)
      : getGroupMetricProgress(members, challenge.metric);
  });

  const yourEntry = challenge.entries.find(function (entry) {
    return entry.memberIds.includes("you") || entry.id === "group";
  });
  challenge.yourProgress = yourEntry ? yourEntry.progress : 0;
  challenge.progress = challenge.format === "group-goal"
    ? (challenge.entries[0] ? challenge.entries[0].progress : 0)
    : Math.max(0, ...challenge.entries.map(function (entry) { return entry.progress; }));

  if (getChallengeStatus(challenge) === "completed" && !challenge.result) {
    challenge.result = getChallengeResult(challenge);
    challenge.completedAt = new Date().toISOString();
  }
}

function getChallengeStatus(challenge) {
  const today = getTodayKey();
  if (challenge.completedAt || today > challenge.endDate) return "completed";
  if (today < challenge.startDate) return "upcoming";
  return "active";
}

function getChallengeLeader(challenge) {
  return challenge.entries.slice().sort(function (first, second) {
    return second.progress - first.progress;
  })[0] || { name: "No leader yet", progress: 0, memberIds: [] };
}

function getChallengeResult(challenge) {
  if (challenge.format === "group-goal") {
    const reached = challenge.progress >= challenge.target;
    return {
      title: reached ? "Goal Completed" : "Goal Not Reached",
      copy: reached
        ? `${formatChallengeValue(challenge.progress, challenge.metric)} completed together.`
        : `${formatChallengeValue(challenge.progress, challenge.metric)} / ${formatChallengeValue(challenge.target, challenge.metric)} completed.`
    };
  }

  const winner = getChallengeLeader(challenge);
  return {
    title: "Winner",
    copy: `${winner.name} won with ${formatChallengeValue(winner.progress, challenge.metric)}.`
  };
}

function getChallengeProgressPercent(challenge) {
  if (challenge.format === "group-goal") {
    return challenge.target === 0 ? 0 : Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
  }

  const leader = getChallengeLeader(challenge);
  return challenge.target === 0 ? 0 : Math.min(100, Math.round((leader.progress / challenge.target) * 100));
}

function getEntryPercent(entry, challenge) {
  return challenge.target === 0 ? 0 : Math.min(100, Math.round((entry.progress / challenge.target) * 100));
}

function getGroupMetricProgress(members, metric) {
  return members.reduce(function (total, member) {
    return total + getMemberMetricProgress(member, metric);
  }, 0);
}

function getMemberMetricProgress(member, metric) {
  if (metric === "study-time") return Number((member.totalSeconds || 0) / 3600).toFixed(1) * 1;
  if (metric === "tasks") return Number(member.tasksCompleted || 0);
  if (metric === "study-days") return Number(member.streak || 0);
  if (metric === "pomodoros") return Math.floor(Number(member.totalSeconds || 0) / 1500);
  return 0;
}

function formatChallengeValue(value, metric) {
  const safeValue = Number(value || 0);
  if (metric === "study-time") return `${safeValue.toFixed(safeValue % 1 === 0 ? 0 : 1)}h`;
  return `${Math.round(safeValue)}`;
}

function formatChallengeFormat(format) {
  const labels = {
    solo: "Solo",
    duo: "Duo",
    teams: "Teams",
    "group-goal": "Group Goal"
  };
  return labels[format] || "Solo";
}

function formatChallengeMetric(metric) {
  const labels = {
    "study-time": "Study Time",
    pomodoros: "Pomodoros",
    tasks: "Tasks Completed",
    "study-days": "Study Days"
  };
  return labels[metric] || "Study Time";
}

function getChallengeTimeLabel(challenge) {
  const status = getChallengeStatus(challenge);
  if (status === "upcoming") return `Starts ${challenge.startDate}`;
  if (status === "completed") return `Completed ${challenge.endDate}`;
  return `${getDaysRemaining(challenge.endDate)} days remaining`;
}

function getEntryMembers(entry, circle) {
  return entry.memberIds
    .map(function (memberId) {
      const member = circle.members.find(function (candidate) { return candidate.id === memberId; });
      return member ? member.name : "";
    })
    .filter(Boolean)
    .join(" + ");
}

function getDefaultChallengeTitle(format, metric) {
  if (format === "group-goal") return `${formatChallengeMetric(metric)} Group Goal`;
  return `${formatChallengeFormat(format)} ${formatChallengeMetric(metric)} Challenge`;
}

function getGroupSessionCount(circle) {
  return circle.members.reduce(function (total, member) {
    return total + Math.floor(Number(member.totalSeconds || 0) / 1500);
  }, 0);
}

function getChallengeUnit(type) {
  const units = {
    "study-time": "hours",
    pomodoros: "pomodoros",
    tasks: "tasks",
    "study-days": "days",
    streak: "days",
    custom: "points"
  };
  return units[type] || "points";
}

function getDaysRemaining(dateKey) {
  const today = new Date(`${getTodayKey()}T00:00:00`);
  const end = new Date(`${dateKey}T00:00:00`);
  return Math.max(0, Math.ceil((end - today) / 86400000));
}

function getMemberRoomTime(member) {
  if (!member.joinedAt) return "";
  return formatShortTime(Math.floor((Date.now() - new Date(member.joinedAt).getTime()) / 1000));
}

function addGroupActivity(circle, text) {
  circle.activity.unshift({ id: createId(), text, createdAt: new Date().toISOString() });
  circle.activity = circle.activity.slice(0, 12);
}

function formatActivityTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getInitials(text) {
  const words = String(text || "Study Group").trim().split(/\s+/).slice(0, 2);
  return words.map(function (word) { return word[0]; }).join("").toUpperCase() || "SG";
}

function generateInviteCode() {
  return `SM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function appendSimpleItem(parent, text) {
  const itemTag = parent.tagName === "UL" || parent.tagName === "OL" ? "li" : "p";
  const item = document.createElement(itemTag);
  item.className = "empty-message";
  item.textContent = text;
  parent.appendChild(item);
}

function createId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

window.addEventListener("load", function () {
  window.setTimeout(function () {
    appLoader.classList.add("hidden");
  }, 650);
});

navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    showSection(button.dataset.section);
  });
});

homeContinueSession.addEventListener("click", startOrContinueFromHome);
homeOpenSession.addEventListener("click", function () { showSection("focus-hub"); });
homeOpenPlan.addEventListener("click", function () { showSection("task-board"); });
homeSubjectSelect.addEventListener("change", function () {
  appData.selectedSubjectId = homeSubjectSelect.value;
  saveData();
  renderSubjectOptions();
});
sessionStartButton.addEventListener("click", startSession);
sessionPauseButton.addEventListener("click", function () { pauseSession(true); });
sessionFinishButton.addEventListener("click", finishSession);
sessionResetButton.addEventListener("click", resetSession);
sessionSkipButton.addEventListener("click", skipSession);
timerModePrev.addEventListener("click", function () { changeTimerMode(-1); });
timerModeNext.addEventListener("click", function () { changeTimerMode(1); });
customFocusInput.addEventListener("change", saveCustomTimerSettings);
customBreakInput.addEventListener("change", saveCustomTimerSettings);
sessionSubjectSelect.addEventListener("change", changeSessionSubject);
sessionGoalInput.addEventListener("input", function () {
  appData.currentSessionDraft.goal = sessionGoalInput.value.trim();
  saveData();
});
openSubjectModalButton.addEventListener("click", openSubjectModal);
closeSubjectModalButton.addEventListener("click", closeSubjectModal);
subjectModal.addEventListener("click", function (event) {
  if (event.target === subjectModal) closeSubjectModal();
});
subjectForm.addEventListener("submit", addSubject);
openDistractionModalButton.addEventListener("click", openFocusDistractionModal);
closeFocusDistractionButton.addEventListener("click", closeFocusDistractionModal);
focusDistractionModal.addEventListener("click", function (event) {
  if (event.target === focusDistractionModal) closeFocusDistractionModal();
});
focusDistractionForm.addEventListener("submit", addFocusDistraction);
goalResultOptions.querySelectorAll("button").forEach(function (button) {
  button.addEventListener("click", function () { setGoalResult(button.dataset.goalResult); });
});
saveSessionReviewButton.addEventListener("click", function () { saveSessionReview(false); });
startAnotherSessionButton.addEventListener("click", function () { saveSessionReview(true); });
intentionForm.addEventListener("submit", saveIntention);
intentionInput.addEventListener("input", function () {
  intentionCount.textContent = `${intentionInput.value.length}/180`;
});
taskForm.addEventListener("submit", addTask);
goalForm.addEventListener("submit", saveGoal);
goalDecreaseButton.addEventListener("click", function () { changeGoalBy(-0.25); });
goalIncreaseButton.addEventListener("click", function () { changeGoalBy(0.25); });
openTaskModalButton.addEventListener("click", openTaskModal);
closeTaskModalButton.addEventListener("click", closeTaskModal);
taskModal.addEventListener("click", handleTaskModalBackdrop);
plannerPrev.addEventListener("click", function () { changePlannerMonth(-1); });
plannerNext.addEventListener("click", function () { changePlannerMonth(1); });
plannerForm.addEventListener("submit", addPlannerItem);
openExamModalButton.addEventListener("click", function () { openExamModal(); });
closeExamModalButton.addEventListener("click", closeExamModal);
examBackToPresets.addEventListener("click", showExamPresetStep);
examModal.addEventListener("click", handleExamModalBackdrop);
examForm.addEventListener("submit", addExam);
backToExamsButton.addEventListener("click", closeExamWorkspace);
editExamButton.addEventListener("click", editSelectedExam);
deleteExamButton.addEventListener("click", deleteSelectedExam);
examTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    appData.selectedExamTab = tab.dataset.examTab;
    saveData();
    renderExamWorkspace();
  });
});
distractionForm.addEventListener("submit", addDistraction);
saveAccentButton.addEventListener("click", saveAccentColor);
resetAccentButton.addEventListener("click", resetAccentColor);
createGroupButton.addEventListener("click", function () { openGroupModal("create"); });
joinGroupButton.addEventListener("click", openJoinGroupModal);
backToGroupsButton.addEventListener("click", closeGroupWorkspace);
groupInviteButton.addEventListener("click", openInviteModal);
groupSettingsButton.addEventListener("click", function () { openGroupModal("edit"); });
closeGroupModalButton.addEventListener("click", closeGroupModal);
groupModal.addEventListener("click", function (event) {
  if (event.target === groupModal) closeGroupModal();
});
groupForm.addEventListener("submit", saveGroup);
deleteGroupButton.addEventListener("click", deleteSelectedGroup);
closeJoinGroupModalButton.addEventListener("click", closeJoinGroupModal);
joinGroupModal.addEventListener("click", function (event) {
  if (event.target === joinGroupModal) closeJoinGroupModal();
});
joinGroupForm.addEventListener("submit", joinGroupByCode);
closeInviteModalButton.addEventListener("click", closeInviteModal);
inviteModal.addEventListener("click", function (event) {
  if (event.target === inviteModal) closeInviteModal();
});
copyInviteButton.addEventListener("click", copyInviteCode);
createRoomButton.addEventListener("click", openRoomModal);
closeRoomModalButton.addEventListener("click", closeRoomModal);
roomModal.addEventListener("click", function (event) {
  if (event.target === roomModal) closeRoomModal();
});
roomForm.addEventListener("submit", createFocusRoom);
leaveRoomButton.addEventListener("click", function () { leaveFocusRoom(true); });
createChallengeButton.addEventListener("click", openChallengeModal);
closeChallengeModalButton.addEventListener("click", closeChallengeModal);
challengeModal.addEventListener("click", function (event) {
  if (event.target === challengeModal) closeChallengeModal();
});
challengeForm.addEventListener("submit", createChallenge);
challengePrevButton.addEventListener("click", function () { goToChallengeStep(-1); });
challengeNextButton.addEventListener("click", function () { goToChallengeStep(1); });
backToChallengesButton.addEventListener("click", function () {
  appData.selectedChallengeId = null;
  saveData();
  renderStudyCircles();
});
challengeStatusFilters.querySelectorAll("button").forEach(function (button) {
  button.addEventListener("click", function () {
    appData.selectedChallengeStatus = button.dataset.challengeStatus;
    appData.selectedChallengeId = null;
    saveData();
    renderStudyCircles();
  });
});
challengeFormatOptions.querySelectorAll("button").forEach(function (button) {
  button.addEventListener("click", function () {
    challengeDraft.format = button.dataset.challengeFormat;
    if (challengeDraft.format === "group-goal") challengeDraft.participantMode = "all";
    renderChallengeModalStep();
  });
});
challengeMetricOptions.querySelectorAll("button").forEach(function (button) {
  button.addEventListener("click", function () {
    challengeDraft.metric = button.dataset.challengeMetric;
    renderChallengeModalStep();
  });
});
challengeDurationOptions.querySelectorAll("button").forEach(function (button) {
  button.addEventListener("click", function () {
    challengeDraft.durationDays = button.dataset.durationDays;
    if (challengeDraft.durationDays !== "custom") {
      challengeStartInput.value = getTodayKey();
      challengeEndInput.value = addDaysToDate(getTodayKey(), Number(challengeDraft.durationDays));
    }
    renderChallengeModalStep();
  });
});
challengeParticipantOptions.querySelectorAll("button").forEach(function (button) {
  button.addEventListener("click", function () {
    challengeDraft.participantMode = button.dataset.participantMode;
    renderChallengeModalStep();
  });
});
groupTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    appData.selectedCircleTab = tab.dataset.groupTab;
    if (appData.selectedCircleTab !== "challenges") appData.selectedChallengeId = null;
    saveData();
    renderStudyCircles();
  });
});
groupRankingFilters.querySelectorAll("button").forEach(function (button) {
  button.addEventListener("click", function () {
    appData.selectedRankingRange = button.dataset.rankingRange;
    saveData();
    renderStudyCircles();
  });
});
menuToggle.addEventListener("click", toggleSidebar);

historyTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    appData.selectedHistoryRange = tab.dataset.historyRange;
    saveData();
    renderRecentSessions();
  });
});

analyticsTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    appData.selectedAnalyticsRange = tab.dataset.analyticsRange;
    saveData();
    updateInsights();
  });
});

leaderboardTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    appData.selectedLeaderboardRange = tab.dataset.leaderboardRange;
    saveData();
    renderLeaderboard();
  });
});

loadData();
applyAppearance();
applySidebarState();
renderThemes();
renderTasks();
renderDistractions();
renderStudyCircles();
updateAllDisplays();
