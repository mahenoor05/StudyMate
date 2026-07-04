const FOCUS_TIME_SECONDS = 25 * 60;
const STORAGE_KEY = "studymate-dashboard";

const timerDisplay = document.getElementById("timer-display");
const timerStatus = document.getElementById("timer-status");
const startButton = document.getElementById("start-timer");
const pauseButton = document.getElementById("pause-timer");
const resetButton = document.getElementById("reset-timer");
const themeToggle = document.getElementById("theme-toggle");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const studyTimeStat = document.getElementById("study-time-stat");
const pomodoroStat = document.getElementById("pomodoro-stat");

let timeLeft = FOCUS_TIME_SECONDS;
let timerId = null;

let appData = {
  date: getTodayKey(),
  completedSeconds: 0,
  completedPomodoros: 0,
  darkMode: false,
  tasks: []
};

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
    try {
      appData = JSON.parse(savedData);
    } catch (error) {
      saveData();
    }
  }

  if (appData.date !== getTodayKey()) {
    appData.date = getTodayKey();
    appData.completedSeconds = 0;
    appData.completedPomodoros = 0;
  }

  if (!Array.isArray(appData.tasks)) {
    appData.tasks = [];
  }

  saveData();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatStudyTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTimer(timeLeft);
}

function updateStatsDisplay() {
  studyTimeStat.textContent = formatStudyTime(appData.completedSeconds);
  pomodoroStat.textContent = appData.completedPomodoros;
}

function startTimer() {
  if (timerId !== null) {
    return;
  }

  timerStatus.textContent = "Focus time";

  timerId = setInterval(function () {
    timeLeft = timeLeft - 1;
    updateTimerDisplay();

    if (timeLeft === 0) {
      completeSession();
    }
  }, 1000);
}

function pauseTimer() {
  if (timerId === null) {
    return;
  }

  clearInterval(timerId);
  timerId = null;
  timerStatus.textContent = "Paused";
}

function resetTimer() {
  clearInterval(timerId);
  timerId = null;
  timeLeft = FOCUS_TIME_SECONDS;
  timerStatus.textContent = "Not started";
  updateTimerDisplay();
}

function completeSession() {
  clearInterval(timerId);
  timerId = null;

  appData.completedSeconds = appData.completedSeconds + FOCUS_TIME_SECONDS;
  appData.completedPomodoros = appData.completedPomodoros + 1;

  timeLeft = FOCUS_TIME_SECONDS;
  timerStatus.textContent = "Session complete";

  saveData();
  updateTimerDisplay();
  updateStatsDisplay();
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
}

function renderTasks() {
  taskList.innerHTML = "";

  if (appData.tasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-task-message";
    emptyMessage.textContent = "No tasks yet. Add one to plan your study session.";
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

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);
themeToggle.addEventListener("click", toggleTheme);
taskForm.addEventListener("submit", addTask);

loadData();
applyTheme();
updateTimerDisplay();
updateStatsDisplay();
renderTasks();
