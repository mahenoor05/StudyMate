const STORAGE_KEY = "studymate-app-v2";
const OLD_STORAGE_KEY = "studymate-dashboard";
const POMODORO_SECONDS = 25 * 60;

const navButtons = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");

const dashboardTotalTime = document.getElementById("dashboard-total-time");
const dashboardTopSubject = document.getElementById("dashboard-top-subject");
const dashboardTasksCompleted = document.getElementById("dashboard-tasks-completed");
const dashboardStreak = document.getElementById("dashboard-streak");
const dashboardGoalProgress = document.getElementById("dashboard-goal-progress");
const dashboardGoalBar = document.getElementById("dashboard-goal-bar");

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
const taskList = document.getElementById("task-list");

const goalForm = document.getElementById("goal-form");
const goalInput = document.getElementById("goal-input");
const goalSummary = document.getElementById("goal-summary");

const statsOverallTime = document.getElementById("stats-overall-time");
const statsSubjectTime = document.getElementById("stats-subject-time");
const statsPomodoros = document.getElementById("stats-pomodoros");
const leaderboardYou = document.getElementById("leaderboard-you");
const themeToggle = document.getElementById("theme-toggle");

let overallTimerId = null;
let subjectTimerId = null;
let activeSubjectId = null;
let pomodoroTimerId = null;
let pomodoroSecondsLeft = POMODORO_SECONDS;

let appData = createDefaultData();

function createDefaultData() {
  return {
    date: getTodayKey(),
    darkMode: false,
    overallSeconds: 0,
    pomodoroCompleted: 0,
    goalMinutes: 120,
    streak: 0,
    tasks: [],
    subjects: []
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
  const oldData = localStorage.getItem(OLD_STORAGE_KEY);

  if (savedData) {
    appData = parseSavedData(savedData);
  } else if (oldData) {
    appData = migrateOldData(oldData);
  }

  normalizeData();

  if (appData.date !== getTodayKey()) {
    resetDailyData();
  }

  saveData();
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
      darkMode: Boolean(parsedOldData.darkMode),
      overallSeconds: parsedOldData.completedSeconds || 0,
      pomodoroCompleted: parsedOldData.completedPomodoros || 0,
      tasks: Array.isArray(parsedOldData.tasks) ? parsedOldData.tasks : []
    };
  } catch (error) {
    return createDefaultData();
  }
}

function resetDailyData() {
  appData.date = getTodayKey();
  appData.overallSeconds = 0;
  appData.pomodoroCompleted = 0;
  appData.tasks = [];

  appData.subjects = appData.subjects.map(function (subject) {
    return {
      id: subject.id,
      name: subject.name,
      seconds: 0
    };
  });
}

function normalizeData() {
  if (!Array.isArray(appData.tasks)) {
    appData.tasks = [];
  }

  if (!Array.isArray(appData.subjects)) {
    appData.subjects = [];
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

function updateDashboard() {
  const totalSeconds = getTotalStudySeconds();
  const topSubject = getTopSubject();
  const completedTasks = appData.tasks.filter(function (task) {
    return task.completed;
  }).length;
  const goalSeconds = appData.goalMinutes * 60;
  const goalPercent = goalSeconds === 0 ? 0 : Math.min(Math.round((totalSeconds / goalSeconds) * 100), 100);

  dashboardTotalTime.textContent = formatShortTime(totalSeconds);
  dashboardTopSubject.textContent = topSubject && topSubject.seconds > 0 ? topSubject.name : "None";
  dashboardTasksCompleted.textContent = `${completedTasks}/${appData.tasks.length}`;
  dashboardStreak.textContent = `${appData.streak} days`;
  dashboardGoalProgress.textContent = `${goalPercent}%`;
  dashboardGoalBar.style.width = `${goalPercent}%`;
}

function updateStats() {
  statsOverallTime.textContent = formatShortTime(appData.overallSeconds);
  statsSubjectTime.textContent = formatShortTime(getSubjectSecondsTotal());
  statsPomodoros.textContent = appData.pomodoroCompleted;
  leaderboardYou.textContent = formatShortTime(getTotalStudySeconds());
}

function updateGoal() {
  goalInput.value = appData.goalMinutes;
  goalSummary.textContent = `Your goal is ${appData.goalMinutes} minutes. Current progress is ${dashboardGoalProgress.textContent}.`;
}

function updateAllDisplays() {
  overallDisplay.textContent = formatLongTime(appData.overallSeconds);
  pomodoroDisplay.textContent = formatPomodoroTime(pomodoroSecondsLeft);
  updateDashboard();
  updateStats();
  updateGoal();
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
}

function pauseSubjectTimer() {
  clearInterval(subjectTimerId);
  subjectTimerId = null;
  activeSubjectId = null;
  renderSubjects();
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
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "No subjects yet. Add one to start tracking study time by subject.";
    subjectList.appendChild(emptyMessage);
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

function renderTasks() {
  taskList.innerHTML = "";

  if (appData.tasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "No tasks yet. Add a task to plan your study session.";
    taskList.appendChild(emptyMessage);
    return;
  }

  appData.tasks.forEach(function (task) {
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

    listItem.appendChild(checkbox);
    listItem.appendChild(taskText);
    taskList.appendChild(listItem);
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

function applyTheme() {
  document.body.classList.toggle("dark-mode", appData.darkMode);
  themeToggle.textContent = appData.darkMode ? "Light Mode" : "Dark Mode";
}

function toggleTheme() {
  appData.darkMode = !appData.darkMode;
  applyTheme();
  saveData();
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
themeToggle.addEventListener("click", toggleTheme);

loadData();
applyTheme();
renderSubjects();
renderTasks();
updateAllDisplays();
