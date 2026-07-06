const STORAGE_KEY = "studymate-app-v4";
const OLD_STORAGE_KEYS = ["studymate-app-v3", "studymate-app-v2", "studymate-dashboard"];

const themes = [
  { id: "midnight", name: "Midnight Black" },
  { id: "amoled", name: "AMOLED Black" },
  { id: "ocean", name: "Ocean Blue" },
  { id: "nebula", name: "Purple Nebula" },
  { id: "forest", name: "Forest Green" },
  { id: "sakura", name: "Sakura Pink" },
  { id: "coffee", name: "Warm Coffee" },
  { id: "light", name: "Minimal Light" }
];

const menuToggle = document.getElementById("menu-toggle");
const navButtons = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");

const todayDate = document.getElementById("today-date");
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
let appData = createDefaultData();

function createDefaultData() {
  const generalSubject = createSubject("General Study");

  return {
    date: getTodayKey(),
    theme: "midnight",
    accentColor: "#7c5cff",
    sidebarCollapsed: false,
    studySeconds: 0,
    goalHours: 2,
    streak: 0,
    focusIntention: "",
    studyCircles: [createDefaultStudyCircle()],
    selectedCircleId: null,
    activeRoomId: null,
    selectedSubjectId: generalSubject.id,
    activeSession: null,
    tasks: [],
    subjects: [generalSubject],
    sessions: [],
    distractions: []
  };
}

function createSubject(name) {
  return {
    id: createId(),
    name: name,
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
      { id: "you", name: "You", status: "Studying", totalSeconds: 5400 },
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
    const parsedOldData = JSON.parse(oldData);
    const oldSubjects = Array.isArray(parsedOldData.subjects) ? parsedOldData.subjects : [];
    const migratedSubjects = oldSubjects.map(function (subject) {
      return {
        id: subject.id || createId(),
        name: subject.name || "Untitled Subject",
        seconds: Number(subject.seconds) || 0
      };
    });
    const subjectTotal = migratedSubjects.reduce(function (total, subject) {
      return total + subject.seconds;
    }, 0);
    const oldTimerTotal = (Number(parsedOldData.overallSeconds) || 0) + (Number(parsedOldData.pomodoroFocusSeconds) || 0);

    if (migratedSubjects.length === 0) {
      migratedSubjects.push(createSubject("General Study"));
    }

    return {
      ...createDefaultData(),
      date: parsedOldData.date || getTodayKey(),
      theme: parsedOldData.theme || (parsedOldData.darkMode === false ? "light" : "midnight"),
      accentColor: parsedOldData.accentColor || "#7c5cff",
      sidebarCollapsed: Boolean(parsedOldData.sidebarCollapsed),
      studySeconds: Number(parsedOldData.studySeconds) || subjectTotal + oldTimerTotal,
      goalHours: Number(parsedOldData.goalHours) || (parsedOldData.goalMinutes ? Number(parsedOldData.goalMinutes) / 60 : 2),
      streak: Number(parsedOldData.streak) || 0,
      focusIntention: parsedOldData.focusIntention || "",
      studyCircles: Array.isArray(parsedOldData.studyCircles) ? parsedOldData.studyCircles : [createDefaultStudyCircle()],
      selectedCircleId: parsedOldData.selectedCircleId || null,
      activeRoomId: parsedOldData.activeRoomId || null,
      selectedSubjectId: parsedOldData.selectedSubjectId || migratedSubjects[0].id,
      activeSession: parsedOldData.activeSession || null,
      tasks: Array.isArray(parsedOldData.tasks) ? parsedOldData.tasks : [],
      subjects: migratedSubjects,
      sessions: Array.isArray(parsedOldData.sessions) ? parsedOldData.sessions : [],
      distractions: Array.isArray(parsedOldData.distractions) ? parsedOldData.distractions : []
    };
  } catch (error) {
    return createDefaultData();
  }
}

function normalizeData() {
  if (!Array.isArray(appData.tasks)) {
    appData.tasks = [];
  }

  if (!Array.isArray(appData.subjects)) {
    appData.subjects = [];
  }

  if (appData.subjects.length === 0) {
    appData.subjects.push(createSubject("General Study"));
  }

  appData.subjects = appData.subjects.map(function (subject) {
    return {
      id: subject.id || createId(),
      name: subject.name || "Untitled Subject",
      seconds: Number(subject.seconds) || 0
    };
  });

  if (!Array.isArray(appData.sessions)) {
    appData.sessions = [];
  }

  if (!Array.isArray(appData.distractions)) {
    appData.distractions = [];
  }

  if (typeof appData.studySeconds !== "number") {
    appData.studySeconds = getSubjectSecondsTotal();
  }

  if (typeof appData.goalHours !== "number" || appData.goalHours <= 0) {
    appData.goalHours = 2;
  }

  if (typeof appData.streak !== "number") {
    appData.streak = 0;
  }

  if (typeof appData.focusIntention !== "string") {
    appData.focusIntention = "";
  }

  normalizeStudyCircles();

  if (!getSubjectById(appData.selectedSubjectId)) {
    appData.selectedSubjectId = appData.subjects[0].id;
  }

  if (appData.activeSession && !getSubjectById(appData.activeSession.subjectId)) {
    appData.activeSession.subjectId = appData.selectedSubjectId;
  }
}

function resetDailyData() {
  pauseSession(false);
  appData.date = getTodayKey();
  appData.studySeconds = 0;
  appData.tasks = [];
  appData.distractions = [];
  appData.sessions = [];
  appData.activeSession = null;
  appData.focusIntention = "";
  appData.studyCircles = appData.studyCircles.map(function (circle) {
    return {
      ...circle,
      rooms: circle.rooms.map(function (room) {
        return {
          ...room,
          status: "Paused",
          statusStartedAt: null,
          elapsedSeconds: 0,
          members: room.members.map(function (member) {
            return { ...member, status: "Paused" };
          })
        };
      })
    };
  });
  appData.subjects = appData.subjects.map(function (subject) {
    return {
      id: subject.id,
      name: subject.name,
      seconds: 0
    };
  });
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function showSection(sectionId) {
  sections.forEach(function (section) {
    section.classList.toggle("active", section.id === sectionId);
  });

  function normalizeStudyCircles() {
  if (!Array.isArray(appData.studyCircles) || appData.studyCircles.length === 0) {
    appData.studyCircles = [createDefaultStudyCircle()];
  }

  appData.studyCircles = appData.studyCircles.map(function (circle) {
    return {
      id: circle.id || createId(),
      name: circle.name || "Untitled Circle",
      icon: (circle.icon || "SC").slice(0, 3).toUpperCase(),
      description: circle.description || "A shared StudyMate circle.",
      inviteCode: circle.inviteCode || generateInviteCode(),
      members: normalizeCircleMembers(circle.members),
      rooms: normalizeFocusRooms(circle.rooms)
    };
  });

  if (!getCircleById(appData.selectedCircleId)) {
    appData.selectedCircleId = appData.studyCircles[0].id;
  }

  if (appData.activeRoomId && !getRoomById(appData.activeRoomId)) {
    appData.activeRoomId = null;
  }
}

function normalizeCircleMembers(members) {
  const normalizedMembers = Array.isArray(members) && members.length > 0 ? members : [{ id: "you", name: "You", status: "Studying", totalSeconds: 0 }];
  const hasYou = normalizedMembers.some(function (member) {
    return member.id === "you";
  });

  if (!hasYou) {
    normalizedMembers.unshift({ id: "you", name: "You", status: "Studying", totalSeconds: 0 });
  }

  return normalizedMembers.map(function (member) {
    return {
      id: member.id || createId(),
      name: member.name || "Student",
      status: member.status || "Paused",
      totalSeconds: Number(member.totalSeconds) || 0
    };
  });
}

function normalizeFocusRooms(rooms) {
  if (!Array.isArray(rooms)) {
    return [];
  }

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
      elapsedSeconds: Number(room.elapsedSeconds) || 0,
      statusStartedAt: room.statusStartedAt || null,
      members: Array.isArray(room.members) ? room.members : []
    };
  });
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

    if (room) {
      return room;
    }
  }

  return null;
}

function generateInviteCode() {
  return `SM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function renderStudyCircles() {
  if (!circleList) {
    return;
  }

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
    button.innerHTML = `<span>${circle.icon}</span><div><strong>${circle.name}</strong><small>${circle.members.length} members</small></div>`;
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
  if (!circle) {
    return;
  }

  circleIconDisplay.textContent = circle.icon;
  circleNameDisplay.textContent = circle.name;
  circleDescriptionDisplay.textContent = circle.description;
  circleInviteDisplay.textContent = circle.inviteCode;
  circleInviteCode.textContent = circle.inviteCode;
  circleMemberCount.textContent = circle.members.length;
  circleRoomCount.textContent = circle.rooms.length;
  circleFormMode.textContent = "Editing selected circle";

  if (document.activeElement !== circleNameInput && document.activeElement !== circleIconInput && document.activeElement !== circleDescriptionInput) {
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
    const row = document.createElement("div");
    row.className = "member-row";
    row.innerHTML = `<span>${member.name}</span><strong>${member.status}</strong>`;
    circleMemberList.appendChild(row);
  });
}

function renderCircleLeaderboard(circle) {
  circleLeaderboard.innerHTML = "";

  circle.members
    .slice()
    .sort(function (first, second) {
      return second.totalSeconds - first.totalSeconds;
    })
    .forEach(function (member, index) {
      const row = document.createElement("div");
      row.className = "member-row";
      row.innerHTML = `<span>#${index + 1} ${member.name}</span><strong>${formatShortTime(member.totalSeconds)}</strong>`;
      circleLeaderboard.appendChild(row);
    });
}

function saveCircle(event) {
  event.preventDefault();

  const selectedCircle = getSelectedCircle();
  const circleName = circleNameInput.value.trim();
  const circleIcon = circleIconInput.value.trim().slice(0, 3).toUpperCase() || "SC";
  const circleDescription = circleDescriptionInput.value.trim() || "A shared StudyMate circle.";

  if (!circleName) {
    return;
  }

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
      members: [{ id: "you", name: "You", status: "Studying", totalSeconds: appData.studySeconds }],
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

  const selectedCircle = getSelectedCircle();

  if (!selectedCircle) {
    return;
  }

  selectedCircle.rooms.unshift({
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
    appendSimpleItem(focusRoomList, "No Focus Rooms yet. Create one for a live study session.");
    return;
  }

  circle.rooms.forEach(function (room) {
    const isJoined = appData.activeRoomId === room.id;
    const roomCard = document.createElement("article");
    roomCard.className = "room-card";
    roomCard.innerHTML = `
      <div class="room-card-topline">
        <span class="circle-icon small-icon">${room.icon}</span>
        <div>
          <h3>${room.name}</h3>
          <p class="muted-text">${room.description}</p>
        </div>
        <span class="status-pill">${room.privacy}</span>
      </div>
      <div class="room-session-grid compact-room-grid">
        <div><span>Subject</span><strong>${room.subject}</strong></div>
        <div><span>Members</span><strong>${room.members.length}/${room.maxMembers}</strong></div>
        <div><span>Status</span><strong>${room.status}</strong></div>
      </div>
    `;

    const action = document.createElement("button");
    action.type = "button";
    action.className = isJoined ? "secondary-button" : "";
    action.textContent = isJoined ? "Joined" : "Join Focus Room";
    action.disabled = !isJoined && room.members.length >= room.maxMembers;
    action.addEventListener("click", function () {
      joinFocusRoom(room.id);
    });

    roomCard.appendChild(action);
    focusRoomList.appendChild(roomCard);
  });
}

function joinFocusRoom(roomId) {
  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

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
    room.members = room.members.filter(function (member) {
      return member.id !== "you";
    });
  }

  appData.activeRoomId = null;
  saveData();

  if (shouldRender) {
    renderStudyCircles();
  }
}

function renderActiveRoom() {
  const room = getRoomById(appData.activeRoomId);

  if (!room) {
    activeRoomName.textContent = "No room joined";
    activeRoomDescription.textContent = "Join a Focus Room to see the live study session.";
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
    button.addEventListener("click", function () {
      updateRoomStatus(room.id, status);
    });
    roomStatusControls.appendChild(button);
  });
}

function renderActiveRoomMembers(room) {
  activeRoomMembers.innerHTML = "";

  const demoMembers = room.members.length > 1 ? room.members : room.members.concat([
    { id: "maya-demo", name: "Maya", status: "Studying" },
    { id: "arif-demo", name: "Arif", status: "Short Break" }
  ]);

  demoMembers.forEach(function (member) {
    const row = document.createElement("div");
    row.className = "member-row";
    row.innerHTML = `<span>${member.name}</span><strong>${member.status}</strong>`;
    activeRoomMembers.appendChild(row);
  });
}

function updateRoomStatus(roomId, status) {
  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

  room.elapsedSeconds = getRoomElapsedSeconds(room);
  room.status = status;
  room.statusStartedAt = status === "Studying" ? new Date().toISOString() : null;
  room.members = room.members.map(function (member) {
    return member.id === "you" ? { ...member, status: status } : member;
  });

  saveData();
  renderStudyCircles();
}

function getRoomElapsedSeconds(room) {
  if (room.status !== "Studying" || !room.statusStartedAt) {
    return room.elapsedSeconds;
  }

  return room.elapsedSeconds + Math.floor((Date.now() - new Date(room.statusStartedAt).getTime()) / 1000);
}
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

  if (hours === 0 && minutes === 0 && safeSeconds > 0) {
    return "<1m";
  }

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function formatGoalHours(hours) {
  const label = hours === 1 ? "Hour" : "Hours";
  return `${Number(hours.toFixed(2))} ${label}`;
}

function formatClockTime(dateString) {
  if (!dateString) {
    return "Not started";
  }

  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getCompletedTaskCount() {
  return appData.tasks.filter(function (task) {
    return task.completed;
  }).length;
}

function getSubjectSecondsTotal() {
  return appData.subjects.reduce(function (total, subject) {
    return total + subject.seconds;
  }, 0);
}

function getGoalPercent() {
  const goalSeconds = appData.goalHours * 3600;

  if (goalSeconds <= 0) {
    return 0;
  }

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

function getActiveSubject() {
  if (!appData.activeSession) {
    return null;
  }

  return getSubjectById(appData.activeSession.subjectId);
}

function getSessionElapsedSeconds() {
  return appData.activeSession ? appData.activeSession.elapsedSeconds : 0;
}

function updateAllDisplays() {
  updateHome();
  updateSessionPage();
  updateGoal();
  updateInsights();
  renderTasks();
  renderDistractions();
  renderLeaderboard();
  renderStudyCircles();
}

function updateHome() {
  const goalPercent = getGoalPercent();
  const activeSubject = getActiveSubject();
  const pendingTasks = appData.tasks.filter(function (task) {
    return !task.completed;
  });

  todayDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  homeActiveStatus.textContent = appData.activeSession ? "Live" : "Idle";
  homeActiveSubject.textContent = activeSubject ? activeSubject.name : "No session running";
  homeSessionStart.textContent = appData.activeSession ? formatClockTime(appData.activeSession.startedAt) : "Not started";
  homeSessionElapsed.textContent = formatLongTime(getSessionElapsedSeconds());

  homeGoalPercent.textContent = `${goalPercent}%`;
  homeGoalHours.textContent = `${formatShortTime(appData.studySeconds)} / ${formatGoalHours(appData.goalHours)}`;
  homeGoalBar.style.width = `${goalPercent}%`;
  homeGoalCopy.textContent = `${formatShortTime(appData.studySeconds)} studied out of ${formatGoalHours(appData.goalHours)} today.`;

  homeTotalTime.textContent = formatShortTime(appData.studySeconds);
  homeCompletedTasks.textContent = getCompletedTaskCount();
  homeStreak.textContent = `${appData.streak} days`;

  homeIntentionTitle.textContent = appData.focusIntention || "Set one clear target for today.";
  homeIntentionCopy.textContent = appData.focusIntention
    ? "Keep this visible while choosing your next session."
    : "Use the Study Session page to write what matters most before you begin.";

  renderSubjectBreakdown(homeSubjectList);

  homeTaskPreview.innerHTML = "";
  if (pendingTasks.length === 0) {
    appendSimpleItem(homeTaskPreview, "No pending tasks. Nice and clear.");
  } else {
    pendingTasks.slice(0, 4).forEach(function (task) {
      appendSimpleItem(homeTaskPreview, task.text);
    });
  }
}

function updateSessionPage() {
  sessionStatus.textContent = appData.activeSession ? "Running" : "Not started";
  sessionDisplay.textContent = formatLongTime(getSessionElapsedSeconds());
  sessionTotalToday.textContent = formatShortTime(appData.studySeconds);
  renderSubjectOptions();
  renderSubjectBreakdown(sessionSubjectBreakdown);
  renderRecentSessions();
  updateIntentionForm(false);
}

function updateGoal() {
  const goalPercent = getGoalPercent();
  goalInput.value = appData.goalHours;
  goalTarget.textContent = formatGoalHours(appData.goalHours);
  goalSummary.textContent = `${goalPercent}% complete (${formatShortTime(appData.studySeconds)} studied)`;
  goalBar.style.width = `${goalPercent}%`;
}

function updateInsights() {
  insightTotalTime.textContent = formatShortTime(appData.studySeconds);
  insightTasks.textContent = getCompletedTaskCount();
  insightStreak.textContent = `${appData.streak} days`;
  renderSubjectBreakdown(subjectInsights);
}

function renderSubjectOptions() {
  sessionSubjectSelect.innerHTML = "";

  appData.subjects.forEach(function (subject) {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.name;
    sessionSubjectSelect.appendChild(option);
  });

  sessionSubjectSelect.value = appData.selectedSubjectId;
}

function renderSubjectBreakdown(container) {
  container.innerHTML = "";

  const studiedSubjects = appData.subjects.filter(function (subject) {
    return subject.seconds > 0;
  });

  if (studiedSubjects.length === 0) {
    appendSimpleItem(container, "No subject time tracked yet.");
    return;
  }

  studiedSubjects
    .slice()
    .sort(function (first, second) {
      return second.seconds - first.seconds;
    })
    .forEach(function (subject) {
      const row = document.createElement("div");
      row.className = "subject-row";

      const name = document.createElement("span");
      name.textContent = subject.name;

      const time = document.createElement("strong");
      time.textContent = formatShortTime(subject.seconds);

      row.appendChild(name);
      row.appendChild(time);
      container.appendChild(row);
    });
}

function renderRecentSessions() {
  recentSessionList.innerHTML = "";

  if (appData.sessions.length === 0) {
    appendSimpleItem(recentSessionList, "Recent sessions will appear after you pause a study session.");
    return;
  }

  appData.sessions.slice(0, 5).forEach(function (session) {
    const row = document.createElement("div");
    row.className = "session-row";

    const label = document.createElement("span");
    label.textContent = `${session.subjectName} - ${formatClockTime(session.startedAt)}`;

    const duration = document.createElement("strong");
    duration.textContent = formatShortTime(session.durationSeconds);

    row.appendChild(label);
    row.appendChild(duration);
    recentSessionList.appendChild(row);
  });
}

function startSession() {
  if (appData.activeSession) {
    return;
  }

  const selectedSubject = getSelectedSubject();
  appData.activeSession = {
    subjectId: selectedSubject.id,
    startedAt: new Date().toISOString(),
    elapsedSeconds: 0
  };
  appData.selectedSubjectId = selectedSubject.id;
  resumeSessionTimer();
  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function resumeSessionTimer() {
  if (sessionTimerId !== null) {
    return;
  }

  sessionTimerId = setInterval(function () {
    tickStudySession();
  }, 1000);
}

function tickStudySession() {
  if (!appData.activeSession) {
    clearInterval(sessionTimerId);
    sessionTimerId = null;
    return;
  }

  const activeSubject = getActiveSubject();

  appData.activeSession.elapsedSeconds = appData.activeSession.elapsedSeconds + 1;
  appData.studySeconds = appData.studySeconds + 1;

  if (activeSubject) {
    activeSubject.seconds = activeSubject.seconds + 1;
  }

  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function pauseSession(shouldRecordSession = true) {
  if (sessionTimerId !== null) {
    clearInterval(sessionTimerId);
    sessionTimerId = null;
  }

  if (appData.activeSession && shouldRecordSession && appData.activeSession.elapsedSeconds > 0) {
    const activeSubject = getActiveSubject();
    appData.sessions.unshift({
      id: createId(),
      subjectId: appData.activeSession.subjectId,
      subjectName: activeSubject ? activeSubject.name : "Study Session",
      startedAt: appData.activeSession.startedAt,
      endedAt: new Date().toISOString(),
      durationSeconds: appData.activeSession.elapsedSeconds
    });
    appData.sessions = appData.sessions.slice(0, 12);
  }

  appData.activeSession = null;
  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function resetSession() {
  if (sessionTimerId !== null) {
    clearInterval(sessionTimerId);
    sessionTimerId = null;
  }

  appData.activeSession = null;
  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function changeSessionSubject() {
  appData.selectedSubjectId = sessionSubjectSelect.value;

  if (appData.activeSession) {
    appData.activeSession.subjectId = appData.selectedSubjectId;
  }

  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function addSubject(event) {
  event.preventDefault();

  const subjectName = subjectInput.value.trim();

  if (subjectName === "") {
    return;
  }

  const existingSubject = appData.subjects.find(function (subject) {
    return subject.name.toLowerCase() === subjectName.toLowerCase();
  });

  if (existingSubject) {
    appData.selectedSubjectId = existingSubject.id;
  } else {
    const newSubject = createSubject(subjectName);
    appData.subjects.push(newSubject);
    appData.selectedSubjectId = newSubject.id;
  }

  if (appData.activeSession) {
    appData.activeSession.subjectId = appData.selectedSubjectId;
  }

  subjectInput.value = "";
  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function saveIntention(event) {
  event.preventDefault();
  appData.focusIntention = intentionInput.value.trim();
  saveData();
  updateIntentionForm(true);
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function updateIntentionForm(syncInput) {
  if (syncInput) {
    intentionInput.value = appData.focusIntention;
  }

  intentionCount.textContent = `${intentionInput.value.length}/180`;
}

function createTask(text) {
  return {
    id: createId(),
    text: text,
    completed: false
  };
}

function addTask(event) {
  event.preventDefault();

  const taskText = taskInput.value.trim();

  if (taskText === "") {
    return;
  }

  appData.tasks.push(createTask(taskText));
  taskInput.value = "";
  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function toggleTask(taskId) {
  appData.tasks = appData.tasks.map(function (task) {
    if (task.id === taskId) {
      return {
        id: task.id,
        text: task.text,
        completed: !task.completed
      };
    }

    return task;
  });

  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function deleteTask(taskId) {
  appData.tasks = appData.tasks.filter(function (task) {
    return task.id !== taskId;
  });

  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function renderTasks() {
  pendingTaskList.innerHTML = "";
  completedTaskList.innerHTML = "";

  const pendingTasks = appData.tasks.filter(function (task) {
    return !task.completed;
  });
  const completedTasks = appData.tasks.filter(function (task) {
    return task.completed;
  });

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

    if (task.completed) {
      listItem.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", function () {
      toggleTask(task.id);
    });

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteTask(task.id);
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(taskText);
    listItem.appendChild(deleteButton);
    listElement.appendChild(listItem);
  });
}

function saveGoal(event) {
  event.preventDefault();

  const goalHours = Number(goalInput.value);

  if (goalHours <= 0) {
    return;
  }

  appData.goalHours = goalHours;
  saveData();
  updateAllDisplays();
setInterval(renderStudyCircles, 1000);
}

function addDistraction(event) {
  event.preventDefault();

  const reason = distractionInput.value.trim();

  if (reason === "") {
    return;
  }

  appData.distractions.unshift({
    id: createId(),
    category: distractionCategory.value,
    reason: reason,
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
  const mockUsers = [
    {
      rank: 1,
      name: "You",
      time: formatShortTime(appData.studySeconds),
      streak: `${appData.streak} days`,
      tasks: getCompletedTaskCount()
    },
    { rank: 2, name: "Maya", time: "3h 20m", streak: "5 days", tasks: 6 },
    { rank: 3, name: "Arif", time: "2h 45m", streak: "3 days", tasks: 4 },
    { rank: 4, name: "Nina", time: "1h 55m", streak: "2 days", tasks: 3 }
  ];

  leaderboardTable.innerHTML = "";

  mockUsers.forEach(function (user) {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    row.innerHTML = `
      <strong>#${user.rank}</strong>
      <span>${user.name}</span>
      <span>${user.time}</span>
      <span>${user.streak}</span>
      <span>${user.tasks} tasks</span>
    `;
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
      applyAppearance();
      saveData();
      renderThemes();
    });

    themeGrid.appendChild(button);
  });
}

function applyAppearance() {
  document.body.dataset.theme = appData.theme;
  document.documentElement.style.setProperty("--primary", appData.accentColor);
  accentInput.value = appData.accentColor;
}

function saveAccentColor() {
  appData.accentColor = accentInput.value;
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

function appendSimpleItem(parent, text) {
  const itemTag = parent.tagName === "UL" || parent.tagName === "OL" ? "li" : "p";
  const item = document.createElement(itemTag);
  item.className = "empty-message";
  item.textContent = text;
  parent.appendChild(item);
}

function createId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeStudyCircles() {
  if (!Array.isArray(appData.studyCircles) || appData.studyCircles.length === 0) {
    appData.studyCircles = [createDefaultStudyCircle()];
  }

  appData.studyCircles = appData.studyCircles.map(function (circle) {
    return {
      id: circle.id || createId(),
      name: circle.name || "Untitled Circle",
      icon: (circle.icon || "SC").slice(0, 3).toUpperCase(),
      description: circle.description || "A shared StudyMate circle.",
      inviteCode: circle.inviteCode || generateInviteCode(),
      members: normalizeCircleMembers(circle.members),
      rooms: normalizeFocusRooms(circle.rooms)
    };
  });

  if (!getCircleById(appData.selectedCircleId)) {
    appData.selectedCircleId = appData.studyCircles[0].id;
  }

  if (appData.activeRoomId && !getRoomById(appData.activeRoomId)) {
    appData.activeRoomId = null;
  }
}

function normalizeCircleMembers(members) {
  const normalizedMembers = Array.isArray(members) && members.length > 0 ? members : [{ id: "you", name: "You", status: "Studying", totalSeconds: 0 }];
  const hasYou = normalizedMembers.some(function (member) {
    return member.id === "you";
  });

  if (!hasYou) {
    normalizedMembers.unshift({ id: "you", name: "You", status: "Studying", totalSeconds: 0 });
  }

  return normalizedMembers.map(function (member) {
    return {
      id: member.id || createId(),
      name: member.name || "Student",
      status: member.status || "Paused",
      totalSeconds: Number(member.totalSeconds) || 0
    };
  });
}

function normalizeFocusRooms(rooms) {
  if (!Array.isArray(rooms)) {
    return [];
  }

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
      elapsedSeconds: Number(room.elapsedSeconds) || 0,
      statusStartedAt: room.statusStartedAt || null,
      members: Array.isArray(room.members) ? room.members : []
    };
  });
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

    if (room) {
      return room;
    }
  }

  return null;
}

function generateInviteCode() {
  return `SM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function renderStudyCircles() {
  if (!circleList) {
    return;
  }

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
    button.innerHTML = `<span>${circle.icon}</span><div><strong>${circle.name}</strong><small>${circle.members.length} members</small></div>`;
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
  if (!circle) {
    return;
  }

  circleIconDisplay.textContent = circle.icon;
  circleNameDisplay.textContent = circle.name;
  circleDescriptionDisplay.textContent = circle.description;
  circleInviteDisplay.textContent = circle.inviteCode;
  circleInviteCode.textContent = circle.inviteCode;
  circleMemberCount.textContent = circle.members.length;
  circleRoomCount.textContent = circle.rooms.length;
  circleFormMode.textContent = "Editing selected circle";

  if (document.activeElement !== circleNameInput && document.activeElement !== circleIconInput && document.activeElement !== circleDescriptionInput) {
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
    const row = document.createElement("div");
    row.className = "member-row";
    row.innerHTML = `<span>${member.name}</span><strong>${member.status}</strong>`;
    circleMemberList.appendChild(row);
  });
}

function renderCircleLeaderboard(circle) {
  circleLeaderboard.innerHTML = "";

  circle.members
    .slice()
    .sort(function (first, second) {
      return second.totalSeconds - first.totalSeconds;
    })
    .forEach(function (member, index) {
      const row = document.createElement("div");
      row.className = "member-row";
      row.innerHTML = `<span>#${index + 1} ${member.name}</span><strong>${formatShortTime(member.totalSeconds)}</strong>`;
      circleLeaderboard.appendChild(row);
    });
}

function saveCircle(event) {
  event.preventDefault();

  const selectedCircle = getSelectedCircle();
  const circleName = circleNameInput.value.trim();
  const circleIcon = circleIconInput.value.trim().slice(0, 3).toUpperCase() || "SC";
  const circleDescription = circleDescriptionInput.value.trim() || "A shared StudyMate circle.";

  if (!circleName) {
    return;
  }

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
      members: [{ id: "you", name: "You", status: "Studying", totalSeconds: appData.studySeconds }],
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

  const selectedCircle = getSelectedCircle();

  if (!selectedCircle) {
    return;
  }

  selectedCircle.rooms.unshift({
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
    appendSimpleItem(focusRoomList, "No Focus Rooms yet. Create one for a live study session.");
    return;
  }

  circle.rooms.forEach(function (room) {
    const isJoined = appData.activeRoomId === room.id;
    const roomCard = document.createElement("article");
    roomCard.className = "room-card";
    roomCard.innerHTML = `
      <div class="room-card-topline">
        <span class="circle-icon small-icon">${room.icon}</span>
        <div>
          <h3>${room.name}</h3>
          <p class="muted-text">${room.description}</p>
        </div>
        <span class="status-pill">${room.privacy}</span>
      </div>
      <div class="room-session-grid compact-room-grid">
        <div><span>Subject</span><strong>${room.subject}</strong></div>
        <div><span>Members</span><strong>${room.members.length}/${room.maxMembers}</strong></div>
        <div><span>Status</span><strong>${room.status}</strong></div>
      </div>
    `;

    const action = document.createElement("button");
    action.type = "button";
    action.className = isJoined ? "secondary-button" : "";
    action.textContent = isJoined ? "Joined" : "Join Focus Room";
    action.disabled = !isJoined && room.members.length >= room.maxMembers;
    action.addEventListener("click", function () {
      joinFocusRoom(room.id);
    });

    roomCard.appendChild(action);
    focusRoomList.appendChild(roomCard);
  });
}

function joinFocusRoom(roomId) {
  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

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
    room.members = room.members.filter(function (member) {
      return member.id !== "you";
    });
  }

  appData.activeRoomId = null;
  saveData();

  if (shouldRender) {
    renderStudyCircles();
  }
}

function renderActiveRoom() {
  const room = getRoomById(appData.activeRoomId);

  if (!room) {
    activeRoomName.textContent = "No room joined";
    activeRoomDescription.textContent = "Join a Focus Room to see the live study session.";
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
    button.addEventListener("click", function () {
      updateRoomStatus(room.id, status);
    });
    roomStatusControls.appendChild(button);
  });
}

function renderActiveRoomMembers(room) {
  activeRoomMembers.innerHTML = "";

  const demoMembers = room.members.length > 1 ? room.members : room.members.concat([
    { id: "maya-demo", name: "Maya", status: "Studying" },
    { id: "arif-demo", name: "Arif", status: "Short Break" }
  ]);

  demoMembers.forEach(function (member) {
    const row = document.createElement("div");
    row.className = "member-row";
    row.innerHTML = `<span>${member.name}</span><strong>${member.status}</strong>`;
    activeRoomMembers.appendChild(row);
  });
}

function updateRoomStatus(roomId, status) {
  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

  room.elapsedSeconds = getRoomElapsedSeconds(room);
  room.status = status;
  room.statusStartedAt = status === "Studying" ? new Date().toISOString() : null;
  room.members = room.members.map(function (member) {
    return member.id === "you" ? { ...member, status: status } : member;
  });

  saveData();
  renderStudyCircles();
}

function getRoomElapsedSeconds(room) {
  if (room.status !== "Studying" || !room.statusStartedAt) {
    return room.elapsedSeconds;
  }

  return room.elapsedSeconds + Math.floor((Date.now() - new Date(room.statusStartedAt).getTime()) / 1000);
}
navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    showSection(button.dataset.section);
  });
});

homeContinueSession.addEventListener("click", function () {
  showSection("focus-hub");
});
homeOpenSession.addEventListener("click", function () {
  showSection("focus-hub");
});
sessionStartButton.addEventListener("click", startSession);
sessionPauseButton.addEventListener("click", function () {
  pauseSession(true);
});
sessionResetButton.addEventListener("click", resetSession);
sessionSubjectSelect.addEventListener("change", changeSessionSubject);
subjectForm.addEventListener("submit", addSubject);
intentionForm.addEventListener("submit", saveIntention);
intentionInput.addEventListener("input", function () {
  updateIntentionForm(false);
});
taskForm.addEventListener("submit", addTask);
goalForm.addEventListener("submit", saveGoal);
distractionForm.addEventListener("submit", addDistraction);
saveAccentButton.addEventListener("click", saveAccentColor);
newCircleButton.addEventListener("click", prepareNewCircle);
circleForm.addEventListener("submit", saveCircle);
roomForm.addEventListener("submit", createFocusRoom);
leaveRoomButton.addEventListener("click", function () {
  leaveFocusRoom(true);
});
menuToggle.addEventListener("click", toggleSidebar);

loadData();
applyAppearance();
applySidebarState();
renderThemes();
intentionInput.value = appData.focusIntention;
updateAllDisplays();
setInterval(renderStudyCircles, 1000);