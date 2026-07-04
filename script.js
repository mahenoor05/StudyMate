const STORAGE_KEY = "studymate-app-v3";
const OLD_STORAGE_KEYS = ["studymate-app-v2", "studymate-dashboard"];
const POMODORO_SECONDS = 25 * 60;

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

const navButtons = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");

const todayDate = document.getElementById("today-date");
const homeFocusTitle = document.getElementById("home-focus-title");
const homeFocusDetail = document.getElementById("home-focus-detail");
const homeActiveStatus = document.getElementById("home-active-status");
const homeTotalTime = document.getElementById("home-total-time");
const homeStreak = document.getElementById("home-streak");
const homeGoalPercent = document.getElementById("home-goal-percent");
const homeGoalBar = document.getElementById("home-goal-bar");
const homeGoalCopy = document.getElementById("home-goal-copy");
const homeTaskPreview = document.getElementById("home-task-preview");

const overallDisplay = document.getElementById("overall-display");
const overallStatus = document.getElementById("overall-status");
const overallStartButton = document.getElementById("overall-start");
const overallPauseButton = document.getElementById("overall-pause");
const overallResetButton = document.getElementById("overall-reset");

const subjectForm = document.getElementById("subject-form");
const subjectInput = document.getElementById("subject-input");
const subjectList = document.getElementById("subject-list");

const pomodoroDisplay = document.getElementById("pomodoro-display");
const pomodoroStatus = document.getElementById("pomodoro-status");
const pomodoroStartButton = document.getElementById("pomodoro-start");
const pomodoroPauseButton = document.getElementById("pomodoro-pause");
const pomodoroResetButton = document.getElementById("pomodoro-reset");

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const pendingTaskList = document.getElementById("pending-task-list");
const completedTaskList = document.getElementById("completed-task-list");

const goalForm = document.getElementById("goal-form");
const goalInput = document.getElementById("goal-input");
const goalSummary = document.getElementById("goal-summary");
const goalBar = document.getElementById("goal-bar");

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

let overallTimerId = null;
let subjectTimerId = null;
let activeSubjectId = null;
let pomodoroTimerId = null;
let pomodoroSecondsLeft = POMODORO_SECONDS;

let appData = createDefaultData();

function createDefaultData() {
  return {
    date: getTodayKey(),
    theme: "midnight",
    accentColor: "#7c5cff",
    overallSeconds: 0,
    pomodoroCompleted: 0,
    goalMinutes: 120,
    streak: 0,
    tasks: [],
    subjects: [],
    distractions: []
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

    return {
      ...createDefaultData(),
      date: parsedOldData.date || getTodayKey(),
      theme: parsedOldData.theme || (parsedOldData.darkMode === false ? "light" : "midnight"),
      overallSeconds: parsedOldData.overallSeconds || parsedOldData.completedSeconds || 0,
      pomodoroCompleted: parsedOldData.pomodoroCompleted || parsedOldData.completedPomodoros || 0,
      goalMinutes: parsedOldData.goalMinutes || 120,
      streak: parsedOldData.streak || 0,
      tasks: Array.isArray(parsedOldData.tasks) ? parsedOldData.tasks : [],
      subjects: Array.isArray(parsedOldData.subjects) ? parsedOldData.subjects : []
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

  if (!Array.isArray(appData.distractions)) {
    appData.distractions = [];
  }

  if (typeof appData.overallSeconds !== "number") {
    appData.overallSeconds = 0;
  }

  if (typeof appData.pomodoroCompleted !== "number") {
    appData.pomodoroCompleted = 0;
  }

  if (typeof appData.goalMinutes !== "number") {
    appData.goalMinutes = 120;
  }

  if (typeof appData.streak !== "number") {
    appData.streak = 0;
  }
}

function resetDailyData() {
  appData.date = getTodayKey();
  appData.overallSeconds = 0;
  appData.pomodoroCompleted = 0;
  appData.tasks = [];
  appData.distractions = [];

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

  navButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
}

function formatLongTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

function formatShortTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function formatPomodoroTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getSubjectSecondsTotal() {
  return appData.subjects.reduce(function (total, subject) {
    return total + subject.seconds;
  }, 0);
}

function getTotalStudySeconds() {
  return appData.overallSeconds + getSubjectSecondsTotal();
}

function getTopSubject() {
  if (appData.subjects.length === 0) {
    return null;
  }

  return appData.subjects.reduce(function (topSubject, subject) {
    return subject.seconds > topSubject.seconds ? subject : topSubject;
  }, appData.subjects[0]);
}

function getCompletedTaskCount() {
  return appData.tasks.filter(function (task) {
    return task.completed;
  }).length;
}

function getGoalPercent() {
  const goalSeconds = appData.goalMinutes * 60;

  if (goalSeconds === 0) {
    return 0;
  }

  return Math.min(Math.round((getTotalStudySeconds() / goalSeconds) * 100), 100);
}

function updateHome() {
  const topSubject = getTopSubject();
  const pendingTasks = appData.tasks.filter(function (task) {
    return !task.completed;
  });
  const goalPercent = getGoalPercent();

  todayDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  homeTotalTime.textContent = formatShortTime(getTotalStudySeconds());
  homeStreak.textContent = `${appData.streak} days`;
  homeGoalPercent.textContent = `${goalPercent}%`;
  homeGoalBar.style.width = `${goalPercent}%`;
  homeGoalCopy.textContent = `${formatShortTime(getTotalStudySeconds())} of ${appData.goalMinutes} minutes planned.`;

  if (activeSubjectId) {
    const activeSubject = appData.subjects.find(function (subject) {
      return subject.id === activeSubjectId;
    });
    homeFocusTitle.textContent = activeSubject ? activeSubject.name : "Subject timer running";
    homeFocusDetail.textContent = "Subject Studio is currently tracking focused study time.";
    homeActiveStatus.textContent = "Subject Live";
  } else if (overallTimerId) {
    homeFocusTitle.textContent = "Focus Hub is running";
    homeFocusDetail.textContent = "Overall study time is being tracked.";
    homeActiveStatus.textContent = "Live";
  } else {
    homeFocusTitle.textContent = topSubject && topSubject.seconds > 0 ? topSubject.name : "No active session";
    homeFocusDetail.textContent = "Start a timer when you are ready to study.";
    homeActiveStatus.textContent = "Idle";
  }

  homeTaskPreview.innerHTML = "";

  if (pendingTasks.length === 0) {
    appendSimpleItem(homeTaskPreview, "No pending tasks. Nice and clear.");
  } else {
    pendingTasks.slice(0, 3).forEach(function (task) {
      appendSimpleItem(homeTaskPreview, task.text);
    });
  }
}

function updateGoal() {
  const goalPercent = getGoalPercent();
  goalInput.value = appData.goalMinutes;
  goalSummary.textContent = `${goalPercent}% complete`;
  goalBar.style.width = `${goalPercent}%`;
}

function updateInsights() {
  insightTotalTime.textContent = formatShortTime(getTotalStudySeconds());
  insightTasks.textContent = getCompletedTaskCount();
  insightStreak.textContent = `${appData.streak} days`;

  subjectInsights.innerHTML = "";

  if (appData.subjects.length === 0) {
    appendSimpleItem(subjectInsights, "No subject data yet.");
    return;
  }

  appData.subjects.forEach(function (subject) {
    const row = document.createElement("div");
    row.className = "insight-row";

    const name = document.createElement("span");
    name.textContent = subject.name;

    const time = document.createElement("strong");
    time.textContent = formatShortTime(subject.seconds);

    row.appendChild(name);
    row.appendChild(time);
    subjectInsights.appendChild(row);
  });
}

function updateAllDisplays() {
  overallDisplay.textContent = formatLongTime(appData.overallSeconds);
  pomodoroDisplay.textContent = formatPomodoroTime(pomodoroSecondsLeft);
  updateHome();
  updateGoal();
  updateInsights();
  renderLeaderboard();
}

function startOverallTimer() {
  if (overallTimerId !== null) {
    return;
  }

  overallStatus.textContent = "Running";

  overallTimerId = setInterval(function () {
    appData.overallSeconds = appData.overallSeconds + 1;
    saveData();
    updateAllDisplays();
  }, 1000);
}

function pauseOverallTimer() {
  if (overallTimerId === null) {
    return;
  }

  clearInterval(overallTimerId);
  overallTimerId = null;
  overallStatus.textContent = "Paused";
  updateAllDisplays();
}

function resetOverallTimer() {
  pauseOverallTimer();
  appData.overallSeconds = 0;
  overallStatus.textContent = "Not started";
  saveData();
  updateAllDisplays();
}

function createSubject(name) {
  return {
    id: Date.now(),
    name: name,
    seconds: 0
  };
}

function addSubject(event) {
  event.preventDefault();

  const subjectName = subjectInput.value.trim();

  if (subjectName === "") {
    return;
  }

  appData.subjects.push(createSubject(subjectName));
  subjectInput.value = "";
  saveData();
  renderSubjects();
  updateAllDisplays();
}

function startSubjectTimer(subjectId) {
  if (activeSubjectId === subjectId) {
    return;
  }

  pauseSubjectTimer();
  activeSubjectId = subjectId;

  subjectTimerId = setInterval(function () {
    const activeSubject = appData.subjects.find(function (subject) {
      return subject.id === activeSubjectId;
    });

    if (!activeSubject) {
      pauseSubjectTimer();
      return;
    }

    activeSubject.seconds = activeSubject.seconds + 1;
    saveData();
    renderSubjects();
    updateAllDisplays();
  }, 1000);

  renderSubjects();
  updateAllDisplays();
}

function pauseSubjectTimer() {
  clearInterval(subjectTimerId);
  subjectTimerId = null;
  activeSubjectId = null;
  renderSubjects();
  updateAllDisplays();
}

function resetSubjectTimer(subjectId) {
  if (activeSubjectId === subjectId) {
    pauseSubjectTimer();
  }

  appData.subjects = appData.subjects.map(function (subject) {
    if (subject.id === subjectId) {
      return {
        id: subject.id,
        name: subject.name,
        seconds: 0
      };
    }

    return subject;
  });

  saveData();
  renderSubjects();
  updateAllDisplays();
}

function renderSubjects() {
  subjectList.innerHTML = "";

  if (appData.subjects.length === 0) {
    appendSimpleItem(subjectList, "No subjects yet. Add one to start tracking by subject.");
    return;
  }

  appData.subjects.forEach(function (subject) {
    const subjectCard = document.createElement("article");
    subjectCard.className = "subject-card";

    const subjectInfo = document.createElement("div");
    const subjectTitle = document.createElement("h3");
    const subjectTime = document.createElement("p");

    subjectTitle.textContent = subject.name;
    subjectTime.className = "subject-time";
    subjectTime.textContent = formatLongTime(subject.seconds);

    subjectInfo.appendChild(subjectTitle);
    subjectInfo.appendChild(subjectTime);

    const actions = document.createElement("div");
    actions.className = "subject-actions";

    const startButton = document.createElement("button");
    startButton.type = "button";
    startButton.textContent = activeSubjectId === subject.id ? "Running" : "Start";
    startButton.addEventListener("click", function () {
      startSubjectTimer(subject.id);
    });

    const pauseButton = document.createElement("button");
    pauseButton.type = "button";
    pauseButton.className = "secondary-button";
    pauseButton.textContent = "Pause";
    pauseButton.addEventListener("click", pauseSubjectTimer);

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "secondary-button";
    resetButton.textContent = "Reset";
    resetButton.addEventListener("click", function () {
      resetSubjectTimer(subject.id);
    });

    actions.appendChild(startButton);
    actions.appendChild(pauseButton);
    actions.appendChild(resetButton);

    subjectCard.appendChild(subjectInfo);
    subjectCard.appendChild(actions);
    subjectList.appendChild(subjectCard);
  });
}

function startPomodoro() {
  if (pomodoroTimerId !== null) {
    return;
  }

  pomodoroStatus.textContent = "Running";

  pomodoroTimerId = setInterval(function () {
    pomodoroSecondsLeft = pomodoroSecondsLeft - 1;
    pomodoroDisplay.textContent = formatPomodoroTime(pomodoroSecondsLeft);

    if (pomodoroSecondsLeft === 0) {
      completePomodoro();
    }
  }, 1000);
}

function pausePomodoro() {
  if (pomodoroTimerId === null) {
    return;
  }

  clearInterval(pomodoroTimerId);
  pomodoroTimerId = null;
  pomodoroStatus.textContent = "Paused";
}

function resetPomodoro() {
  pausePomodoro();
  pomodoroSecondsLeft = POMODORO_SECONDS;
  pomodoroStatus.textContent = "Not started";
  pomodoroDisplay.textContent = formatPomodoroTime(pomodoroSecondsLeft);
}

function completePomodoro() {
  clearInterval(pomodoroTimerId);
  pomodoroTimerId = null;
  pomodoroSecondsLeft = POMODORO_SECONDS;
  appData.pomodoroCompleted = appData.pomodoroCompleted + 1;
  pomodoroStatus.textContent = "Session complete";
  saveData();
  updateAllDisplays();
}

function createTask(text) {
  return {
    id: Date.now(),
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
  renderTasks();
  updateAllDisplays();
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

  const goalMinutes = Number(goalInput.value);

  if (goalMinutes < 1) {
    return;
  }

  appData.goalMinutes = goalMinutes;
  saveData();
  updateAllDisplays();
}

function addDistraction(event) {
  event.preventDefault();

  const reason = distractionInput.value.trim();

  if (reason === "") {
    return;
  }

  appData.distractions.unshift({
    id: Date.now(),
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
      time: formatShortTime(getTotalStudySeconds()),
      streak: `${appData.streak} days`,
      tasks: getCompletedTaskCount()
    },
    // Real leaderboard data will come from a backend/database later.
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

function appendSimpleItem(parent, text) {
  const itemTag = parent.tagName === "UL" || parent.tagName === "OL" ? "li" : "p";
  const item = document.createElement(itemTag);
  item.className = "empty-message";
  item.textContent = text;
  parent.appendChild(item);
}

navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    showSection(button.dataset.section);
  });
});

overallStartButton.addEventListener("click", startOverallTimer);
overallPauseButton.addEventListener("click", pauseOverallTimer);
overallResetButton.addEventListener("click", resetOverallTimer);
subjectForm.addEventListener("submit", addSubject);
pomodoroStartButton.addEventListener("click", startPomodoro);
pomodoroPauseButton.addEventListener("click", pausePomodoro);
pomodoroResetButton.addEventListener("click", resetPomodoro);
taskForm.addEventListener("submit", addTask);
goalForm.addEventListener("submit", saveGoal);
distractionForm.addEventListener("submit", addDistraction);
saveAccentButton.addEventListener("click", saveAccentColor);

loadData();
applyAppearance();
renderThemes();
renderSubjects();
renderTasks();
renderDistractions();
updateAllDisplays();
