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
const homeCompletedTasks = document.getElementById("home-completed-tasks");
const homeStreak = document.getElementById("home-streak");
const homeSubjectList = document.getElementById("home-subject-list");
const homeIntentionTitle = document.getElementById("home-intention-title");
const homeIntentionCopy = document.getElementById("home-intention-copy");
const homeTaskPreview = document.getElementById("home-task-preview");

const sessionStatus = document.getElementById("session-status");
const sessionDisplay = document.getElementById("session-display");
const sessionSubjectSelect = document.getElementById("session-subject-select");
const sessionStartButton = document.getElementById("session-start");
const sessionPauseButton = document.getElementById("session-pause");
const sessionResetButton = document.getElementById("session-reset");
const sessionTotalToday = document.getElementById("session-total-today");
const sessionSubjectBreakdown = document.getElementById("session-subject-breakdown");
const recentSessionList = document.getElementById("recent-session-list");
const subjectForm = document.getElementById("subject-form");
const subjectInput = document.getElementById("subject-input");
const intentionForm = document.getElementById("intention-form");
const intentionInput = document.getElementById("intention-input");
const intentionCount = document.getElementById("intention-count");

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const pendingTaskList = document.getElementById("pending-task-list");
const completedTaskList = document.getElementById("completed-task-list");

const goalForm = document.getElementById("goal-form");
const goalInput = document.getElementById("goal-input");
const goalSummary = document.getElementById("goal-summary");
const goalBar = document.getElementById("goal-bar");
const goalTarget = document.getElementById("goal-target");

const insightTotalTime = document.getElementById("insight-total-time");
const insightTasks = document.getElementById("insight-tasks");
const insightStreak = document.getElementById("insight-streak");
const subjectInsights = document.getElementById("subject-insights");
const leaderboardTable = document.getElementById("leaderboard-table");

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
    activeSession: null,
    tasks: [],
    subjects: [generalSubject],
    sessions: [],
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
  if (!Array.isArray(appData.distractions)) appData.distractions = [];
  if (!Array.isArray(appData.studyCircles) || appData.studyCircles.length === 0) appData.studyCircles = [createDefaultStudyCircle()];

  appData.studySeconds = Number(appData.studySeconds) || 0;
  appData.goalHours = Number(appData.goalHours) || 2;
  appData.streak = Number(appData.streak) || 0;
  appData.focusIntention = appData.focusIntention || "";
  appData.selectedSubjectId = getSubjectById(appData.selectedSubjectId) ? appData.selectedSubjectId : appData.subjects[0].id;
  appData.studyCircles = appData.studyCircles.map(normalizeCircle);

  if (!getCircleById(appData.selectedCircleId)) {
    appData.selectedCircleId = appData.studyCircles[0].id;
  }

  if (appData.activeRoomId && !getRoomById(appData.activeRoomId)) {
    appData.activeRoomId = null;
  }
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
  const value = Number(hours.toFixed(2));
  return `${value} ${value === 1 ? "Hour" : "Hours"}`;
}

function formatClockTime(dateString) {
  if (!dateString) return "Not started";
  return new Date(dateString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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
  renderRecentSessions();
  renderLeaderboard();
}

function updateHome() {
  const pendingTasks = appData.tasks.filter(function (task) { return !task.completed; });
  const selectedSubject = getSelectedSubject();
  const goalPercent = getGoalPercent();
  const greeting = getGreeting();

  dashboardGreeting.textContent = greeting;
  todayDate.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  homeTotalTime.textContent = formatShortTime(appData.studySeconds);
  homeCompletedTasks.textContent = getCompletedTaskCount();
  homeStreak.textContent = `${appData.streak} days`;
  homeGoalPercent.textContent = `${goalPercent}%`;
  homeGoalHours.textContent = `${formatShortTime(appData.studySeconds)} / ${formatGoalHours(appData.goalHours)}`;
  homeGoalBar.style.width = `${goalPercent}%`;
  homeGoalCopy.textContent = goalPercent >= 100 ? "Daily goal completed." : "Keep going, you are building momentum.";

  if (appData.activeSession) {
    homeActiveSubject.textContent = selectedSubject.name;
    homeActiveStatus.textContent = "Live";
    homeSessionStart.textContent = formatClockTime(appData.activeSession.startedAt);
    homeSessionElapsed.textContent = formatLongTime(getSessionElapsedSeconds());
  } else {
    homeActiveSubject.textContent = "No session running";
    homeActiveStatus.textContent = "Idle";
    homeSessionStart.textContent = "Not started";
    homeSessionElapsed.textContent = "0h 00m 00s";
  }

  homeIntentionTitle.textContent = appData.focusIntention || "Set one clear target for today.";
  homeIntentionCopy.textContent = appData.focusIntention ? "Your study intention is saved for today." : "Use the Study Sessions page to write what matters most before you begin.";

  homeTaskPreview.innerHTML = "";
  if (pendingTasks.length === 0) {
    appendSimpleItem(homeTaskPreview, "No pending tasks.");
  } else {
    pendingTasks.slice(0, 4).forEach(function (task) {
      appendSimpleItem(homeTaskPreview, task.text);
    });
  }

  renderSubjectBreakdown(homeSubjectList);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function updateSessionPage() {
  sessionDisplay.textContent = formatLongTime(getSessionElapsedSeconds());
  sessionStatus.textContent = appData.activeSession ? "Studying" : "Not started";
  sessionTotalToday.textContent = formatShortTime(appData.studySeconds);
  intentionInput.value = appData.focusIntention;
  intentionCount.textContent = `${appData.focusIntention.length}/180`;
  renderSubjectBreakdown(sessionSubjectBreakdown);
}

function updateGoal() {
  const goalPercent = getGoalPercent();
  goalInput.value = appData.goalHours;
  goalTarget.textContent = formatGoalHours(appData.goalHours);
  goalSummary.textContent = `${goalPercent}% complete`;
  goalBar.style.width = `${goalPercent}%`;
}

function updateInsights() {
  insightTotalTime.textContent = formatShortTime(appData.studySeconds);
  insightTasks.textContent = getCompletedTaskCount();
  insightStreak.textContent = `${appData.streak} days`;
  renderSubjectBreakdown(subjectInsights);
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

function renderRecentSessions() {
  recentSessionList.innerHTML = "";

  if (appData.sessions.length === 0) {
    appendSimpleItem(recentSessionList, "No saved sessions yet.");
    return;
  }

  appData.sessions.slice(0, 5).forEach(function (session) {
    const item = document.createElement("article");
    item.className = "session-history-item";
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    title.textContent = session.subjectName;
    detail.textContent = `${session.mode} • ${formatClockTime(session.startedAt)} to ${formatClockTime(session.endedAt)} • ${formatShortTime(session.durationSeconds)}`;
    item.appendChild(title);
    item.appendChild(detail);
    recentSessionList.appendChild(item);
  });
}

function startSession() {
  if (appData.activeSession) return;

  appData.selectedSubjectId = sessionSubjectSelect.value || appData.selectedSubjectId;
  appData.activeSession = {
    id: createId(),
    mode: "Stopwatch",
    subjectId: appData.selectedSubjectId,
    startedAt: new Date().toISOString(),
    elapsedSeconds: 0
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
}

function pauseSession(shouldRecordSession = true) {
  if (!appData.activeSession) return;

  const durationSeconds = getSessionElapsedSeconds();
  const subject = getSubjectById(appData.activeSession.subjectId) || getSelectedSubject();

  appData.studySeconds += durationSeconds;
  subject.seconds += durationSeconds;

  if (shouldRecordSession && durationSeconds > 0) {
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

function resetSession() {
  pauseSession(false);
  sessionDisplay.textContent = "0h 00m 00s";
  sessionStatus.textContent = "Not started";
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

function createTask(text) {
  return {
    id: createId(),
    text,
    completed: false
  };
}

function addTask(event) {
  event.preventDefault();
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  appData.tasks.push(createTask(taskText));
  taskInput.value = "";
  saveData();
  renderTasks();
  updateAllDisplays();
}

function toggleTask(taskId) {
  appData.tasks = appData.tasks.map(function (task) {
    return task.id === taskId ? { ...task, completed: !task.completed } : task;
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
  pendingTaskList.innerHTML = "";
  completedTaskList.innerHTML = "";
  renderTaskGroup(pendingTaskList, appData.tasks.filter(function (task) { return !task.completed; }));
  renderTaskGroup(completedTaskList, appData.tasks.filter(function (task) { return task.completed; }));
}

function renderTaskGroup(listElement, tasks) {
  if (tasks.length === 0) {
    appendSimpleItem(listElement, "Nothing here yet.");
    return;
  }

  tasks.forEach(function (task) {
    const listItem = document.createElement("li");
    if (task.completed) listItem.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", function () { toggleTask(task.id); });

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () { deleteTask(task.id); });

    listItem.appendChild(checkbox);
    listItem.appendChild(taskText);
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
  const users = [
    { rank: 1, name: "You", time: formatShortTime(appData.studySeconds), streak: `${appData.streak} days`, tasks: getCompletedTaskCount(), source: "Your local data" },
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

homeContinueSession.addEventListener("click", function () { showSection("focus-hub"); });
homeOpenSession.addEventListener("click", function () { showSection("focus-hub"); });
sessionStartButton.addEventListener("click", startSession);
sessionPauseButton.addEventListener("click", function () { pauseSession(true); });
sessionResetButton.addEventListener("click", resetSession);
sessionSubjectSelect.addEventListener("change", changeSessionSubject);
subjectForm.addEventListener("submit", addSubject);
intentionForm.addEventListener("submit", saveIntention);
intentionInput.addEventListener("input", function () {
  intentionCount.textContent = `${intentionInput.value.length}/180`;
});
taskForm.addEventListener("submit", addTask);
goalForm.addEventListener("submit", saveGoal);
distractionForm.addEventListener("submit", addDistraction);
saveAccentButton.addEventListener("click", saveAccentColor);
resetAccentButton.addEventListener("click", resetAccentColor);
newCircleButton.addEventListener("click", prepareNewCircle);
circleForm.addEventListener("submit", saveCircle);
roomForm.addEventListener("submit", createFocusRoom);
leaveRoomButton.addEventListener("click", function () { leaveFocusRoom(true); });
menuToggle.addEventListener("click", toggleSidebar);

loadData();
applyAppearance();
applySidebarState();
renderThemes();
renderTasks();
renderDistractions();
renderStudyCircles();
updateAllDisplays();
