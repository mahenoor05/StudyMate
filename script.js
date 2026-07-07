const STORAGE_KEY = "studymate-app-v4";
const OLD_STORAGE_KEYS = ["studymate-app-v3", "studymate-app-v2", "studymate-dashboard"];

const themes = [
  { id: "midnight", name: "Midnight Black", accent: "#7c5cff" },
  { id: "amoled", name: "AMOLED Black", accent: "#00f5a0" },
  { id: "ocean", name: "Ocean Blue", accent: "#38bdf8" },
  { id: "nebula", name: "Purple Nebula", accent: "#a78bfa" },
  { id: "forest", name: "Forest Green", accent: "#34d399" },
  { id: "sakura", name: "Sakura Pink", accent: "#f9a8d4" },
  { id: "coffee", name: "Warm Coffee", accent: "#f59e0b" },
  { id: "light", name: "Minimal Light", accent: "#2563eb" }
];

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
const sessionDisplay = document.getElementById("session-display");
const sessionProgressBar = document.getElementById("session-progress-bar");
const timerModePrev = document.getElementById("timer-mode-prev");
const timerModeNext = document.getElementById("timer-mode-next");
const timerModeTitle = document.getElementById("timer-mode-title");
const timerModeDescription = document.getElementById("timer-mode-description");
const timerModeIndicators = document.getElementById("timer-mode-indicators");
const customTimerSettings = document.getElementById("custom-timer-settings");
const customFocusInput = document.getElementById("custom-focus-input");
const customBreakInput = document.getElementById("custom-break-input");
const sessionSubjectSelect = document.getElementById("session-subject-select");
const sessionStartButton = document.getElementById("session-start");
const sessionPauseButton = document.getElementById("session-pause");
const sessionResetButton = document.getElementById("session-reset");
const sessionSkipButton = document.getElementById("session-skip");
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

const insightTotalTime = document.getElementById("insight-total-time");
const insightTasks = document.getElementById("insight-tasks");
const insightStreak = document.getElementById("insight-streak");
const subjectInsights = document.getElementById("subject-insights");
const analyticsTabs = document.querySelectorAll(".analytics-tab");
const analyticsTotalLabel = document.getElementById("analytics-total-label");
const analyticsChartTitle = document.getElementById("analytics-chart-title");
const analyticsChart = document.getElementById("analytics-chart");
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

const newCircleButton = document.getElementById("new-circle-button");
const circleList = document.getElementById("circle-list");
const circleIconDisplay = document.getElementById("circle-icon-display");
const circleNameDisplay = document.getElementById("circle-name-display");
const circleDescriptionDisplay = document.getElementById("circle-description-display");
const circleInviteDisplay = document.getElementById("circle-invite-display");
const circleMemberCount = document.getElementById("circle-member-count");
const circleInviteCode = document.getElementById("circle-invite-code");
const circleRoomCount = document.getElementById("circle-room-count");
const circleForm = document.getElementById("circle-form");
const circleNameInput = document.getElementById("circle-name-input");
const circleIconInput = document.getElementById("circle-icon-input");
const circleDescriptionInput = document.getElementById("circle-description-input");
const circleFormMode = document.getElementById("circle-form-mode");
const circleMemberList = document.getElementById("circle-member-list");
const circleLeaderboard = document.getElementById("circle-leaderboard");
const roomForm = document.getElementById("room-form");
const roomNameInput = document.getElementById("room-name-input");
const roomIconInput = document.getElementById("room-icon-input");
const roomDescriptionInput = document.getElementById("room-description-input");
const roomSubjectInput = document.getElementById("room-subject-input");
const roomMaxInput = document.getElementById("room-max-input");
const roomPrivacyInput = document.getElementById("room-privacy-input");
const focusRoomList = document.getElementById("focus-room-list");
const activeRoomName = document.getElementById("active-room-name");
const activeRoomDescription = document.getElementById("active-room-description");
const activeRoomSubject = document.getElementById("active-room-subject");
const activeRoomTimer = document.getElementById("active-room-timer");
const activeRoomStatus = document.getElementById("active-room-status");
const activeRoomMembers = document.getElementById("active-room-members");
const roomStatusControls = document.getElementById("room-status-controls");
const leaveRoomButton = document.getElementById("leave-room-button");

let sessionTimerId = null;
let roomTimerId = null;
let appData = createDefaultData();
let selectedExamPreset = null;

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
    plannerItems: [],
    exams: [],
    distractions: [],
    studyCircles: [createDefaultStudyCircle()],
    selectedCircleId: null,
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
      { id: "you", name: "You", status: "Studying", totalSeconds: 0 },
      { id: "maya", name: "Maya", status: "Short Break", totalSeconds: 4200 },
      { id: "arif", name: "Arif", status: "Paused", totalSeconds: 3000 }
    ],
    rooms: []
  };
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

  if (appData.activeSession) {
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
  if (!Array.isArray(appData.plannerItems)) appData.plannerItems = [];
  if (!Array.isArray(appData.exams)) appData.exams = [];
  if (!Array.isArray(appData.distractions)) appData.distractions = [];
  if (!Array.isArray(appData.studyCircles) || appData.studyCircles.length === 0) appData.studyCircles = [createDefaultStudyCircle()];

  appData.studySeconds = Number(appData.studySeconds) || 0;
  appData.goalHours = Number(appData.goalHours) || 2;
  appData.streak = Number(appData.streak) || 0;
  appData.focusIntention = appData.focusIntention || "";
  appData.timerModeIndex = Number(appData.timerModeIndex) || 0;
  appData.timerModeIndex = appData.timerModeIndex % timerModes.length;
  appData.customFocusMinutes = Number(appData.customFocusMinutes) || 30;
  appData.customBreakMinutes = Number(appData.customBreakMinutes) || 0;
  appData.selectedHistoryRange = appData.selectedHistoryRange || "today";
  appData.selectedAnalyticsRange = appData.selectedAnalyticsRange || "today";
  appData.selectedLeaderboardRange = appData.selectedLeaderboardRange || "today";
  appData.selectedExamId = appData.selectedExamId || null;
  appData.selectedExamTab = appData.selectedExamTab || "overview";
  appData.plannerMonth = Number.isInteger(appData.plannerMonth) ? appData.plannerMonth : new Date().getMonth();
  appData.plannerYear = Number(appData.plannerYear) || new Date().getFullYear();
  appData.selectedPlannerDate = appData.selectedPlannerDate || getTodayKey();
  appData.selectedSubjectId = getSubjectById(appData.selectedSubjectId) ? appData.selectedSubjectId : appData.subjects[0].id;
  appData.tasks = appData.tasks.map(normalizeTask);
  appData.plannerItems = appData.plannerItems.map(normalizePlannerItem);
  appData.exams = appData.exams.map(normalizeExam);
  if (appData.selectedExamId && !getExamById(appData.selectedExamId)) appData.selectedExamId = null;
  appData.studyCircles = appData.studyCircles.map(normalizeCircle);

  if (!getCircleById(appData.selectedCircleId)) {
    appData.selectedCircleId = appData.studyCircles[0].id;
  }

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
  return {
    id: circle.id || createId(),
    name: circle.name || "Untitled Circle",
    icon: (circle.icon || "SC").slice(0, 3).toUpperCase(),
    description: circle.description || "A shared StudyMate circle.",
    inviteCode: circle.inviteCode || generateInviteCode(),
    members: normalizeMembers(circle.members),
    rooms: normalizeRooms(circle.rooms)
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
      totalSeconds: Number(member.totalSeconds || 0)
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
      members: Array.isArray(room.members) ? room.members : []
    };
  });
}

function resetDailyData() {
  appData.date = getTodayKey();
  appData.studySeconds = 0;
  appData.distractions = [];
  appData.subjects = appData.subjects.map(function (subject) {
    return { ...subject, seconds: 0 };
  });
}

function saveData() {
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

  dashboardGreeting.textContent = `${greeting}, Mahenoor`;
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

  timerModeTitle.textContent = mode.name;
  timerModeDescription.textContent = mode.description;
  customTimerSettings.classList.toggle("active", mode.id === "custom");
  customFocusInput.value = appData.customFocusMinutes;
  customBreakInput.value = appData.customBreakMinutes;
  sessionDisplay.textContent = isCountdown ? formatLongTime(remaining) : formatLongTime(elapsed);
  sessionStatus.textContent = appData.activeSession
    ? appData.activeSession.phase === "break" ? "Break" : "Studying"
    : "Not started";
  sessionProgressBar.style.width = `${progressPercent}%`;
  sessionTotalToday.textContent = formatShortTime(appData.studySeconds);
  intentionInput.value = appData.focusIntention;
  intentionCount.textContent = `${appData.focusIntention.length}/180`;
  renderTimerModeIndicators();
  renderSubjectBreakdown(sessionSubjectBreakdown);
}

function renderTimerModeIndicators() {
  timerModeIndicators.innerHTML = "";
  timerModes.forEach(function (mode, index) {
    const dot = document.createElement("span");
    dot.className = "mode-dot";
    dot.classList.toggle("active", index === appData.timerModeIndex);
    dot.textContent = mode.name;
    timerModeIndicators.appendChild(dot);
  });
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
  const sessions = getSessionsForRange(range);
  const tasks = getTasksForRange(range);
  const totalSeconds = range === "today" ? appData.studySeconds : getSecondsFromSessions(sessions);

  analyticsTabs.forEach(function (tab) {
    const isActive = tab.dataset.analyticsRange === range;
    tab.classList.toggle("active", isActive);
    tab.classList.toggle("secondary-button", !isActive);
  });

  analyticsTotalLabel.textContent = `${getRangeLabel(range)} Total`;
  insightTotalTime.textContent = formatShortTime(totalSeconds);
  insightTasks.textContent = tasks.filter(function (task) { return task.completed; }).length;
  insightStreak.textContent = `${appData.streak} days`;
  renderAnalyticsSubjectBreakdown(sessions, range);
  renderAnalyticsChart(range);
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
    appendSimpleItem(container, "No subject time yet.");
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

function renderAnalyticsSubjectBreakdown(sessions, range) {
  subjectInsights.innerHTML = "";

  if (range === "today") {
    renderSubjectBreakdown(subjectInsights);
    return;
  }

  const totalsBySubject = {};
  sessions.forEach(function (session) {
    const subjectName = session.subjectName || getSubjectName(session.subjectId);
    totalsBySubject[subjectName] = (totalsBySubject[subjectName] || 0) + Number(session.durationSeconds || 0);
  });

  const rows = Object.keys(totalsBySubject).map(function (subjectName) {
    return { name: subjectName, seconds: totalsBySubject[subjectName] };
  });

  if (rows.length === 0) {
    appendSimpleItem(subjectInsights, "No subject time for this range yet.");
    return;
  }

  rows
    .sort(function (first, second) { return second.seconds - first.seconds; })
    .forEach(function (rowData) {
      const row = document.createElement("div");
      row.className = "insight-row";
      const name = document.createElement("span");
      const time = document.createElement("strong");
      name.textContent = rowData.name;
      time.textContent = formatShortTime(rowData.seconds);
      row.appendChild(name);
      row.appendChild(time);
      subjectInsights.appendChild(row);
    });
}

function renderAnalyticsChart(range) {
  analyticsChart.innerHTML = "";
  const days = range === "month" ? 30 : 7;
  const labels = [];
  const totals = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const dateKey = getDateKeyFromDate(date);
    const dayTotal = appData.sessions
      .filter(function (session) { return session.date === dateKey; })
      .reduce(function (total, session) { return total + Number(session.durationSeconds || 0); }, 0);

    labels.push(date.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    totals.push(dateKey === getTodayKey() ? Math.max(dayTotal, appData.studySeconds) : dayTotal);
  }

  const maxSeconds = Math.max(...totals, 1);
  analyticsChartTitle.textContent = `${getRangeLabel(range)} Study Chart`;

  totals.forEach(function (seconds, index) {
    const column = document.createElement("div");
    column.className = "bar-column";

    const fill = document.createElement("span");
    fill.className = "bar-fill";
    fill.style.height = `${Math.max((seconds / maxSeconds) * 100, seconds > 0 ? 8 : 2)}%`;
    fill.title = `${labels[index]}: ${formatShortTime(seconds)}`;

    const label = document.createElement("small");
    label.className = "bar-label";
    label.textContent = range === "month" ? String(index + 1) : labels[index].split(" ")[1];

    column.appendChild(fill);
    column.appendChild(label);
    analyticsChart.appendChild(column);
  });
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
    item.className = "session-history-item";
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    title.textContent = session.subjectName || getSubjectName(session.subjectId);
    detail.textContent = `${session.mode} - ${formatClockTime(session.startedAt)} to ${formatClockTime(session.endedAt)} - ${formatShortTime(session.durationSeconds)}`;
    item.appendChild(title);
    item.appendChild(detail);
    recentSessionList.appendChild(item);
  });
}

function startSession() {
  if (appData.activeSession) return;

  appData.customFocusMinutes = Math.max(1, Number(customFocusInput.value) || appData.customFocusMinutes);
  appData.customBreakMinutes = Math.max(0, Number(customBreakInput.value) || 0);
  appData.selectedSubjectId = sessionSubjectSelect.value || appData.selectedSubjectId;
  const mode = getSelectedTimerMode();
  appData.activeSession = {
    id: createId(),
    mode: mode.name,
    modeId: mode.id,
    phase: "focus",
    subjectId: appData.selectedSubjectId,
    startedAt: new Date().toISOString(),
    elapsedSeconds: 0,
    focusSeconds: getTimerFocusSeconds(),
    breakSeconds: getTimerBreakSeconds()
  };

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

  const durationSeconds = getSessionElapsedSeconds();
  const subject = getSubjectById(appData.activeSession.subjectId) || getSelectedSubject();

  if (appData.activeSession.phase === "focus") {
    appData.studySeconds += durationSeconds;
    subject.seconds += durationSeconds;
  }

  if (shouldRecordSession && durationSeconds > 0 && appData.activeSession.phase === "focus") {
    appData.sessions.unshift({
      id: appData.activeSession.id,
      date: getTodayKey(),
      subjectId: subject.id,
      subjectName: subject.name,
      mode: appData.activeSession.mode,
      startedAt: appData.activeSession.startedAt,
      endedAt: new Date().toISOString(),
      durationSeconds
    });
  }

  appData.activeSession = null;
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  saveData();
  updateAllDisplays();
}

function completeFocusPhase() {
  const activeSession = appData.activeSession;
  if (!activeSession) return;

  pauseSession(true);

  if (activeSession.breakSeconds > 0) {
    appData.activeSession = {
      id: createId(),
      mode: activeSession.mode,
      modeId: activeSession.modeId,
      phase: "break",
      subjectId: activeSession.subjectId,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      focusSeconds: activeSession.breakSeconds,
      breakSeconds: 0
    };
    saveData();
    resumeSessionTimer();
  }

  updateAllDisplays();
}

function completeBreakPhase() {
  if (!appData.activeSession) return;
  appData.activeSession = null;
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
  pauseSession(false);
  sessionDisplay.textContent = "0h 00m 00s";
  sessionStatus.textContent = "Not started";
  sessionProgressBar.style.width = "0%";
}

function changeSessionSubject() {
  appData.selectedSubjectId = sessionSubjectSelect.value;

  if (appData.activeSession) {
    appData.activeSession.subjectId = appData.selectedSubjectId;
  }

  saveData();
  updateAllDisplays();
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

  appData.distractions.unshift({
    id: createId(),
    category: distractionCategory.value,
    reason,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
  const accent = appData.accentColor || getCurrentTheme().accent;
  document.body.dataset.theme = appData.theme;
  document.documentElement.style.setProperty("--primary", accent);
  document.documentElement.style.setProperty("--primary-dark", accent);
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

function renderStudyCircles() {
  const selectedCircle = getSelectedCircle();
  renderCircleList(selectedCircle);
  renderCircleDetails(selectedCircle);
  renderFocusRooms(selectedCircle);
  renderActiveRoom();
}

function renderCircleList(selectedCircle) {
  circleList.innerHTML = "";
  appData.studyCircles.forEach(function (circle) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "circle-list-item";
    button.classList.toggle("active", selectedCircle && circle.id === selectedCircle.id);

    const icon = document.createElement("span");
    const content = document.createElement("div");
    const name = document.createElement("strong");
    const members = document.createElement("small");
    icon.textContent = circle.icon;
    name.textContent = circle.name;
    members.textContent = `${circle.members.length} members`;
    content.appendChild(name);
    content.appendChild(members);
    button.appendChild(icon);
    button.appendChild(content);

    button.addEventListener("click", function () {
      appData.selectedCircleId = circle.id;
      fillCircleForm(circle);
      saveData();
      renderStudyCircles();
    });
    circleList.appendChild(button);
  });
}

function renderCircleDetails(circle) {
  if (!circle) return;

  circleIconDisplay.textContent = circle.icon;
  circleNameDisplay.textContent = circle.name;
  circleDescriptionDisplay.textContent = circle.description;
  circleInviteDisplay.textContent = circle.inviteCode;
  circleInviteCode.textContent = circle.inviteCode;
  circleMemberCount.textContent = circle.members.length;
  circleRoomCount.textContent = circle.rooms.length;
  circleFormMode.textContent = "Editing selected circle";

  if (![circleNameInput, circleIconInput, circleDescriptionInput].includes(document.activeElement)) {
    fillCircleForm(circle);
  }

  renderCircleMembers(circle);
  renderCircleLeaderboard(circle);
}

function fillCircleForm(circle) {
  circleNameInput.value = circle ? circle.name : "";
  circleIconInput.value = circle ? circle.icon : "";
  circleDescriptionInput.value = circle ? circle.description : "";
  circleFormMode.textContent = circle ? "Editing selected circle" : "Create a new circle";
}

function renderCircleMembers(circle) {
  circleMemberList.innerHTML = "";
  circle.members.forEach(function (member) {
    appendMemberRow(circleMemberList, member.name, member.status);
  });
}

function renderCircleLeaderboard(circle) {
  circleLeaderboard.innerHTML = "";
  circle.members
    .slice()
    .sort(function (first, second) { return second.totalSeconds - first.totalSeconds; })
    .forEach(function (member, index) {
      appendMemberRow(circleLeaderboard, `#${index + 1} ${member.name}`, formatShortTime(member.totalSeconds));
    });
}

function saveCircle(event) {
  event.preventDefault();
  const selectedCircle = getSelectedCircle();
  const circleName = circleNameInput.value.trim();
  const circleIcon = circleIconInput.value.trim().slice(0, 3).toUpperCase() || "SC";
  const circleDescription = circleDescriptionInput.value.trim() || "A shared StudyMate circle.";
  if (!circleName) return;

  if (selectedCircle && circleFormMode.textContent.includes("Editing")) {
    selectedCircle.name = circleName;
    selectedCircle.icon = circleIcon;
    selectedCircle.description = circleDescription;
  } else {
    const newCircle = {
      id: createId(),
      name: circleName,
      icon: circleIcon,
      description: circleDescription,
      inviteCode: generateInviteCode(),
      members: [{ id: "you", name: "You", status: "Paused", totalSeconds: appData.studySeconds }],
      rooms: []
    };
    appData.studyCircles.push(newCircle);
    appData.selectedCircleId = newCircle.id;
  }

  saveData();
  renderStudyCircles();
}

function prepareNewCircle() {
  circleNameInput.value = "";
  circleIconInput.value = "";
  circleDescriptionInput.value = "";
  circleFormMode.textContent = "Create a new circle";
  circleNameInput.focus();
}

function createFocusRoom(event) {
  event.preventDefault();
  const circle = getSelectedCircle();
  if (!circle) return;

  circle.rooms.unshift({
    id: createId(),
    name: roomNameInput.value.trim(),
    icon: roomIconInput.value.trim().slice(0, 3).toUpperCase() || "FR",
    description: roomDescriptionInput.value.trim() || "A temporary focus session.",
    subject: roomSubjectInput.value.trim(),
    maxMembers: Math.max(2, Number(roomMaxInput.value) || 8),
    privacy: roomPrivacyInput.value,
    status: "Paused",
    elapsedSeconds: 0,
    statusStartedAt: null,
    members: []
  });

  roomForm.reset();
  roomMaxInput.value = 8;
  saveData();
  renderStudyCircles();
}

function renderFocusRooms(circle) {
  focusRoomList.innerHTML = "";
  if (!circle || circle.rooms.length === 0) {
    appendSimpleItem(focusRoomList, "No Focus Rooms yet. Create one for a local prototype session.");
    return;
  }

  circle.rooms.forEach(function (room) {
    const card = document.createElement("article");
    card.className = "room-card";

    const title = document.createElement("h3");
    const desc = document.createElement("p");
    const stats = document.createElement("p");
    const action = document.createElement("button");

    title.textContent = `${room.icon} ${room.name}`;
    desc.className = "muted-text";
    desc.textContent = room.description;
    stats.textContent = `${room.subject} • ${room.members.length}/${room.maxMembers} members • ${room.status}`;

    action.type = "button";
    action.textContent = appData.activeRoomId === room.id ? "Joined" : "Join Focus Room";
    action.className = appData.activeRoomId === room.id ? "secondary-button" : "";
    action.disabled = appData.activeRoomId !== room.id && room.members.length >= room.maxMembers;
    action.addEventListener("click", function () { joinFocusRoom(room.id); });

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(stats);
    card.appendChild(action);
    focusRoomList.appendChild(card);
  });
}

function joinFocusRoom(roomId) {
  const room = getRoomById(roomId);
  if (!room) return;

  leaveFocusRoom(false);
  if (!room.members.some(function (member) { return member.id === "you"; })) {
    room.members.push({ id: "you", name: "You", status: room.status });
  }

  appData.activeRoomId = room.id;
  saveData();
  renderStudyCircles();
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

function renderActiveRoom() {
  const room = getRoomById(appData.activeRoomId);

  if (!room) {
    activeRoomName.textContent = "No room joined";
    activeRoomDescription.textContent = "Join a Focus Room to see the local prototype session.";
    activeRoomSubject.textContent = "-";
    activeRoomTimer.textContent = "0h 00m";
    activeRoomStatus.textContent = "Paused";
    activeRoomMembers.innerHTML = "";
    roomStatusControls.innerHTML = "";
    leaveRoomButton.disabled = true;
    appendSimpleItem(activeRoomMembers, "No active room members yet.");
    return;
  }

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
    button.className = room.status === status ? "" : "secondary-button";
    button.textContent = status;
    button.addEventListener("click", function () { updateRoomStatus(room.id, status); });
    roomStatusControls.appendChild(button);
  });
}

function renderActiveRoomMembers(room) {
  activeRoomMembers.innerHTML = "";
  const members = room.members.length > 0 ? room.members : [{ id: "you", name: "You", status: room.status }];
  members.forEach(function (member) {
    appendMemberRow(activeRoomMembers, member.name, member.status);
  });
}

function updateRoomStatus(roomId, status) {
  const room = getRoomById(roomId);
  if (!room) return;

  room.elapsedSeconds = getRoomElapsedSeconds(room);
  room.status = status;
  room.statusStartedAt = status === "Studying" ? new Date().toISOString() : null;
  room.members = room.members.map(function (member) {
    return member.id === "you" ? { ...member, status } : member;
  });

  if (status === "Studying") startRoomTimer();
  if (status !== "Studying") stopRoomTimer();

  saveData();
  renderStudyCircles();
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

function getSelectedCircle() {
  return getCircleById(appData.selectedCircleId) || appData.studyCircles[0];
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
sessionResetButton.addEventListener("click", resetSession);
sessionSkipButton.addEventListener("click", skipSession);
timerModePrev.addEventListener("click", function () { changeTimerMode(-1); });
timerModeNext.addEventListener("click", function () { changeTimerMode(1); });
customFocusInput.addEventListener("change", saveCustomTimerSettings);
customBreakInput.addEventListener("change", saveCustomTimerSettings);
sessionSubjectSelect.addEventListener("change", changeSessionSubject);
subjectForm.addEventListener("submit", addSubject);
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
newCircleButton.addEventListener("click", prepareNewCircle);
circleForm.addEventListener("submit", saveCircle);
roomForm.addEventListener("submit", createFocusRoom);
leaveRoomButton.addEventListener("click", function () { leaveFocusRoom(true); });
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
