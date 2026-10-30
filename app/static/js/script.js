const STORAGE_KEY = "studymate-app-v4";
const OLD_STORAGE_KEYS = ["studymate-app-v3", "studymate-app-v2", "studymate-dashboard"];

const themes = [
  { id: "dark", name: "Forest Dark", accent: "#2D6A4F", secondaryAccent: "#E09F67", desc: "Deep charcoal-forest & rich emerald" },
  { id: "light", name: "Sage Light", accent: "#1E4B35", secondaryAccent: "#C67A52", desc: "Pale sage wash & deep bottle green" }
];

const studyMateUser = window.STUDYMATE_USER || {};
const ACCOUNT_STORAGE_ID = studyMateUser.id
  ? `id:${studyMateUser.id}`
  : (studyMateUser.username || studyMateUser.email || "anonymous");
const ACCOUNT_STORAGE_KEY = `${STORAGE_KEY}:user:${ACCOUNT_STORAGE_ID}`;
const ACTIVE_SESSION_STALE_MS = 2 * 60 * 60 * 1000;
const LEGACY_TIMER_STORAGE_KEYS = [
  "studymate-active-session",
  "studymate-current-session",
  "studymate-focus-session",
  "studymate-focus-timer",
  "studymate-session-timer"
];
const legacyImportBanner = document.getElementById("legacy-import-banner");
const importLocalDataButton = document.getElementById("import-local-data");
let databaseLoaded = false;
let isHydratingFromServer = false;
// Save guard state: which server save our data is based on, and one save at a time.
let appDataRevision = 0;
let appDataSaveInFlight = null;
let appDataSaveQueued = false;
let appDataSyncBlocked = false;
let appDataBase = null;
let appDataConflictRetries = 0;
let appDataSavePending = false;
// Focus session guard: how many session requests are in flight, and which session the server confirmed.
let activeFocusBusy = 0;
let confirmedActiveSessionId = null;
let syncTimerId = null;

const subjectPalette = [
  { key: "teal", name: "Teal", value: "#0F766E" },
  { key: "coral", name: "Coral", value: "#E76F51" },
  { key: "blue", name: "Sky Blue", value: "#0284C7" },
  { key: "sage", name: "Sage", value: "#2D6A4F" },
  { key: "amber", name: "Amber", value: "#D97706" },
  { key: "rose", name: "Rose", value: "#E11D48" },
  { key: "slate", name: "Slate", value: "#475569" },
  { key: "mint", name: "Mint", value: "#059669" }
];

const avatarPresets = [
  { style: "initials", color: "teal", label: "Teal" },
  { style: "spark", color: "coral", label: "Coral" },
  { style: "orbit", color: "blue", label: "Sky" },
  { style: "initials", color: "sage", label: "Sage" },
  { style: "spark", color: "amber", label: "Amber" },
  { style: "orbit", color: "slate", label: "Slate" }
];

const timerModes = [
  { id: "stopwatch", name: "Stopwatch", description: "Count up while you study.", focusMinutes: null, breakMinutes: 0 },
  { id: "pomodoro", name: "Pomodoro", description: "25 minutes focus, then a 5 minute break.", focusMinutes: 25, breakMinutes: 5 },
  { id: "deep-focus", name: "Deep Focus", description: "50 minutes focus, then a 10 minute break.", focusMinutes: 50, breakMinutes: 10 },
  { id: "ultradian", name: "Ultradian Cycle", description: "90 minutes focus, then a 20 minute break.", focusMinutes: 90, breakMinutes: 20 },
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
  { category: "University / Competitive", name: "UPSC", subjects: [] },
  { category: "University / Competitive", name: "CA", subjects: [] },
  { category: "University / Competitive", name: "GATE", subjects: [] },
  { category: "University / Competitive", name: "CAT", subjects: ["Quantitative Aptitude", "DILR", "VARC"] },
  { category: "International", name: "SAT", subjects: ["Math", "Reading", "Writing"] },
  { category: "International", name: "IB", subjects: [] },
  { category: "International", name: "A Levels", subjects: [] },
  { category: "School", name: "CBSE", subjects: [] },
  { category: "School", name: "ICSE", subjects: [] },
  { category: "School", name: "State Boards", subjects: [] },
  { category: "School", name: "Class 10 Boards", subjects: [] },
  { category: "School", name: "Class 12 Boards", subjects: [] },
  { category: "College", name: "Semester Exam", subjects: [] },
  { category: "College", name: "Internal Test", subjects: [] },
  { category: "Other", name: "Custom Exam", subjects: [] }
];

const onboardingSubjectPresets = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "Computer Science",
  "Economics",
  "Accountancy",
  "History",
  "Geography",
  "Political Science",
  "Business Studies"
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
const homeDistractionList = document.getElementById("home-distraction-list");
const homeTaskPreview = document.getElementById("home-task-preview");
const homeDaySummary = document.getElementById("home-day-summary");
const homeActiveCopy = document.getElementById("home-active-copy");
const homeSessionMode = document.getElementById("home-session-mode");
const homeSubjectSelect = document.getElementById("home-subject-select");
const homeTaskCount = document.getElementById("home-task-count");
const homeOpenPlan = document.getElementById("home-open-plan");
const homeAddSubject = document.getElementById("home-add-subject");
const homeNextExam = document.getElementById("home-next-exam");
const homeWeekPreview = document.getElementById("home-week-preview");
const homeTimelineTitle = document.getElementById("home-timeline-title");
const homeDayTimeline = document.getElementById("home-day-timeline");
const timelinePrevDay = document.getElementById("timeline-prev-day");
const timelineNextDay = document.getElementById("timeline-next-day");
const timelineTodayButton = document.getElementById("timeline-today");
const timelineDateInput = document.getElementById("timeline-date-input");
const openStudyLogModalButton = document.getElementById("open-study-log-modal");
const focusOpenStudyLogModalButton = document.getElementById("focus-open-study-log-modal");

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
const sessionDiscardButton = document.getElementById("session-discard");
const focusGoalProgress = document.getElementById("focus-goal-progress");
const focusSessionCount = document.getElementById("focus-session-count");
const openDistractionModalButton = document.getElementById("open-distraction-modal");
const focusDistractionModal = document.getElementById("focus-distraction-modal");
const closeFocusDistractionButton = document.getElementById("close-focus-distraction");
const focusDistractionForm = document.getElementById("focus-distraction-form");
const focusDistractionCategory = document.getElementById("focus-distraction-category");
const focusDistractionNote = document.getElementById("focus-distraction-note");
const studyLogModal = document.getElementById("study-log-modal");
const closeStudyLogModalButton = document.getElementById("close-study-log-modal");
const studyLogForm = document.getElementById("study-log-form");
const studyLogTitle = document.getElementById("study-log-title");
const studyLogSessionId = document.getElementById("study-log-session-id");
const studyLogSubject = document.getElementById("study-log-subject");
const studyLogDate = document.getElementById("study-log-date");
const studyLogStart = document.getElementById("study-log-start");
const studyLogEnd = document.getElementById("study-log-end");
const studyLogDuration = document.getElementById("study-log-duration");
const studyLogNote = document.getElementById("study-log-note");
const studyLogSubmit = document.getElementById("study-log-submit");
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
const subjectColorInput = document.getElementById("subject-color-input");
const intentionForm = document.getElementById("intention-form");
const intentionInput = document.getElementById("intention-input");
const intentionCount = document.getElementById("intention-count");

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskDateInput = document.getElementById("task-date-input");
const taskSubjectInput = document.getElementById("task-subject-input");
const taskPriorityInput = document.getElementById("task-priority-input");
const taskDurationInput = document.getElementById("task-duration-input");
const taskRepeatInput = document.getElementById("task-repeat-input");
const inlineTaskForm = document.getElementById("inline-task-form");
const inlineTaskInput = document.getElementById("inline-task-input");
const inlineTaskPriority = document.getElementById("inline-task-priority");
const inlineTaskDuration = document.getElementById("inline-task-duration");
const pendingTaskList = document.getElementById("pending-task-list");
const completedTaskList = document.getElementById("completed-task-list");
const openTaskModalButton = document.getElementById("open-task-modal");
const closeTaskModalButton = document.getElementById("close-task-modal");
const taskModal = document.getElementById("task-modal");
const completedTaskSummary = document.getElementById("completed-task-summary");
const completedTaskDetails = document.getElementById("completed-task-details");
const clearCompletedTasksButton = document.getElementById("clear-completed-tasks");
const planDateLabel = document.getElementById("plan-date-label");
const planTaskSummary = document.getElementById("plan-task-summary");
const planSummaryGoal = document.getElementById("plan-summary-goal");
const planSummaryPlanned = document.getElementById("plan-summary-planned");
const planSummaryDone = document.getElementById("plan-summary-done");
const planSummaryWorkload = document.getElementById("plan-summary-workload");
const planGoalProgress = document.getElementById("plan-goal-progress");
const planGoalCopy = document.getElementById("plan-goal-copy");
const planGoalBar = document.getElementById("plan-goal-bar");
const taskFilterChips = document.querySelectorAll(".task-filter-chip");
const taskSubjectFilter = document.getElementById("task-subject-filter");
const filterCountAll = document.getElementById("filter-count-all");
const filterCountHigh = document.getElementById("filter-count-high");
const filterCountToday = document.getElementById("filter-count-today");

const timerPresetsBar = document.getElementById("timer-presets-bar");
const chimeToggleBtn = document.getElementById("chime-toggle-btn");
const chimeBtnIcon = document.getElementById("chime-btn-icon");
const sessionTaskHud = document.getElementById("session-task-hud");
const taskHudStatus = document.getElementById("task-hud-status");
const taskHudCheckbox = document.getElementById("task-hud-checkbox");
const taskHudText = document.getElementById("task-hud-text");
const taskHudNote = document.getElementById("task-hud-note");
const taskHudNoteFeedback = document.getElementById("task-hud-note-feedback");

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
const settingsTabs = document.getElementById("settings-tabs");
const settingsSections = document.querySelectorAll("[data-settings-section]");
const settingsHeadingLabel = document.getElementById("settings-heading-label");
const settingsHeadingTitle = document.getElementById("settings-heading-title");
const profileAvatar = document.getElementById("profile-avatar");
const profileBanner = document.getElementById("profile-banner");
const profileDisplayName = document.getElementById("profile-display-name");
const profileUsername = document.getElementById("profile-username");
const profileBio = document.getElementById("profile-bio");
const profileJoinDate = document.getElementById("profile-join-date");
const accountEmail = document.getElementById("account-email");
const accountUsername = document.getElementById("account-username");
const accountCreated = document.getElementById("account-created");
const accountLastLogin = document.getElementById("account-last-login");
const profileCountry = document.getElementById("profile-country");
const profileTimezone = document.getElementById("profile-timezone");
const profileStudyDayStart = document.getElementById("profile-study-day-start");
const privacyProfile = document.getElementById("privacy-profile");
const privacyGroups = document.getElementById("privacy-groups");
const editProfileButton = document.getElementById("edit-profile-button");
const profileModal = document.getElementById("profile-modal");
const closeProfileModalButton = document.getElementById("close-profile-modal");
const profileForm = document.getElementById("profile-form");
const profileNameInput = document.getElementById("profile-name-input");
const profileUsernameInput = document.getElementById("profile-username-input");
const profileBioInput = document.getElementById("profile-bio-input");
const profileCountryInput = document.getElementById("profile-country-input");
const profileTimezoneInput = document.getElementById("profile-timezone-input");
const profileStudyDayStartInput = document.getElementById("profile-study-day-start-input");
const leaderboardVisibilityInput = document.getElementById("leaderboard-visibility-input");
const profileAvatarStyleInput = document.getElementById("profile-avatar-style-input");
const profileAvatarColorInput = document.getElementById("profile-avatar-color-input");
const profileAvatarPreview = document.getElementById("profile-avatar-preview");
const profileAvatarUpload = document.getElementById("profile-avatar-upload");
const profileAvatarRemove = document.getElementById("profile-avatar-remove");
const profileAvatarHelp = document.getElementById("profile-avatar-help");
const profileAvatarOptions = document.getElementById("profile-avatar-options");
const profileBannerPreview = document.getElementById("profile-banner-preview");
const profileBannerUpload = document.getElementById("profile-banner-upload");
const profileBannerRemove = document.getElementById("profile-banner-remove");
const profileBannerHelp = document.getElementById("profile-banner-help");
const onboardingModal = document.getElementById("onboarding-modal");
const onboardingStartButton = document.getElementById("onboarding-start");
const onboardingBasicsNext = document.getElementById("onboarding-basics-next");
const onboardingSkipBasics = document.getElementById("onboarding-skip-basics");
const onboardingExamOptions = document.getElementById("onboarding-exam-options");
const onboardingExamsNext = document.getElementById("onboarding-exams-next");
const onboardingSkipExams = document.getElementById("onboarding-skip-exams");
const onboardingSubjectOptions = document.getElementById("onboarding-subject-options");
const onboardingCustomSubjects = document.getElementById("onboarding-custom-subjects");
const onboardingSubjectsNext = document.getElementById("onboarding-subjects-next");
const onboardingSkipSubjects = document.getElementById("onboarding-skip-subjects");
const onboardingFinishSkip = document.getElementById("onboarding-finish-skip");
const onboardingProfileForm = document.getElementById("onboarding-profile-form");
const onboardingDisplayName = document.getElementById("onboarding-display-name");
const onboardingUsername = document.getElementById("onboarding-username");
const onboardingCountry = document.getElementById("onboarding-country");
const onboardingTimezone = document.getElementById("onboarding-timezone");
const onboardingStudyGoal = document.getElementById("onboarding-study-goal");
const onboardingAvatarStyle = document.getElementById("onboarding-avatar-style");
const onboardingAvatarColor = document.getElementById("onboarding-avatar-color");
const onboardingAvatarPreview = document.getElementById("onboarding-avatar-preview");
const onboardingAvatarUpload = document.getElementById("onboarding-avatar-upload");
const onboardingAvatarRemove = document.getElementById("onboarding-avatar-remove");
const onboardingAvatarHelp = document.getElementById("onboarding-avatar-help");
const onboardingAvatarOptions = document.getElementById("onboarding-avatar-options");
const onboardingBio = document.getElementById("onboarding-bio");

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
const groupChatMessages = document.getElementById("group-chat-messages");
const groupChatForm = document.getElementById("group-chat-form");
const groupChatInput = document.getElementById("group-chat-input");
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
let isCompletingSession = false;
let activeSessionRecoveryPromptToken = 0;
const discardedActiveSessionIds = new Set();
let appData = createDefaultData();
let selectedExamPreset = null;
let challengeDraft = createChallengeDraft();

function createDefaultData() {
  const subjects = [];

  return {
    date: getTodayKey(),
    theme: "dark",
    accentColor: null,
    sidebarCollapsed: false,
    studySeconds: 0,
    goalHours: null,
    streak: 0,
    focusIntention: "",
    selectedSubjectId: null,
    sessionState: "pre-session",
    currentSessionDraft: { goal: "" },
    pendingSessionReview: null,
    timerModeIndex: 0,
    customFocusMinutes: 30,
    customBreakMinutes: 0,
    selectedHistoryRange: "today",
    selectedTimelineDate: getTodayKey(),
    selectedAnalyticsRange: "today",
    selectedLeaderboardRange: "today",
    selectedExamId: null,
    selectedExamTab: "overview",
    plannerMonth: new Date().getMonth(),
    plannerYear: new Date().getFullYear(),
    selectedPlannerDate: getTodayKey(),
    activeSession: null,
    tasks: [],
    subjects,
    sessions: [],
    dailyHistory: {},
    plannerItems: [],
    exams: [],
    distractions: [],
    studyCircles: [],
    selectedCircleId: null,
    groupsView: "list",
    selectedCircleTab: "overview",
    selectedRankingRange: "today",
    selectedChallengeStatus: "active",
    selectedChallengeId: null,
    activeRoomId: null
  };
}

function getSubjectColorValue(subjectOrKey) {
  const key = typeof subjectOrKey === "string" ? subjectOrKey : subjectOrKey.colorKey;
  const color = subjectPalette.find(function (item) { return item.key === key; }) || subjectPalette[0];
  return color.value;
}

function getNextSubjectColorKey(subjects) {
  const subjectList = Array.isArray(subjects) ? subjects : appData.subjects;
  const used = subjectList.map(function (subject) { return subject.colorKey; });
  const openColor = subjectPalette.find(function (color) { return !used.includes(color.key); });
  return (openColor || subjectPalette[subjectList.length % subjectPalette.length]).key;
}

function getInitials(name) {
  return (name || "SM")
    .split(" ")
    .map(function (part) { return part[0]; })
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarPreset(style, color) {
  return avatarPresets.find(function (preset) {
    return preset.style === style && preset.color === color;
  }) || avatarPresets[0];
}

function renderGeneratedAvatar(element, displayName, style, color) {
  if (!element) return;
  const preset = getAvatarPreset(style, color);
  element.innerHTML = "";
  element.textContent = preset.style === "initials" ? getInitials(displayName) : "";
  element.dataset.avatarStyle = preset.style;
  element.style.background = `linear-gradient(135deg, ${getSubjectColorValue(preset.color)}, var(--accent))`;

  if (preset.style === "spark") {
    element.innerHTML = `<span class="avatar-symbol">✦</span>`;
  }
  if (preset.style === "orbit") {
    element.innerHTML = `<span class="avatar-symbol orbit-symbol"></span>`;
  }
}

function renderProfileAvatar(element) {
  if (!element) return;
  if (studyMateUser.avatarUrl) {
    element.innerHTML = `<img src="${studyMateUser.avatarUrl}" alt="">`;
    element.style.background = "var(--surface-soft)";
    element.dataset.avatarStyle = "photo";
    return;
  }
  renderGeneratedAvatar(element, studyMateUser.displayName, studyMateUser.avatarStyle || "initials", studyMateUser.avatarColor || "teal");
}

function renderProfileBanner(element) {
  if (!element) return;
  element.style.backgroundImage = studyMateUser.bannerUrl ? `url("${studyMateUser.bannerUrl}")` : "";
  element.classList.toggle("has-image", Boolean(studyMateUser.bannerUrl));
}

function formatReadableDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { timeZone: getAccountTimezone(), month: "short", day: "numeric", year: "numeric" });
}

function formatVisibility(value) {
  const labels = {
    public: "Public",
    friends: "Friends only",
    private: "Private",
    members: "Members only",
    groups: "Groups only"
  };
  return labels[value] || "Private";
}

function formatListPreview(items, emptyLabel) {
  const values = (items || []).filter(Boolean);
  if (values.length === 0) return emptyLabel;
  if (values.length <= 3) return values.join(", ");
  return `${values.slice(0, 3).join(", ")} +${values.length - 3}`;
}

function parseCommaList(value) {
  return String(value || "")
    .split(",")
    .map(function (item) { return item.trim(); })
    .filter(Boolean);
}

function getProfileExamNames() {
  const fromWorkspace = appData.exams.map(function (exam) { return exam.name; });
  return Array.from(new Set(fromWorkspace));
}

function getTotalStudySeconds() {
  return appData.sessions.reduce(function (total, session) {
    return total + Number(session.durationSeconds || 0);
  }, 0);
}

function getFavouriteSubjectName() {
  const totals = getSubjectTotalsFromSessions(appData.sessions);
  const top = getTopSubject(totals);
  if (top) return top.name;
  return appData.subjects[0] ? appData.subjects[0].name : "-";
}

function getProfileLongestStreak() {
  const entries = Object.keys(appData.dailyHistory || {}).sort().map(function (key) {
    return appData.dailyHistory[key];
  });
  return Math.max(getCurrentStudyStreak(), getLongestEntryStreak(entries));
}

function createSubjectDot(subject) {
  const dot = document.createElement("span");
  dot.className = "subject-dot";
  dot.style.background = getSubjectColorValue(subject);
  return dot;
}

function createSubject(name, colorKey) {
  return {
    id: createId(),
    name,
    colorKey: colorKey || getNextSubjectColorKey(),
    seconds: 0
  };
}

function getAccountTimezone() {
  const aliases = { IST: "Asia/Kolkata", GMT: "UTC", UTC: "UTC" };
  const timezone = aliases[String(studyMateUser.timezone || "Asia/Kolkata").toUpperCase()] || studyMateUser.timezone || "Asia/Kolkata";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch (error) {
    return "Asia/Kolkata";
  }
}

function getStudyDayStartMinutes() {
  const value = studyMateUser.studyDayStartTime || "00:00";
  const parts = value.split(":").map(Number);
  const hours = Number.isInteger(parts[0]) ? parts[0] : 0;
  const minutes = Number.isInteger(parts[1]) ? parts[1] : 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;
  return hours * 60 + minutes;
}

function getLocalDateParts(dateValue = new Date()) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: getAccountTimezone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  const parts = {};
  formatter.formatToParts(date).forEach(function (part) {
    parts[part.type] = part.value;
  });
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute)
  };
}

function formatDateKeyParts(parts) {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function getTodayKey() {
  return getStudyDateKey(new Date());
}

function getStudyDateKey(dateValue) {
  const parts = getLocalDateParts(dateValue);
  const localMinutes = parts.hour * 60 + parts.minute;
  if (localMinutes >= getStudyDayStartMinutes()) return formatDateKeyParts(parts);
  return addDaysToDate(formatDateKeyParts(parts), -1);
}

function addDaysToDate(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function normalizeUtcTimestamp(value) {
  if (!value) return value;
  const text = String(value);
  if (/[zZ]$|[+-]\d\d:\d\d$/.test(text)) return text.replace(/z$/, "Z");
  return `${text}Z`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function studyMateApi(path, options = {}) {
  const response = await fetch(`/api/${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(function () { return {}; });
  if (!response.ok) {
    const error = new Error(data.error || "StudyMate API request failed.");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function getLegacyBrowserData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData) {
    return removeTransientTimerState(parseSavedData(savedData));
  }

  return removeTransientTimerState(loadOlderData());
}

function getAccountBrowserData() {
  const savedData = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  return savedData ? removeTransientTimerState(parseSavedData(savedData)) : createDefaultData();
}

function removeTransientTimerState(data) {
  const cleaned = {
    ...createDefaultData(),
    ...(data || {})
  };

  delete cleaned.activeSession;
  delete cleaned.pendingSessionReview;
  cleaned.sessionState = "pre-session";
  cleaned.currentSessionDraft = { goal: "" };

  return cleaned;
}

function cleanupLegacyTimerStorage() {
  LEGACY_TIMER_STORAGE_KEYS.forEach(function (key) {
    localStorage.removeItem(key);
  });

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(`${STORAGE_KEY}:user:`)) continue;

    const stored = localStorage.getItem(key);
    if (!stored) continue;

    try {
      const parsed = JSON.parse(stored);
      if (!parsed.activeSession && !parsed.pendingSessionReview && parsed.sessionState === "pre-session") continue;
      localStorage.setItem(key, JSON.stringify(removeTransientTimerState(parsed)));
    } catch (error) {
      console.warn(`Skipped unreadable StudyMate cache: ${key}`);
    }
  }
}

function hasStoredLegacyData() {
  return Boolean(localStorage.getItem(STORAGE_KEY))
    || OLD_STORAGE_KEYS.some(function (key) { return Boolean(localStorage.getItem(key)); });
}

function hasLegacyPersonalData(data) {
  if (!data) return false;
  return ["tasks", "subjects", "sessions", "plannerItems", "exams", "distractions"].some(function (key) {
    return Array.isArray(data[key]) && data[key].length > 0;
  });
}

function isLegacyImportRecoveryMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("legacyImport") === "1" || localStorage.getItem("studymate-show-legacy-import") === "true";
}

function showLegacyImportIfNeeded(shouldShow) {
  if (!legacyImportBanner) return;
  const canShowRecoveryBanner = isLegacyImportRecoveryMode()
    && hasStoredLegacyData()
    && hasLegacyPersonalData(getLegacyBrowserData());
  legacyImportBanner.hidden = !(shouldShow && canShowRecoveryBanner);
}

async function loadData() {
  cleanupLegacyTimerStorage();
  appData = getAccountBrowserData();
  normalizeData();
  resetTransientFocusState();

  try {
    const response = await studyMateApi("app-data");
    databaseLoaded = true;
    if (response.profile) updateProfileState(response.profile);
    appDataRevision = response.appData ? Number(response.appData._rev || 0) : 0;
    if (response.appData) {
      isHydratingFromServer = true;
      appData = removeTransientTimerState({
        ...createDefaultData(),
        ...response.appData
      });
      normalizeData();
      appDataBase = JSON.parse(JSON.stringify(getPersonalAppDataPayload()));
      showLegacyImportIfNeeded(false);
      isHydratingFromServer = false;
    } else {
      appData = createDefaultData();
      normalizeData();
      appDataBase = JSON.parse(JSON.stringify(getPersonalAppDataPayload()));
      showLegacyImportIfNeeded(!response.hasData);
    }
  } catch (error) {
    databaseLoaded = false;
    console.warn(error.message);
  }

  if (appData.date !== getTodayKey()) resetDailyData();
  await loadActiveFocusSession();
  applyAccountPreferencesToAppData();
  appData.streak = getCurrentStudyStreak();
  syncDailyHistory(getTodayKey());
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(removeTransientTimerState(appData)));

  if (appData.activeSession && appData.sessionState !== "paused") {
    resumeSessionTimer();
  }
}

function resetTransientFocusState() {
  appData.activeSession = null;
  appData.pendingSessionReview = null;
  appData.sessionState = "pre-session";
  appData.currentSessionDraft = { goal: "" };
  activeSessionRecoveryPromptToken += 1;
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  document.title = "StudyMate";
}

function normalizeActiveFocusSession(activeSession) {
  if (!activeSession) return null;
  return {
    id: activeSession.id || createId(),
    mode: activeSession.mode || "Stopwatch",
    modeId: activeSession.modeId || "stopwatch",
    phase: activeSession.phase || "focus",
    subjectId: activeSession.subjectId || "",
    subjectName: activeSession.subjectName || getSubjectName(activeSession.subjectId),
    goal: activeSession.goal || "",
    roomId: activeSession.roomId || null,
    startedAt: normalizeUtcTimestamp(activeSession.startedAt) || new Date().toISOString(),
    pausedAt: normalizeUtcTimestamp(activeSession.pausedAt) || null,
    totalPausedSeconds: Number(activeSession.totalPausedSeconds || 0),
    state: activeSession.state === "paused" ? "paused" : "running",
    elapsedSeconds: Number(activeSession.elapsedSeconds || 0),
    focusSeconds: activeSession.focusSeconds || null,
    breakSeconds: Number(activeSession.breakSeconds || 0),
    updatedAt: normalizeUtcTimestamp(activeSession.updatedAt || activeSession.pausedAt || activeSession.startedAt) || new Date().toISOString()
  };
}

function isActiveSessionStale(activeSession) {
  if (!activeSession) return false;
  const updatedAt = new Date(activeSession.updatedAt || activeSession.pausedAt || activeSession.startedAt).getTime();
  if (Number.isNaN(updatedAt)) return false;
  return Date.now() - updatedAt > ACTIVE_SESSION_STALE_MS;
}

function getSessionElapsedAt(activeSession, dateValue) {
  if (!activeSession) return 0;
  const startedAt = new Date(activeSession.startedAt).getTime();
  const endAt = new Date(dateValue || Date.now()).getTime();
  const totalPaused = Number(activeSession.totalPausedSeconds || 0);
  if (Number.isNaN(startedAt) || Number.isNaN(endAt)) return 0;
  return Math.max(0, Math.floor((endAt - startedAt) / 1000) - totalPaused);
}

function freezeStaleActiveSession(activeSession) {
  const freezeAt = activeSession.updatedAt || activeSession.pausedAt || activeSession.startedAt || new Date().toISOString();
  const elapsedSeconds = getSessionElapsedAt(activeSession, freezeAt);
  const adjustedStartedAt = new Date(Date.now() - elapsedSeconds * 1000).toISOString();
  return {
    ...activeSession,
    startedAt: adjustedStartedAt,
    pausedAt: new Date().toISOString(),
    totalPausedSeconds: 0,
    elapsedSeconds,
    state: "paused"
  };
}

function applyBackendActiveSession(activeSession) {
  confirmedActiveSessionId = activeSession ? activeSession.id : null;
  if (activeSession && discardedActiveSessionIds.has(activeSession.id)) {
    appData.activeSession = null;
    appData.sessionState = "pre-session";
    return false;
  }

  if (isActiveSessionStale(activeSession)) {
    appData.activeSession = freezeStaleActiveSession(activeSession);
    appData.sessionState = "paused";
    updateAllDisplays();
    showActiveSessionRecoveryPrompt();
    return Boolean(appData.activeSession);
  }

  appData.activeSession = activeSession;
  appData.sessionState = appData.activeSession
    ? (appData.activeSession.state === "paused" ? "paused" : appData.activeSession.phase === "break" ? "break" : "active")
    : "pre-session";

  return Boolean(appData.activeSession);
}

async function loadActiveFocusSession() {
  if (!databaseLoaded) return;
  resetTransientFocusState();
  try {
    const response = await studyMateApi("focus/active");
    const activeSession = normalizeActiveFocusSession(response.activeSession);
    applyBackendActiveSession(activeSession);
  } catch (error) {
    console.warn(error.message);
  }
}

function applyAccountPreferencesToAppData() {
  if (studyMateUser.preferredTheme === "light") {
    appData.theme = "light";
  } else if (studyMateUser.preferredTheme === "dark") {
    appData.theme = "dark";
  } else {
    var localTheme = null;
    try {
      localTheme = localStorage.getItem("studymate-theme");
    } catch (e) {}
    appData.theme = (localTheme === "light") ? "light" : "dark";
  }
}

async function loadGroups() {
  if (!databaseLoaded) {
    appData.studyCircles = [];
    return;
  }

  try {
    const response = await studyMateApi("groups");
    appData.studyCircles = (response.groups || []).map(normalizeCircle);
  } catch (error) {
    console.warn(error.message);
    appData.studyCircles = [];
  }
}

function upsertStudyCircle(group) {
  const normalized = normalizeCircle(group);
  const index = appData.studyCircles.findIndex(function (circle) {
    return String(circle.id) === String(normalized.id);
  });

  if (index >= 0) {
    appData.studyCircles[index] = normalized;
  } else {
    appData.studyCircles.push(normalized);
  }

  return normalized;
}

function updateProfileState(profile) {
  studyMateUser.displayName = profile.displayName || studyMateUser.displayName;
  studyMateUser.username = profile.username || studyMateUser.username;
  studyMateUser.email = profile.email || studyMateUser.email;
  studyMateUser.bio = profile.bio || "";
  studyMateUser.avatarUrl = profile.avatarUrl || "";
  studyMateUser.bannerUrl = profile.bannerUrl || "";
  studyMateUser.avatarStyle = profile.avatarStyle || "initials";
  studyMateUser.avatarColor = profile.avatarColor || "teal";
  studyMateUser.onboardingCompleted = Boolean(profile.onboardingCompleted);
  studyMateUser.country = profile.country || "";
  studyMateUser.timezone = profile.timezone || "Asia/Kolkata";
  studyMateUser.studyDayStartTime = profile.studyDayStartTime || "00:00";
  studyMateUser.preferredTheme = profile.preferredTheme || "system";
  studyMateUser.profileVisibility = profile.profileVisibility || "private";
  studyMateUser.groupVisibility = profile.groupVisibility || "members";
  studyMateUser.leaderboardVisibility = profile.leaderboardVisibility || "public";
  studyMateUser.createdAt = profile.createdAt || studyMateUser.createdAt || "";
  studyMateUser.lastLoginAt = profile.lastLoginAt || studyMateUser.lastLoginAt || "";
}

function renderProfile() {
  if (!profileAvatar) return;
  renderProfileBanner(profileBanner);
  renderProfileBanner(profileBannerPreview);
  renderProfileAvatar(profileAvatar);
  renderProfileAvatar(profileAvatarPreview);
  renderProfileAvatar(onboardingAvatarPreview);
  profileDisplayName.textContent = studyMateUser.displayName || "StudyMate learner";
  profileUsername.textContent = `@${studyMateUser.username} - ${studyMateUser.email}`;
  profileBio.textContent = studyMateUser.bio || "No bio yet.";
  profileJoinDate.textContent = studyMateUser.createdAt ? `Joined ${formatReadableDate(studyMateUser.createdAt)}` : "";
  accountEmail.textContent = studyMateUser.email || "-";
  accountUsername.textContent = `@${studyMateUser.username || "-"}`;
  accountCreated.textContent = formatReadableDate(studyMateUser.createdAt);
  accountLastLogin.textContent = studyMateUser.lastLoginAt ? formatReadableDate(studyMateUser.lastLoginAt) : "Not recorded";
  profileCountry.textContent = studyMateUser.country || "Not set";
  profileTimezone.textContent = studyMateUser.timezone || "Asia/Kolkata";
  if (profileStudyDayStart) profileStudyDayStart.textContent = studyMateUser.studyDayStartTime || "00:00";
  if (privacyProfile) privacyProfile.textContent = formatVisibility(studyMateUser.profileVisibility);
  if (privacyGroups) privacyGroups.textContent = formatVisibility(studyMateUser.groupVisibility);
  if (leaderboardVisibilityInput) leaderboardVisibilityInput.value = studyMateUser.leaderboardVisibility === "private" ? "private" : "public";
}

async function saveProfilePayload(payload) {
  const response = await studyMateApi("profile", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  updateProfileState(response.profile);
  if (response.profile.preferredTheme && response.profile.preferredTheme !== "system") appData.theme = response.profile.preferredTheme;
  applyAppearance();
  saveData();
  renderProfile();
  updateHome();
  return response.profile;
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
      migrated.subjects = parsed.subjects.map(function (subject, index) {
        return {
          id: subject.id || createId(),
          name: subject.name || "Subject",
          colorKey: subject.colorKey || subjectPalette[index % subjectPalette.length].key,
          seconds: Number(subject.seconds || 0)
        };
      });
      migrated.selectedSubjectId = migrated.subjects[0].id;
    }

    migrated.studyCircles = [];

    return migrated;
  } catch (error) {
    return createDefaultData();
  }
}

function normalizeData() {
  if (!Array.isArray(appData.tasks)) appData.tasks = [];
  if (!Array.isArray(appData.subjects)) appData.subjects = [];
  if (!Array.isArray(appData.sessions)) appData.sessions = [];
  if (!appData.dailyHistory || typeof appData.dailyHistory !== "object") appData.dailyHistory = {};
  if (!Array.isArray(appData.plannerItems)) appData.plannerItems = [];
  if (!Array.isArray(appData.exams)) appData.exams = [];
  if (!Array.isArray(appData.distractions)) appData.distractions = [];
  if (!Array.isArray(appData.studyCircles)) appData.studyCircles = [];

  if (studyMateUser.preferredTheme === "light") {
    appData.theme = "light";
  } else if (studyMateUser.preferredTheme === "dark") {
    appData.theme = "dark";
  } else if (appData.theme !== "light" && appData.theme !== "dark") {
    appData.theme = "dark";
  }
  appData.accentColor = null;

  appData.studySeconds = Number(appData.studySeconds) || 0;
  appData.goalHours = appData.goalHours === null || appData.goalHours === "" || typeof appData.goalHours === "undefined"
    ? null
    : Number(appData.goalHours) || null;
  appData.streak = Number(appData.streak) || 0;
  appData.focusIntention = appData.focusIntention || "";
  appData.sessionState = ["pre-session", "active", "paused", "break", "complete"].includes(appData.sessionState) ? appData.sessionState : "pre-session";
  appData.currentSessionDraft = appData.currentSessionDraft && typeof appData.currentSessionDraft === "object" ? appData.currentSessionDraft : { goal: "" };
  appData.currentSessionDraft.goal = appData.currentSessionDraft.goal || "";
  appData.pendingSessionReview = appData.pendingSessionReview && typeof appData.pendingSessionReview === "object" ? appData.pendingSessionReview : null;
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
  appData.selectedTimelineDate = appData.selectedTimelineDate || getTodayKey();
  appData.selectedSubjectId = getSubjectById(appData.selectedSubjectId)
    ? appData.selectedSubjectId
    : appData.subjects[0] ? appData.subjects[0].id : "";
  appData.subjects = appData.subjects.map(function (subject, index) {
    return {
      ...subject,
      colorKey: subject.colorKey || subjectPalette[index % subjectPalette.length].key
    };
  });
  appData.tasks = appData.tasks.map(normalizeTask);
  appData.sessions = appData.sessions.map(normalizeStudySession);
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

function normalizeStudySession(session) {
  const startedAt = normalizeUtcTimestamp(session.startedAt) || new Date().toISOString();
  const endedAt = normalizeUtcTimestamp(session.endedAt) || startedAt;
  return {
    ...session,
    id: session.id || createId(),
    date: session.date || getStudyDateKey(startedAt),
    subjectId: session.subjectId || "",
    subjectName: session.subjectName || getSubjectName(session.subjectId),
    mode: session.mode || "Timer",
    startedAt,
    endedAt,
    durationSeconds: Number(session.durationSeconds || session.studySeconds || 0),
    sourceType: session.sourceType === "manual" ? "manual" : "tracked",
    wasEdited: Boolean(session.wasEdited),
    originalDurationSeconds: session.originalDurationSeconds || null,
    editedAt: session.editedAt || null,
    reviewNote: session.reviewNote || session.note || ""
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
      goalHours: entry.goalHours === null || typeof entry.goalHours === "undefined" ? null : Number(entry.goalHours) || null,
      distractions: Array.isArray(entry.distractions) ? entry.distractions : []
    };
  });
  return normalized;
}

function normalizeDistraction(entry) {
  const timestamp = normalizeUtcTimestamp(entry.timestamp) || new Date().toISOString();
  return {
    id: entry.id || createId(),
    category: entry.category || "Other",
    reason: entry.reason || entry.note || "",
    time: entry.time || formatClockTime(timestamp),
    date: entry.date || getStudyDateKey(timestamp),
    timestamp,
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
    date: exam.date || "",
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
    messages: Array.isArray(circle.messages) ? circle.messages.map(normalizeGroupMessage) : [],
    role: circle.role || "member",
    ownerId: circle.ownerId || null,
    createdAt: circle.createdAt || new Date().toISOString()
  };
}

function normalizeMembers(members) {
  const normalized = Array.isArray(members) && members.length > 0 ? members : [];

  return normalized.map(function (member) {
    return {
      id: member.id || createId(),
      name: member.name || "Student",
      status: member.status || "Paused",
      subject: member.subject || member.currentSubject || "General Study",
      totalSeconds: Number(member.totalSeconds || member.studySeconds || 0),
      streak: Number(member.streak || 0),
      tasksCompleted: Number(member.tasksCompleted || 0),
      role: member.role || "member"
    };
  });
}

function normalizeGroupMessage(message) {
  return {
    id: message.id || createId(),
    groupId: message.groupId || null,
    userId: message.userId || null,
    message: message.message || "",
    createdAt: message.createdAt || new Date().toISOString(),
    user: message.user || {}
  };
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
  const activeMembers = members.length > 0 ? members : [];

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
  const studySeconds = getSecondsFromSessions(sessions);

  return {
    studySeconds,
    sessions: sessions.length,
    subjectTotals,
    tasksCompleted: completedTasks.length,
    tasksPlanned: tasks.length,
    goalHours: appData.goalHours || null,
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
  syncDailyHistory(getTodayKey());
}

function saveData() {
  appData.streak = getCurrentStudyStreak();
  syncDailyHistory(getTodayKey());
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(removeTransientTimerState(appData)));
  queueDatabaseSync();
}

function getPersonalAppDataPayload() {
  // UserAppState still carries legacy app data during the transition; shared collaboration data stays out of it.
  const payload = {
    ...appData,
    studyCircles: [],
    selectedCircleId: null,
    groupsView: "list"
  };
  delete payload.theme;
  delete payload.activeSession;
  delete payload.pendingSessionReview;
  payload.sessionState = "pre-session";
  payload._rev = appDataRevision;
  return payload;
}

function getActiveFocusPayload() {
  if (!appData.activeSession) return null;
  if (discardedActiveSessionIds.has(appData.activeSession.id)) return null;
  const subject = getSubjectById(appData.activeSession.subjectId);
  return {
    ...appData.activeSession,
    subjectName: subject ? subject.name : appData.activeSession.subjectName || "General Study",
    state: appData.sessionState === "paused" ? "paused" : "running"
  };
}

function canWriteActiveFocusSession(reason) {
  return ["start", "pause", "resume", "break",].includes(reason);
}

async function saveActiveFocusSession(reason) {
  if (!canWriteActiveFocusSession(reason)) return null;
  const payload = getActiveFocusPayload();
  if (!payload || !databaseLoaded) return null;
  activeFocusBusy += 1;
  try {
    const response = await studyMateApi("focus/active", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    appData.activeSession = normalizeActiveFocusSession(response.activeSession);
    confirmedActiveSessionId = appData.activeSession ? appData.activeSession.id : null;
    return appData.activeSession;
  } catch (error) {
    if (error.status === 409 && error.data && error.data.code === "session_in_progress") {
      adoptRunningSession(error.data.activeSession);
      return appData.activeSession;
    }
    console.warn(error.message);
    return null;
  } finally {
    activeFocusBusy -= 1;
  }
}

function adoptRunningSession(activeSession) {
  const running = normalizeActiveFocusSession(activeSession);
  if (!running) return;
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  applyBackendActiveSession(running);
  if (appData.activeSession && appData.sessionState !== "paused") resumeSessionTimer();
  updateAllDisplays();
  window.alert("Another focus session is already running (started in another tab or device), so StudyMate switched to it. Only one session can run at a time.");
}

// Keep the running timer the same in every open tab, and stop a tab from showing a session that already ended elsewhere.
async function syncActiveFocusFromServer() {
  if (typeof document !== "undefined" && document.hidden) return;
  if (!databaseLoaded || activeFocusBusy > 0 || isCompletingSession || appData.pendingSessionReview) return;

  try {
    const response = await studyMateApi("focus/active");
    if (activeFocusBusy > 0 || isCompletingSession || appData.pendingSessionReview) return;
    const server = normalizeActiveFocusSession(response.activeSession);
    const local = appData.activeSession;

    if (!server) {
      if (local && confirmedActiveSessionId === local.id) {
        clearInterval(sessionTimerId);
        sessionTimerId = null;
        appData.activeSession = null;
        appData.sessionState = "pre-session";
        confirmedActiveSessionId = null;
        document.title = "StudyMate";
        updateAllDisplays();
      }
      return;
    }

    if (discardedActiveSessionIds.has(server.id)) return;
    const changed = !local
      || local.id !== server.id
      || local.phase !== server.phase
      || local.state !== server.state
      || Number(local.totalPausedSeconds || 0) !== Number(server.totalPausedSeconds || 0)
      || (local.pausedAt || null) !== (server.pausedAt || null);
    if (!changed) return;

    clearInterval(sessionTimerId);
    sessionTimerId = null;
    applyBackendActiveSession(server);
    if (appData.activeSession && appData.sessionState !== "paused") resumeSessionTimer();
    updateAllDisplays();
  } catch (error) {
    console.warn(error.message);
  }
}

async function clearActiveFocusSession() {
  if (!databaseLoaded) return;
  activeFocusBusy += 1;
  try {
    await studyMateApi("focus/active", { method: "DELETE" });
  } catch (error) {
    console.warn(error.message);
  } finally {
    activeFocusBusy -= 1;
  }
}

async function discardActiveSession(shouldConfirm = true) {
    if (shouldConfirm) {
        const confirmed = window.confirm(
            "Discard this unfinished session? No study time will be saved."
        );

        if (!confirmed) return;
    }

    const discardedId = appData.activeSession?.id;

    try {
        await studyMateApi("focus/active", {
            method: "DELETE"
        });

        // Invalidate any delayed recovery prompt.
        activeSessionRecoveryPromptToken += 1;

        if (discardedId) {
            discardedActiveSessionIds.add(discardedId);
        }

        // Destroy every local reference BEFORE saving.
        appData.activeSession = null;
        appData.pendingSessionReview = null;
        appData.sessionState = "pre-session";

        clearInterval(sessionTimerId);
        sessionTimerId = null;

        document.title = "StudyMate";

        saveData();
        updateAllDisplays();
    } catch (error) {
        console.warn(error.message);
    }
}

async function resumeRecoveredActiveSession() {
    const recoveredSessionId = appData.activeSession?.id;

    if (!recoveredSessionId) return;

    if (discardedActiveSessionIds.has(recoveredSessionId)) {
        appData.activeSession = null;
        appData.sessionState = "pre-session";
        updateAllDisplays();
        return;
    }

    try {
        // Re-check the backend before restoring anything.
        const response = await studyMateApi("focus/active");
        const backendSession = response?.activeSession ?? null;

        // The session no longer exists on the backend.
        if (
            !backendSession ||
            backendSession.id !== recoveredSessionId ||
            discardedActiveSessionIds.has(recoveredSessionId)
        ) {
            appData.activeSession = null;
            appData.sessionState = "pre-session";
            document.title = "StudyMate";
            updateAllDisplays();
            return;
        }

        // Only now restore the confirmed backend session.
        appData.activeSession =
            normalizeActiveFocusSession(backendSession);

        appData.activeSession.pausedAt = null;
        appData.activeSession.state = "running";

        appData.sessionState =
            appData.activeSession.phase === "break"
                ? "break"
                : "active";

        // This is now a verified explicit resume.
        await saveActiveFocusSession("resume");

        resumeSessionTimer();
        updateAllDisplays();
    } catch (error) {
        console.warn(error.message);

        appData.activeSession = null;
        appData.sessionState = "pre-session";
        document.title = "StudyMate";
        updateAllDisplays();
    }
}

function showActiveSessionRecoveryPrompt() {
  const promptToken = activeSessionRecoveryPromptToken;
  window.setTimeout(function () {
    if (promptToken !== activeSessionRecoveryPromptToken) return;
    if (!appData.activeSession || !isActiveSessionStale(appData.activeSession)) return;
    const shouldResume = window.confirm("Unfinished session found. Press OK to resume it, or Cancel to discard it without saving study time.");
    if (shouldResume) {
      resumeRecoveredActiveSession();
    } else {
      discardActiveSession(false);
    }
  }, 0);
}

async function completeActiveFocusSession(review) {
  if (!databaseLoaded || !review) return null;
  try {
    const response = await studyMateApi("focus/complete", {
      method: "POST",
      body: JSON.stringify(review)
    });
    return response.session || null;
  } catch (error) {
    console.warn(error.message);
    return null;
  }
}

// --- app data sync with save guard ---
const MERGE_LIST_KEYS = ["tasks", "subjects", "sessions", "plannerItems", "exams", "distractions"];
const MERGE_PREPEND_KEYS = ["sessions", "distractions"];
// What you are looking at (open tab, selected date...) stays per-tab and is never taken from another tab.
const MERGE_LOCAL_UI_KEYS = ["date", "selectedSubjectId", "selectedHistoryRange", "selectedTimelineDate", "selectedAnalyticsRange", "selectedLeaderboardRange", "selectedExamId", "selectedExamTab", "plannerMonth", "plannerYear", "selectedPlannerDate", "selectedCircleTab", "selectedRankingRange", "selectedChallengeStatus", "selectedChallengeId", "activeRoomId", "sidebarCollapsed", "timerModeIndex"];
const MERGE_SKIP_KEYS = ["_rev", "activeSession", "pendingSessionReview", "sessionState", "currentSessionDraft", "studyCircles", "selectedCircleId", "groupsView", "theme", "dailyHistory"];

function mergeListById(local, base, server, prepend) {
  const baseJson = new Map(base.map(function (item) { return [String(item.id), JSON.stringify(item)]; }));
  const localIds = new Set(local.map(function (item) { return String(item.id); }));
  const result = new Map(server.map(function (item) { return [String(item.id), item]; }));
  const added = [];

  local.forEach(function (item) {
    const id = String(item.id);
    const isNew = !baseJson.has(id);
    const isEdited = !isNew && JSON.stringify(item) !== baseJson.get(id);
    if (!isNew && !isEdited) return; // unchanged here, so the server's copy stands
    if (result.has(id)) result.set(id, item);
    else added.push(item);
  });

  // Things deleted in this tab stay deleted.
  baseJson.forEach(function (json, id) {
    if (!localIds.has(id)) result.delete(id);
  });

  const kept = Array.from(result.values());
  return prepend ? added.concat(kept) : kept.concat(added);
}

function mergeAppData(local, base, server) {
  const safeBase = base || {};
  const merged = { ...server };

  Object.keys(local).forEach(function (key) {
    if (MERGE_LOCAL_UI_KEYS.includes(key)) {
      merged[key] = local[key];
      return;
    }
    if (MERGE_SKIP_KEYS.includes(key) || MERGE_LIST_KEYS.includes(key)) return;
    if (JSON.stringify(local[key]) !== JSON.stringify(safeBase[key])) merged[key] = local[key];
  });

  MERGE_LIST_KEYS.forEach(function (key) {
    merged[key] = mergeListById(
      Array.isArray(local[key]) ? local[key] : [],
      Array.isArray(safeBase[key]) ? safeBase[key] : [],
      Array.isArray(server[key]) ? server[key] : [],
      MERGE_PREPEND_KEYS.includes(key)
    );
  });

  merged.dailyHistory = { ...(local.dailyHistory || {}), ...(server.dailyHistory || {}) };
  return merged;
}

function mergeServerChangesIntoLocal(serverData) {
  const merged = mergeAppData(getPersonalAppDataPayload(), appDataBase, serverData);
  appDataRevision = Number(serverData._rev || 0);
  Object.keys(merged).forEach(function (key) {
    if (MERGE_SKIP_KEYS.includes(key) && key !== "dailyHistory") return;
    appData[key] = merged[key];
  });
  appData.tasks = appData.tasks.map(normalizeTask);
  appData.sessions = appData.sessions.map(normalizeStudySession);
  appData.distractions = appData.distractions.map(normalizeDistraction);
  appData.plannerItems = appData.plannerItems.map(normalizePlannerItem);
  appData.exams = appData.exams.map(normalizeExam);
  if (appData.selectedExamId && typeof getExamById === "function" && !getExamById(appData.selectedExamId)) {
    appData.selectedExamId = null;
    if (typeof examListView !== "undefined" && examListView) examListView.hidden = false;
    if (typeof examWorkspace !== "undefined" && examWorkspace) examWorkspace.hidden = true;
  }
  if (typeof renderTasks === "function") renderTasks();
  if (typeof renderDistractions === "function") renderDistractions();
  if (typeof updateAllDisplays === "function") updateAllDisplays();
}

function reloadAfterConflict() {
  appDataSyncBlocked = true;
  window.clearTimeout(syncTimerId);
  window.alert("StudyMate was updated in another tab or device and the changes could not be combined automatically. It will reload now to show your latest data.");
  window.location.reload();
}

async function handleAppDataConflict() {
  appDataConflictRetries += 1;
  if (appDataConflictRetries > 3) {
    reloadAfterConflict();
    return;
  }

  // Pause saving while we combine this tab's changes with what the other tab saved.
  appDataSyncBlocked = true;
  window.clearTimeout(syncTimerId);
  try {
    const response = await studyMateApi("app-data");
    if (!response.appData) throw new Error("No saved data to combine with.");
    mergeServerChangesIntoLocal(response.appData);
  } catch (error) {
    console.warn(error.message);
    reloadAfterConflict();
    return;
  }
  appDataSyncBlocked = false;
  await pushAppDataToServer();
}

function pushAppDataToServer() {
  if (!databaseLoaded || isHydratingFromServer || appDataSyncBlocked) return Promise.resolve();
  if (appDataSaveInFlight) {
    appDataSaveQueued = true;
    return appDataSaveInFlight;
  }

  appDataSaveInFlight = (async function () {
    try {
      do {
        appDataSaveQueued = false;
        appDataSavePending = false;
        const body = JSON.stringify(getPersonalAppDataPayload());
        const response = await studyMateApi("app-data", { method: "PUT", body });
        if (response && response.rev !== undefined) appDataRevision = Number(response.rev) || 0;
        appDataBase = JSON.parse(body);
        appDataConflictRetries = 0;
      } while (appDataSaveQueued && !appDataSyncBlocked);
    } catch (error) {
      if (error.status === 409) {
        handleAppDataConflict();
      } else {
        console.warn(error.message);
      }
    } finally {
      appDataSaveInFlight = null;
    }
  })();
  return appDataSaveInFlight;
}

function queueDatabaseSync() {
  if (!databaseLoaded || isHydratingFromServer || appDataSyncBlocked) return;
  appDataSavePending = true;
  window.clearTimeout(syncTimerId);
  syncTimerId = window.setTimeout(pushAppDataToServer, 450);
}

async function persistAppDataNow() {
  if (!databaseLoaded || isHydratingFromServer || appDataSyncBlocked) return;
  window.clearTimeout(syncTimerId);
  await pushAppDataToServer();
}
// Pick up changes made in other tabs or devices without a reload.
async function checkForRemoteChanges() {
  if (typeof document !== "undefined" && document.hidden) return;
  if (!databaseLoaded || isHydratingFromServer || appDataSyncBlocked) return;
  if (appDataSaveInFlight || appDataSavePending) return;

  try {
    const status = await studyMateApi("app-data/revision");
    if (Number(status.rev || 0) <= appDataRevision) return;
    if (appDataSaveInFlight || appDataSavePending) return;

    const response = await studyMateApi("app-data");
    if (!response.appData) return;
    // If you changed something while we were asking, leave it for the normal save to sort out.
    if (appDataSaveInFlight || appDataSavePending) return;

    mergeServerChangesIntoLocal(response.appData);
    appDataBase = JSON.parse(JSON.stringify(getPersonalAppDataPayload()));
  } catch (error) {
    console.warn(error.message);
  }
}

async function refreshFromOtherTabs() {
  await checkForRemoteChanges();
  if (typeof syncActiveFocusFromServer === "function") await syncActiveFocusFromServer();
}

if (typeof window.setInterval === "function") window.setInterval(refreshFromOtherTabs, 8000);
if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) refreshFromOtherTabs();
  });
}
// --- end app data sync ---

async function importLegacyLocalData() {
  if (!importLocalDataButton) return;
  importLocalDataButton.disabled = true;
  try {
    await studyMateApi("import-local", {
      method: "POST",
      body: JSON.stringify(getLegacyBrowserData())
    });
    databaseLoaded = true;
    appData = removeTransientTimerState(getLegacyBrowserData());
    normalizeData();
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(removeTransientTimerState(appData)));
    showLegacyImportIfNeeded(false);
    updateAllDisplays();
  } catch (error) {
    console.warn(error.message);
    importLocalDataButton.disabled = false;
  }
}

function showOnboardingStep(stepNumber) {
  if (!onboardingModal) return;
  onboardingModal.querySelectorAll(".onboarding-step").forEach(function (step) {
    step.classList.toggle("active", step.dataset.onboardingStep === String(stepNumber));
  });
}

function renderOnboardingExamOptions() {
  if (!onboardingExamOptions) return;
  onboardingExamOptions.innerHTML = "";
  const popularNames = ["JEE Main", "JEE Advanced", "NEET UG", "MHT CET", "BITSAT", "GATE", "CUET UG", "SAT"];
  const popularPresets = examPresets.filter(function (preset) { return popularNames.includes(preset.name); });
  const morePresets = examPresets.filter(function (preset) { return !popularNames.includes(preset.name); });

  appendOnboardingExamGroup("Popular choices", popularPresets, false);

  const moreButton = document.createElement("button");
  moreButton.type = "button";
  moreButton.className = "text-button onboarding-more-exams";
  moreButton.textContent = "More exams";
  onboardingExamOptions.appendChild(moreButton);

  appendOnboardingExamGroup("More exams", morePresets, true);
  moreButton.addEventListener("click", function () {
    onboardingExamOptions.classList.add("show-more");
    moreButton.hidden = true;
  });
}

function appendOnboardingExamGroup(title, presets, isMoreGroup) {
  const group = document.createElement("div");
  const heading = document.createElement("h3");
  const grid = document.createElement("div");
  group.className = isMoreGroup ? "onboarding-exam-group onboarding-more-group" : "onboarding-exam-group";
  heading.textContent = title;
  grid.className = "onboarding-choice-grid";
  presets.forEach(function (preset) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "onboarding-choice";
    button.dataset.examName = preset.name;
    button.innerHTML = `<strong>${preset.name}</strong>`;
    button.classList.toggle("selected", appData.exams.some(function (exam) { return exam.name === preset.name; }));
    button.addEventListener("click", function () { button.classList.toggle("selected"); });
    grid.appendChild(button);
  });
  group.appendChild(heading);
  group.appendChild(grid);
  onboardingExamOptions.appendChild(group);
}

function renderOnboardingSubjectOptions() {
  if (!onboardingSubjectOptions) return;
  onboardingSubjectOptions.innerHTML = "";
  onboardingSubjectPresets.forEach(function (subjectName) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "onboarding-choice";
    button.dataset.subjectName = subjectName;
    button.innerHTML = `<strong>${escapeHtml(subjectName)}</strong>`;
    button.classList.toggle("selected", appData.subjects.some(function (subject) { return subject.name === subjectName; }));
    button.addEventListener("click", function () { button.classList.toggle("selected"); });
    onboardingSubjectOptions.appendChild(button);
  });
}

function getSelectedOnboardingExams() {
  return Array.from(onboardingExamOptions.querySelectorAll(".onboarding-choice.selected"))
    .map(function (button) { return button.dataset.examName; })
    .filter(Boolean);
}

function getSelectedOnboardingSubjects() {
  const selected = Array.from(onboardingSubjectOptions.querySelectorAll(".onboarding-choice.selected"))
    .map(function (button) { return button.dataset.subjectName; })
    .filter(Boolean);
  return Array.from(new Set(selected.concat(parseCommaList(onboardingCustomSubjects.value))));
}

async function saveOnboardingBasics() {
  await saveProfilePayload({
    displayName: onboardingDisplayName.value.trim() || studyMateUser.displayName,
    username: onboardingUsername.value.trim() || studyMateUser.username,
    country: onboardingCountry.value.trim(),
    timezone: onboardingTimezone.value.trim() || "Asia/Kolkata",
    preferredTheme: studyMateUser.preferredTheme || "system"
  });
  if (onboardingStudyGoal.value) {
    appData.goalHours = Number(onboardingStudyGoal.value) || appData.goalHours;
    saveData();
  }
}

async function saveOnboardingExams() {
  getSelectedOnboardingExams().forEach(function (examName) {
    if (appData.exams.some(function (exam) { return exam.name === examName; })) return;
    const preset = examPresets.find(function (item) { return item.name === examName; }) || { name: examName, subjects: [] };
    appData.exams.push({
      id: createId(),
      type: preset.name,
      name: preset.name,
      date: "",
      time: "",
      subjects: (preset.subjects || []).map(function (subjectName) {
        return { id: createId(), name: subjectName, chapters: [] };
      }),
      notes: "",
      milestones: [],
      createdAt: new Date().toISOString()
    });
  });
  saveData();
}

async function saveOnboardingSubjects() {
  const subjects = getSelectedOnboardingSubjects();
  subjects.forEach(function (subjectName) {
    const exists = appData.subjects.some(function (subject) {
      return subject.name.toLowerCase() === subjectName.toLowerCase();
    });
    if (!exists) appData.subjects.push(createSubject(subjectName));
  });
  saveData();
}

function maybeShowOnboarding() {
  if (!onboardingModal || studyMateUser.onboardingCompleted) return;
  renderOnboardingExamOptions();
  renderOnboardingSubjectOptions();
  onboardingDisplayName.value = studyMateUser.displayName || "";
  onboardingUsername.value = studyMateUser.username || "";
  onboardingCountry.value = studyMateUser.country || "";
  onboardingTimezone.value = studyMateUser.timezone || "Asia/Kolkata";
  onboardingStudyGoal.value = appData.goalHours || "";
  onboardingAvatarStyle.value = studyMateUser.avatarStyle || "initials";
  onboardingAvatarColor.value = studyMateUser.avatarColor || "teal";
  onboardingBio.value = studyMateUser.bio || "";
  renderAvatarChoices();
  renderProfile();
  onboardingModal.hidden = false;
  showOnboardingStep(1);
}

function showSection(sectionId) {
  sections.forEach(function (section) {
    section.classList.toggle("active", section.id === sectionId);
  });

  navButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });

  if (sectionId === "cozy-library" && typeof initCozyLibrary === "function") {
    initCozyLibrary();
  }
}

function showToast(message, duration) {
  if (!message) return;
  const timeout = typeof duration === "number" ? duration : 3000;
  let container = document.getElementById("app-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "app-toast-container";
    container.className = "app-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "app-toast";
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add("show");
  });

  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 250);
  }, timeout);
}

window.showToast = showToast;

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
  return new Date(normalizeUtcTimestamp(dateString)).toLocaleTimeString([], {
    timeZone: getAccountTimezone(),
    hour: "numeric",
    minute: "2-digit"
  });
}

function getTimeZoneOffsetMs(timeZone, date) {
  const parts = {};
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date).forEach(function (part) {
    parts[part.type] = part.value;
  });
  const localAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return localAsUtc - date.getTime();
}

function localDateTimeToUtcIso(dateKey, timeValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || "")) throw new Error("Choose a valid date.");
  if (!/^\d{2}:\d{2}$/.test(timeValue || "")) throw new Error("Choose a valid time.");
  const dateParts = dateKey.split("-").map(Number);
  const timeParts = timeValue.split(":").map(Number);
  const localAsUtc = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]));
  let offset = getTimeZoneOffsetMs(getAccountTimezone(), localAsUtc);
  let utcDate = new Date(localAsUtc.getTime() - offset);
  const correctedOffset = getTimeZoneOffsetMs(getAccountTimezone(), utcDate);
  if (correctedOffset !== offset) {
    utcDate = new Date(localAsUtc.getTime() - correctedOffset);
  }
  return utcDate.toISOString();
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
  return getStudyDateKey(date);
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
  const upcoming = appData.exams
    .filter(function (exam) { return exam.date && exam.date >= today; })
    .sort(function (first, second) { return new Date(first.date) - new Date(second.date); });
  if (upcoming.length > 0) return upcoming[0];
  if (appData.exams.length > 0) {
    const withDate = appData.exams.filter(e => e.date).sort((a,b) => new Date(a.date) - new Date(b.date));
    return withDate[0] || appData.exams[0];
  }
  return null;
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
  if (!dateKey) return null;
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
  if (daysLeft === null) return "Add an exam date when you know it.";
  if (daysLeft < 0) return "Exam completed";
  if (daysLeft <= 2) return "Keep it simple. Revise what matters most.";
  if (daysLeft <= 7) return "Prioritize high-value revision.";
  if (daysLeft <= 14) return "Time to get specific.";
  if (daysLeft <= 30) return "Focus on unfinished areas.";
  if (daysLeft <= 60) return "Good time to start tightening the plan.";
  return "Plenty of time. Build consistency.";
}

function getExamStatusLabel(daysLeft) {
  if (daysLeft === null) return "Date not set";
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
  return getGoalPercentForSeconds(getTodayStudySeconds());
}

function getGoalPercentForSeconds(studySeconds) {
  const goalSeconds = Number(appData.goalHours || 0) * 3600;
  if (goalSeconds <= 0) return 0;
  return Math.min(Math.round((studySeconds / goalSeconds) * 100), 100);
}

function getCompletedStudySessionsForDate(dateKey) {
  const sessions = getSessionsForDate(dateKey).slice();
  if (appData.pendingSessionReview && appData.pendingSessionReview.date === dateKey) {
    const alreadySaved = sessions.some(function (session) {
      return session.id === appData.pendingSessionReview.id;
    });
    if (!alreadySaved) sessions.unshift(appData.pendingSessionReview);
  }
  return sessions.filter(function (session) {
    return Number(session.durationSeconds || 0) > 0;
  });
}

function getStudySecondsForDate(dateKey) {
  return getSecondsFromSessions(getCompletedStudySessionsForDate(dateKey));
}

function getActiveSessionDateKey() {
  return appData.activeSession ? getDateKeyFromDate(new Date(appData.activeSession.startedAt)) : "";
}

function getLiveStudySecondsForDate(dateKey) {
  const completedSeconds = getStudySecondsForDate(dateKey);
  if (dateKey === getActiveSessionDateKey()
    && appData.activeSession
    && appData.activeSession.phase === "focus"
    && !isActiveSessionStale(appData.activeSession)) {
    return completedSeconds + getSessionElapsedSeconds();
  }
  return completedSeconds;
}

function getTodayStudySeconds() {
  return getLiveStudySecondsForDate(getTodayKey());
}

function getCurrentStudyStreak() {
  let streak = 0;
  const minimumSeconds = 10 * 60;
  const cursor = new Date(`${getTodayKey()}T00:00:00`);

  while (true) {
    const dateKey = getDateKeyFromDate(cursor);
    if (getStudySecondsForDate(dateKey) < minimumSeconds) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
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
  return getSubjectById(appData.selectedSubjectId) || appData.subjects[0] || { id: "", name: "General Study", seconds: 0 };
}

function getActiveSessionSubject() {
  if (!appData.activeSession) return getSelectedSubject();
  return getSubjectById(appData.activeSession.subjectId) || {
    id: appData.activeSession.subjectId || "",
    name: appData.activeSession.subjectName || "General Study",
    colorKey: "blue"
  };
}

function getSessionElapsedSeconds() {
  if (!appData.activeSession) return 0;
  const startedAt = new Date(appData.activeSession.startedAt).getTime();
  const totalPaused = Number(appData.activeSession.totalPausedSeconds || 0);
  if (Number.isNaN(startedAt)) return Number(appData.activeSession.elapsedSeconds || 0);
  if (appData.sessionState === "paused" || appData.activeSession.state === "paused") {
    const pausedAt = new Date(appData.activeSession.pausedAt || Date.now()).getTime();
    const pausedSeconds = Number.isNaN(pausedAt) ? totalPaused : totalPaused + Math.max(0, Math.floor((Date.now() - pausedAt) / 1000));
    return Math.max(0, Math.floor((Date.now() - startedAt) / 1000) - pausedSeconds);
  }
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000) - totalPaused);
}

function updateBrowserTimerTitle() {
  if (!appData.activeSession) {
    document.title = "StudyMate";
    return;
  }
  const subject = getSubjectById(appData.activeSession.subjectId) || { name: appData.activeSession.subjectName || "Study" };
  const icon = appData.sessionState === "paused" ? "⏸" : "▶";
  document.title = `${icon} ${formatLongTime(getSessionElapsedSeconds())} - ${subject.name} | StudyMate`;
}

function updateAllDisplays() {
  updateBrowserTimerTitle();
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
  renderProfile();
}

function updateHome() {
  const pendingTasks = getPendingTodayTasks();
  const completedTasks = getCompletedTodayTasks();
  const selectedSubject = getSelectedSubject();
  const todayStudySeconds = getTodayStudySeconds();
  const goalPercent = getGoalPercentForSeconds(todayStudySeconds);
  const currentStreak = getCurrentStudyStreak();
  const greeting = getGreeting();
  const nearestExam = getNearestExam();
  const summaryParts = [
    `${pendingTasks.length} ${pendingTasks.length === 1 ? "task" : "tasks"} left today`,
    `${formatShortTime(todayStudySeconds)} studied`
  ];

  if (nearestExam) {
    const today = new Date(`${getTodayKey()}T00:00:00`);
    const examDate = nearestExam.date ? new Date(`${nearestExam.date}T00:00:00`) : null;
    const diff = examDate ? Math.round((examDate - today) / 86400000) : null;
    if (diff === 0) summaryParts.push(`${nearestExam.name} today`);
    else if (diff === 1) summaryParts.push(`${nearestExam.name} tomorrow`);
    else if (diff > 1) summaryParts.push(`${nearestExam.name} in ${diff}d`);
    else summaryParts.push(`${nearestExam.name}`);
  }

  dashboardGreeting.textContent = `${greeting}, ${studyMateUser.displayName || "StudyMate learner"}`;
  todayDate.textContent = new Date().toLocaleDateString(undefined, {
    timeZone: getAccountTimezone(),
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  homeDaySummary.textContent = summaryParts.join(" - ");
  homeTotalTime.textContent = formatShortTime(todayStudySeconds);
  homeStreak.textContent = `${currentStreak}-day streak`;
  homeGoalPercent.textContent = `${goalPercent}%`;
  homeGoalHours.textContent = appData.goalHours ? `of ${formatGoalHours(appData.goalHours)} goal` : "Set today's goal";
  homeGoalBar.style.width = `${goalPercent}%`;
  homeGoalCopy.textContent = appData.goalHours
    ? `${formatShortTime(todayStudySeconds)} / ${formatGoalHours(appData.goalHours)}`
    : "No daily goal set yet.";

  if (appData.activeSession) {
    const activeSubject = getActiveSessionSubject();
    homeActiveSubject.textContent = appData.activeSession.phase === "break" ? "Break" : `● Studying ${activeSubject.name}`;
    homeActiveCopy.textContent = formatLongTime(getSessionElapsedSeconds());
    homeActiveStatus.textContent = appData.activeSession.phase === "break" ? "Break" : "Studying";
    homeSessionStart.textContent = appData.activeSession.mode;
    homeSessionMode.textContent = "";
    homeSessionElapsed.textContent = "";
    homeContinueSession.textContent = "Return to Focus";
    homeSubjectSelect.disabled = true;
  } else {
    homeActiveSubject.textContent = "Quick Focus";
    homeActiveCopy.textContent = "Choose a subject and start a fresh stopwatch session.";
    homeActiveStatus.textContent = "";
    homeSessionStart.textContent = "";
    homeSessionMode.textContent = "";
    homeSessionElapsed.textContent = "";
    homeContinueSession.textContent = "Start Stopwatch";
    homeSubjectSelect.disabled = false;
  }

  homeTaskCount.textContent = `${pendingTasks.length} left - ${completedTasks.length} done`;
  homeTaskPreview.innerHTML = "";
  if (pendingTasks.length === 0) {
    appendSimpleItem(homeTaskPreview, "Nothing planned yet. Add today's first task.");
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
  renderHomeTimeline();
  renderSubjectBreakdown(homeSubjectList);
  renderHomeDistractions();
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
    ? getActiveSessionSubject()
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
  sessionFinishButton.textContent = appData.activeSession && appData.activeSession.modeId === "stopwatch" ? "End Session" : "Finish Session";
  sessionDiscardButton.hidden = !appData.activeSession;
  sessionResetButton.hidden = appData.activeSession && appData.activeSession.modeId === "stopwatch";
  sessionSkipButton.hidden = !appData.activeSession || appData.activeSession.modeId === "stopwatch";
  sessionProgressBar.style.width = `${progressPercent}%`;
  sessionTotalToday.textContent = formatShortTime(getTodayStudySeconds());
  focusGoalProgress.textContent = `${getGoalPercent()}%`;
  focusSessionCount.textContent = getSessionsForDate(getTodayKey()).length;
  intentionInput.value = appData.focusIntention;
  intentionCount.textContent = `${appData.focusIntention.length}/180`;
  renderTimerModeIndicators();
  renderSubjectBreakdown(sessionSubjectBreakdown);

  if (timerPresetsBar) {
    const currentModeId = mode.id;
    timerPresetsBar.querySelectorAll(".preset-chip").forEach(function (chip) {
      chip.classList.toggle("active", chip.dataset.preset === currentModeId);
    });
  }

  if (chimeToggleBtn && chimeBtnIcon) {
    const isChimeOn = appData.chimeEnabled !== false;
    chimeToggleBtn.classList.toggle("active", isChimeOn);
    chimeBtnIcon.textContent = isChimeOn ? "🔔" : "🔕";
  }

  if (sessionTaskHud) {
    if (appData.activeSession) {
      sessionTaskHud.hidden = false;
      const currentGoal = appData.activeSession.goal || "Deep study objective";
      taskHudText.textContent = currentGoal;
      const matchingTask = appData.tasks.find(function (t) {
        return (appData.activeSession.taskId && t.id === appData.activeSession.taskId)
          || (t.text && t.text.toLowerCase().trim() === currentGoal.toLowerCase().trim());
      });
      const isDone = matchingTask ? isTaskCompletedToday(matchingTask) : Boolean(appData.activeSession.isTaskCompleted);
      taskHudCheckbox.checked = isDone;
      taskHudStatus.textContent = isDone ? "Completed ✓" : (state === "paused" ? "Paused" : "In Progress");
      taskHudStatus.classList.toggle("completed", isDone);
      if (taskHudNote && !taskHudNote.matches(":focus")) {
        taskHudNote.value = appData.activeSession.sessionNotes || "";
      }
    } else {
      sessionTaskHud.hidden = true;
    }
  }
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
  goalInput.value = appData.goalHours || "";
  goalDisplay.textContent = appData.goalHours ? formatGoalHours(appData.goalHours) : "Set today's goal";
  planGoalProgress.textContent = `${goalPercent}%`;
  planGoalCopy.textContent = appData.goalHours
    ? `${formatShortTime(getTodayStudySeconds())} / ${formatGoalHours(appData.goalHours)}`
    : "No daily goal set yet.";
  planGoalBar.style.width = `${goalPercent}%`;
  planSummaryGoal.textContent = appData.goalHours ? formatGoalHours(appData.goalHours) : "Not set";
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

  if (isFreshInsightsState()) {
    renderInsightsEmptyState();
    return;
  }

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

function isFreshInsightsState() {
  return getTodayStudySeconds() === 0
    && appData.sessions.length === 0
    && getTodayTasks().length === 0
    && appData.distractions.length === 0;
}

function renderInsightsEmptyState() {
  const panel = createElement("article", "panel empty-state-panel");
  const title = document.createElement("h3");
  const copy = document.createElement("p");
  const action = document.createElement("button");
  title.textContent = "Insights will appear after your first session.";
  copy.className = "muted-text";
  copy.textContent = "Start a focus session and StudyMate will summarize your time, subjects, and progress.";
  action.type = "button";
  action.textContent = "Start Session";
  action.addEventListener("click", function () { showSection("focus-hub"); });
  panel.appendChild(title);
  panel.appendChild(copy);
  panel.appendChild(action);
  insightsContent.appendChild(panel);
}

function renderSubjectOptions() {
  const currentValue = sessionSubjectSelect.value || appData.selectedSubjectId;
  sessionSubjectSelect.innerHTML = "";

  if (appData.subjects.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No subject yet";
    sessionSubjectSelect.appendChild(option);
    sessionSubjectSelect.value = "";
    return;
  }

  appData.subjects.forEach(function (subject) {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.name;
    sessionSubjectSelect.appendChild(option);
  });

  sessionSubjectSelect.value = getSubjectById(currentValue) ? currentValue : appData.selectedSubjectId;
  sessionSubjectSelect.disabled = Boolean(appData.activeSession);
}

function renderColorOptions(selectElement, selectedKey) {
  if (!selectElement) return;
  selectElement.innerHTML = "";
  subjectPalette.forEach(function (color) {
    const option = document.createElement("option");
    option.value = color.key;
    option.textContent = color.name;
    option.selected = color.key === selectedKey;
    selectElement.appendChild(option);
  });
}

function setAvatarChoice(style, color) {
  studyMateUser.avatarStyle = style;
  studyMateUser.avatarColor = color;
  if (profileAvatarStyleInput) profileAvatarStyleInput.value = style;
  if (profileAvatarColorInput) profileAvatarColorInput.value = color;
  if (onboardingAvatarStyle) onboardingAvatarStyle.value = style;
  if (onboardingAvatarColor) onboardingAvatarColor.value = color;
  renderAvatarChoices();
  renderProfile();
}

function renderAvatarChoices() {
  renderAvatarChoiceGrid(profileAvatarOptions);
  renderAvatarChoiceGrid(onboardingAvatarOptions);
}

function renderAvatarChoiceGrid(container) {
  if (!container) return;
  container.innerHTML = "";
  avatarPresets.forEach(function (preset) {
    const button = document.createElement("button");
    const preview = document.createElement("span");
    const label = document.createElement("span");
    button.type = "button";
    button.className = "avatar-choice";
    button.classList.toggle("selected", preset.style === studyMateUser.avatarStyle && preset.color === studyMateUser.avatarColor && !studyMateUser.avatarUrl);
    preview.className = "profile-avatar";
    renderGeneratedAvatar(preview, studyMateUser.displayName, preset.style, preset.color);
    label.textContent = preset.label;
    button.appendChild(preview);
    button.appendChild(label);
    button.addEventListener("click", function () {
      setAvatarChoice(preset.style, preset.color);
    });
    container.appendChild(button);
  });
}

function setAvatarHelp(element, message, isError) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", Boolean(isError));
}

async function uploadAvatar(fileInput, helpElement) {
  const file = fileInput.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setAvatarHelp(helpElement, "Please choose an image file.", true);
    fileInput.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    setAvatarHelp(helpElement, "Profile photo must be 2 MB or smaller.", true);
    fileInput.value = "";
    return;
  }

  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData
    });
    const data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || "Upload failed.");
    updateProfileState(data.profile);
    renderProfile();
    renderAvatarChoices();
    setAvatarHelp(helpElement, "Photo saved.", false);
  } catch (error) {
    setAvatarHelp(helpElement, error.message, true);
  }
  fileInput.value = "";
}

async function removeAvatar(helpElement) {
  try {
    const response = await studyMateApi("profile/avatar", { method: "DELETE" });
    updateProfileState(response.profile);
    renderProfile();
    renderAvatarChoices();
    setAvatarHelp(helpElement, "Photo removed. Generated avatar is active.", false);
  } catch (error) {
    setAvatarHelp(helpElement, error.message, true);
  }
}

async function uploadBanner(fileInput, helpElement) {
  const file = fileInput.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setAvatarHelp(helpElement, "Please choose an image file.", true);
    fileInput.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    setAvatarHelp(helpElement, "Banner image must be 2 MB or smaller.", true);
    fileInput.value = "";
    return;
  }

  const formData = new FormData();
  formData.append("banner", file);
  try {
    const response = await fetch("/api/profile/banner", {
      method: "POST",
      body: formData
    });
    const data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || "Upload failed.");
    updateProfileState(data.profile);
    renderProfile();
    setAvatarHelp(helpElement, "Banner saved.", false);
  } catch (error) {
    setAvatarHelp(helpElement, error.message, true);
  }
  fileInput.value = "";
}

async function removeBanner(helpElement) {
  try {
    const response = await studyMateApi("profile/banner", { method: "DELETE" });
    updateProfileState(response.profile);
    renderProfile();
    setAvatarHelp(helpElement, "Banner removed.", false);
  } catch (error) {
    setAvatarHelp(helpElement, error.message, true);
  }
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

  if (appData.subjects.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Add a subject";
    homeSubjectSelect.appendChild(option);
    homeSubjectSelect.value = "";
    return;
  }

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
  item.className = "task-row home-task-row";
  if (isTaskCompletedToday(task)) item.classList.add("completed");
  if (task.subjectId) item.style.borderLeft = `3px solid ${getSubjectColorValue(getSubjectById(task.subjectId) || "blue")}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = isTaskCompletedToday(task);
  checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);
  checkbox.addEventListener("change", function () {
    toggleTask(task.id);
  });

  const content = document.createElement("span");
  content.className = "task-content";

  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = task.text;

  const taskMeta = document.createElement("small");
  taskMeta.className = "task-meta";
  const metaParts = [];
  if (task.subjectId) metaParts.push(getSubjectName(task.subjectId));
  if (task.repeat === "daily") metaParts.push("Daily");
  taskMeta.textContent = metaParts.join(" · ");

  content.appendChild(taskText);
  if (taskMeta.textContent) content.appendChild(taskMeta);

  item.appendChild(checkbox);
  item.appendChild(content);
  parent.appendChild(item);
}

function renderHomeNextExam(exam) {
  homeNextExam.innerHTML = "";
  const titleEl = document.getElementById("home-exam-title");

  if (!exam) {
    if (titleEl) titleEl.textContent = "Upcoming Exam";
    homeNextExam.className = "compact-empty next-exam-countdown-box";
    const empty = document.createElement("strong");
    empty.textContent = "No upcoming exams yet";
    const sub = document.createElement("p");
    sub.className = "muted-text";
    sub.textContent = "Set an exam target to see how many days are left.";
    const action = document.createElement("button");
    action.type = "button";
    action.className = "text-button exam-add-target-btn";
    action.textContent = "+ Add upcoming exam";
    action.addEventListener("click", function () { showSection("exams"); openExamModal(); });
    homeNextExam.appendChild(empty);
    homeNextExam.appendChild(sub);
    homeNextExam.appendChild(action);
    return;
  }

  homeNextExam.className = "exam-big-countdown-card";
  const stats = getExamStats(exam);
  const today = new Date(`${getTodayKey()}T00:00:00`);
  const examDate = exam.date ? new Date(`${exam.date}T00:00:00`) : null;
  const daysDiff = examDate ? Math.round((examDate - today) / 86400000) : null;

  if (titleEl) {
    if (daysDiff === null) {
      titleEl.textContent = `${exam.name}`;
    } else if (daysDiff === 0) {
      titleEl.textContent = `${exam.name} today`;
    } else if (daysDiff === 1) {
      titleEl.textContent = `${exam.name} tomorrow`;
    } else if (daysDiff > 1) {
      titleEl.textContent = `${exam.name} in ${daysDiff} days`;
    } else {
      titleEl.textContent = `${exam.name} completed`;
    }
  }

  const headerRow = document.createElement("div");
  headerRow.className = "exam-card-top-row";

  const title = document.createElement("h4");
  title.className = "exam-card-title";
  title.textContent = exam.name;

  const badge = document.createElement("span");
  badge.className = "status-pill exam-type-badge";
  badge.textContent = exam.category || "Target Exam";

  headerRow.appendChild(title);
  headerRow.appendChild(badge);

  const countdownHero = document.createElement("div");
  countdownHero.className = "countdown-hero-block";

  const num = document.createElement("div");
  num.className = "countdown-big-number";
  if (daysDiff === null) {
    num.textContent = "—";
  } else if (daysDiff < 0) {
    num.textContent = "0";
  } else {
    num.textContent = String(daysDiff);
  }

  const labelBox = document.createElement("div");
  labelBox.className = "countdown-labels-box";
  const unit = document.createElement("div");
  unit.className = "countdown-unit-text";
  if (daysDiff === null) {
    unit.textContent = "DATE TBD";
  } else if (daysDiff === 0) {
    unit.textContent = "TODAY";
  } else if (daysDiff === 1) {
    unit.textContent = "DAY LEFT";
  } else if (daysDiff < 0) {
    unit.textContent = "PAST TARGET";
  } else {
    unit.textContent = "DAYS LEFT";
  }

  const dateSub = document.createElement("div");
  dateSub.className = "countdown-date-sub";
  dateSub.textContent = exam.date ? `Target: ${exam.date}` : "Date not scheduled";

  labelBox.appendChild(unit);
  labelBox.appendChild(dateSub);
  countdownHero.appendChild(num);
  countdownHero.appendChild(labelBox);

  const footerRow = document.createElement("div");
  footerRow.className = "exam-card-footer";

  const progressWrap = document.createElement("div");
  progressWrap.className = "exam-progress-wrap";
  const progressText = document.createElement("span");
  progressText.className = "muted-text";
  progressText.textContent = `${stats.progressPercent}% syllabus completed`;
  const bar = document.createElement("div");
  bar.className = "progress-bar";
  const barSpan = document.createElement("span");
  barSpan.style.width = `${stats.progressPercent}%`;
  bar.appendChild(barSpan);
  progressWrap.appendChild(progressText);
  progressWrap.appendChild(bar);

  const action = document.createElement("button");
  action.type = "button";
  action.className = "text-button exam-open-link";
  action.textContent = "View Syllabus & Topics →";
  action.addEventListener("click", function () { openExamWorkspace(exam.id); });

  footerRow.appendChild(progressWrap);
  footerRow.appendChild(action);

  homeNextExam.appendChild(headerRow);
  homeNextExam.appendChild(countdownHero);
  homeNextExam.appendChild(footerRow);
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
      ? getLiveStudySecondsForDate(dateKey)
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
  const subjectTotals = getSubjectTotalsFromSessions(getCompletedStudySessionsForDate(getTodayKey()));
  const subjectsWithTime = Object.keys(subjectTotals).map(function (subjectName) {
    const subject = appData.subjects.find(function (item) { return item.name === subjectName; });
    return {
      name: subjectName,
      seconds: subjectTotals[subjectName],
      colorKey: subject ? subject.colorKey : "blue"
    };
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
      const label = document.createElement("span");
      label.className = "subject-label";
      label.appendChild(createSubjectDot(subject));
      label.appendChild(document.createTextNode(subject.name));
      name.appendChild(label);
      time.textContent = formatShortTime(subject.seconds);
      row.appendChild(name);
      row.appendChild(time);
      container.appendChild(row);
    });
}

function renderHomeDistractions() {
  if (!homeDistractionList) return;
  const distractions = getDistractionsForDate(getTodayKey());
  homeDistractionList.innerHTML = "";

  if (distractions.length === 0) {
    appendSimpleItem(homeDistractionList, "No distractions logged today.");
    return;
  }

  distractions.slice(0, 4).forEach(function (entry) {
    const item = document.createElement("li");
    const time = document.createElement("strong");
    const reason = document.createElement("span");
    time.textContent = entry.time || formatClockTime(entry.timestamp);
    reason.textContent = entry.reason || entry.category || "Distraction";
    item.appendChild(time);
    item.appendChild(reason);
    homeDistractionList.appendChild(item);
  });
}

function renderTodayInsights() {
  const today = getTodayKey();
  const entry = getHistoryEntry(today);
  const sessions = getSessionsForDate(today);
  const tasks = getTasksForDate(today);
  const completedTasks = tasks.filter(function (task) { return isTaskCompletedOnDate(task, today); });
  const goalSeconds = Number(entry.goalHours || appData.goalHours || 0) * 3600;
  const goalPercent = goalSeconds > 0 ? Math.min(100, Math.round((entry.studySeconds / goalSeconds) * 100)) : 0;

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
    const goalSeconds = Number(entry.goalHours || appData.goalHours || 0) * 3600;
    const percent = goalSeconds > 0 ? Math.min(100, Math.round((entry.studySeconds / goalSeconds) * 100)) : 0;
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
    const goalSeconds = Number(entry.goalHours || appData.goalHours || 0) * 3600;
    if (goalSeconds <= 0) return total;
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
  const shouldShowLiveSession = appData.selectedHistoryRange !== "previous"
    && appData.activeSession
    && appData.activeSession.phase === "focus"
    && !isActiveSessionStale(appData.activeSession);

  historyTabs.forEach(function (tab) {
    const isActive = tab.dataset.historyRange === appData.selectedHistoryRange;
    tab.classList.toggle("active", isActive);
    tab.classList.toggle("secondary-button", !isActive);
  });

  if (shouldShowLiveSession) {
    appendRecentSessionRow({
      id: appData.activeSession.id,
      subjectId: appData.activeSession.subjectId,
      subjectName: appData.activeSession.subjectName || getSubjectName(appData.activeSession.subjectId),
      mode: appData.activeSession.mode,
      startedAt: appData.activeSession.startedAt,
      endedAt: null,
      durationSeconds: getSessionElapsedSeconds(),
      liveStatus: appData.sessionState === "paused" ? "Paused" : "Studying"
    }, true);
  }

  if (sessions.length === 0 && !shouldShowLiveSession) {
    appendSimpleItem(recentSessionList, "No saved sessions yet.");
    return;
  }

  sessions.slice(0, 8).forEach(function (session) {
    appendRecentSessionRow(session, false);
  });
}

function appendRecentSessionRow(session, isLive) {
  const item = document.createElement("article");
  item.className = "session-history-row";
  if (isLive) item.classList.add("live-session-row");
  const topLine = document.createElement("div");
  const bottomLine = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const time = document.createElement("span");
  const duration = document.createElement("strong");
  const result = document.createElement("small");
  const actions = document.createElement("div");
  const sessionSubject = getSubjectById(session.subjectId);
  title.className = "subject-label";
  title.appendChild(createSubjectDot(sessionSubject || { colorKey: "blue" }));
  title.appendChild(document.createTextNode(session.subjectName || getSubjectName(session.subjectId)));
  meta.textContent = isLive ? `${session.mode || "Timer"} · ${session.liveStatus}` : `${session.mode || "Timer"} · ${getSessionSourceLabel(session)}`;
  time.textContent = isLive
    ? `${formatClockTime(session.startedAt)} – now`
    : `${formatClockTime(session.startedAt)} – ${formatClockTime(session.endedAt)}`;
  duration.textContent = formatShortTime(session.durationSeconds);
  result.textContent = isLive ? "Live" : session.goalResult ? `Goal: ${formatGoalResult(session.goalResult)}` : "";
  actions.className = "session-row-actions";
  topLine.className = "session-row-top";
  bottomLine.className = "session-row-bottom";
  topLine.appendChild(title);
  topLine.appendChild(meta);
  topLine.appendChild(duration);
  bottomLine.appendChild(time);
  if (result.textContent) bottomLine.appendChild(result);
  if (!isLive) {
    actions.appendChild(createSessionAction("Edit", function () { openStudyLogModal(session); }));
    actions.appendChild(createSessionAction("Delete", function () { deleteStudySession(session.id); }, "danger"));
    bottomLine.appendChild(actions);
  }
  item.appendChild(topLine);
  item.appendChild(bottomLine);
  recentSessionList.appendChild(item);
}

function getSessionSourceLabel(session) {
  if (session.wasEdited) return "Edited";
  if (session.sourceType === "manual") return "Manual";
  return "Tracked";
}

function createSessionAction(label, onClick, tone) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = tone === "danger" ? "text-danger-button subtle-action" : "text-button subtle-action";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderHomeTimeline() {
  if (!homeDayTimeline) return;
  const dateKey = appData.selectedTimelineDate || getTodayKey();
  const sessions = getCompletedStudySessionsForDate(dateKey)
    .slice()
    .sort(function (first, second) {
      return new Date(first.startedAt) - new Date(second.startedAt);
    });

  timelineDateInput.value = dateKey;
  timelineNextDay.disabled = dateKey >= getTodayKey();
  homeTimelineTitle.textContent = dateKey === getTodayKey()
    ? "Today timeline"
    : new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  homeDayTimeline.innerHTML = "";

  if (sessions.length === 0) {
    const empty = document.createElement("div");
    const copy = document.createElement("p");
    const actions = document.createElement("div");
    empty.className = "timeline-empty";
    copy.className = "muted-text";
    copy.textContent = "Nothing logged for this day.";
    actions.className = "button-row";
    actions.appendChild(createSessionAction("Add Study Log", function () { openStudyLogModal(null, dateKey); }));
    actions.appendChild(createSessionAction("Start Focus", function () { showSection("focus-hub"); }));
    empty.appendChild(copy);
    empty.appendChild(actions);
    homeDayTimeline.appendChild(empty);
    return;
  }

  sessions.forEach(function (session) {
    const item = document.createElement("article");
    const time = document.createElement("span");
    const main = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("small");
    const actions = document.createElement("div");
    const subject = getSubjectById(session.subjectId);
    item.className = "timeline-session-item";
    item.style.borderLeftColor = getSubjectColorValue(subject || { colorKey: "blue" });
    time.textContent = `${formatClockTime(session.startedAt)} - ${formatClockTime(session.endedAt)}`;
    title.textContent = session.subjectName || getSubjectName(session.subjectId);
    meta.textContent = `${formatShortTime(session.durationSeconds)} - ${session.mode || "Timer"} - ${getSessionSourceLabel(session)}`;
    actions.className = "session-row-actions";
    actions.appendChild(createSessionAction("Edit", function () { openStudyLogModal(session); }));
    actions.appendChild(createSessionAction("Delete", function () { deleteStudySession(session.id); }, "danger"));
    main.appendChild(title);
    main.appendChild(meta);
    item.appendChild(time);
    item.appendChild(main);
    item.appendChild(actions);
    homeDayTimeline.appendChild(item);
  });
}

function changeTimelineDate(days) {
  appData.selectedTimelineDate = addDaysToDate(appData.selectedTimelineDate || getTodayKey(), days);
  if (appData.selectedTimelineDate > getTodayKey()) appData.selectedTimelineDate = getTodayKey();
  saveData();
  updateAllDisplays();
}

function selectTimelineDate(dateKey) {
  appData.selectedTimelineDate = dateKey || getTodayKey();
  if (appData.selectedTimelineDate > getTodayKey()) appData.selectedTimelineDate = getTodayKey();
  saveData();
  updateAllDisplays();
}

function findOrCreateSubject(nameOrId) {
  const raw = String(nameOrId || "").trim();
  if (!raw) {
    let general = appData.subjects.find(function (s) { return s.name.toLowerCase() === "general study"; });
    if (!general) {
      general = createSubject("General Study", "blue");
      appData.subjects.push(general);
    }
    return general;
  }
  let match = appData.subjects.find(function (s) { return String(s.id) === raw; });
  if (match) return match;
  match = appData.subjects.find(function (s) { return s.name.toLowerCase() === raw.toLowerCase(); });
  if (match) return match;
  const newSub = createSubject(raw, getNextSubjectColorKey());
  appData.subjects.push(newSub);
  renderSubjectOptions();
  renderTaskSubjectOptions();
  return newSub;
}

function renderStudyLogSubjects(selectedSubjectId) {
  let datalist = document.getElementById("subject-datalist");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "subject-datalist";
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = "";
  appData.subjects.forEach(function (subject) {
    const option = document.createElement("option");
    option.value = subject.name;
    datalist.appendChild(option);
  });

  const currentSub = getSubjectById(selectedSubjectId);
  studyLogSubject.value = currentSub ? currentSub.name : (selectedSubjectId || "");
}

function openStudyLogModal(session = null, dateKey = appData.selectedTimelineDate || getTodayKey()) {
  const isEditing = Boolean(session);
  studyLogTitle.textContent = isEditing ? "Edit Session" : "Add Study Log";
  studyLogSubmit.textContent = isEditing ? "Save Changes" : "Save Study Log";
  studyLogSessionId.value = isEditing ? session.id : "";
  renderStudyLogSubjects(isEditing ? session.subjectId : appData.selectedSubjectId);
  studyLogDate.value = isEditing ? session.date : dateKey;
  studyLogStart.value = isEditing ? formatInputTime(session.startedAt) : "";
  studyLogEnd.value = isEditing ? formatInputTime(session.endedAt) : "";
  studyLogDuration.value = isEditing ? Math.max(1, Math.round(Number(session.durationSeconds || 0) / 60)) : "";
  studyLogNote.value = isEditing ? session.reviewNote || "" : "";
  studyLogModal.hidden = false;
  studyLogDate.focus();
}

function closeStudyLogModal() {
  studyLogModal.hidden = true;
}

function formatInputTime(dateString) {
  const date = new Date(normalizeUtcTimestamp(dateString));
  if (Number.isNaN(date.getTime())) return "";
  const parts = {};
  new Intl.DateTimeFormat("en-CA", {
    timeZone: getAccountTimezone(),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date).forEach(function (part) {
    parts[part.type] = part.value;
  });
  return `${parts.hour}:${parts.minute}`;
}

function getStudyLogPayload() {
  const subject = findOrCreateSubject(studyLogSubject.value.trim() || "General Study");
  const dateKey = studyLogDate.value || getTodayKey();
  const startTime = studyLogStart.value;
  const endTime = studyLogEnd.value;
  const durationMinutes = Number(studyLogDuration.value || 0);
  let startedAt = "";
  let endedAt = "";
  let durationSeconds = Math.round(durationMinutes * 60);

  if (startTime && endTime) {
    const start = new Date(localDateTimeToUtcIso(dateKey, startTime));
    const end = new Date(localDateTimeToUtcIso(dateKey, endTime));
    if (end <= start) throw new Error("End time must be after start time.");
    startedAt = start.toISOString();
    endedAt = end.toISOString();
    durationSeconds = Math.round((end - start) / 1000);
  } else if (durationSeconds > 0) {
    const start = new Date(localDateTimeToUtcIso(dateKey, startTime || "12:00"));
    const end = new Date(start.getTime() + durationSeconds * 1000);
    startedAt = start.toISOString();
    endedAt = end.toISOString();
  } else {
    throw new Error("Add a duration or both start and end time.");
  }

  if (durationSeconds <= 0) throw new Error("Duration must be greater than 0.");
  if (durationSeconds > 18 * 3600) throw new Error("Sessions longer than 18 hours are not accepted here.");

  return {
    id: studyLogSessionId.value || createId(),
    date: dateKey,
    subjectId: subject.id,
    subjectName: subject.name,
    mode: studyLogSessionId.value ? "Timer" : "Manual",
    modeId: studyLogSessionId.value ? "tracked" : "manual",
    startedAt,
    endedAt,
    durationSeconds,
    sourceType: studyLogSessionId.value ? "tracked" : "manual",
    wasEdited: Boolean(studyLogSessionId.value),
    editedAt: studyLogSessionId.value ? new Date().toISOString() : null,
    reviewNote: studyLogNote.value.trim()
  };
}

async function saveStudyLog(event) {
  event.preventDefault();
  let payload;
  try {
    payload = getStudyLogPayload();
  } catch (error) {
    alert(error.message);
    return;
  }

  const existingIndex = appData.sessions.findIndex(function (session) { return session.id === payload.id; });
  if (existingIndex >= 0) {
    const original = appData.sessions[existingIndex];
    payload = {
      ...original,
      ...payload,
      mode: original.mode || payload.mode,
      modeId: original.modeId || payload.modeId,
      sourceType: original.sourceType || "tracked",
      originalDurationSeconds: original.originalDurationSeconds || original.durationSeconds,
      wasEdited: true,
      editedAt: new Date().toISOString()
    };
    if (databaseLoaded) {
      try {
        const response = await studyMateApi(`sessions/client/${payload.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        payload = response.session || payload;
      } catch (error) {
        console.warn(error.message);
        alert(error.message);
        return;
      }
    }
    appData.sessions[existingIndex] = normalizeStudySession(payload);
  } else {
    payload.sourceType = "manual";
    payload.mode = "Manual";
    if (databaseLoaded) {
      try {
        const response = await studyMateApi("sessions", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        payload = response.session || payload;
      } catch (error) {
        console.warn(error.message);
        alert(error.message);
        return;
      }
    }
    appData.sessions = appData.sessions.filter(function (session) { return session.id !== payload.id; });
    appData.sessions.unshift(normalizeStudySession(payload));
  }

  closeStudyLogModal();
  saveData();
  await persistAppDataNow();
  updateAllDisplays();
}

async function deleteStudySession(sessionId) {
  const session = appData.sessions.find(function (item) { return item.id === sessionId; });
  if (!session) return;
  if (!window.confirm(`Delete this ${formatShortTime(session.durationSeconds)} ${session.subjectName || "study"} session?`)) return;
  appData.sessions = appData.sessions.filter(function (item) { return item.id !== sessionId; });
  if (appData.pendingSessionReview && appData.pendingSessionReview.id === sessionId) {
    appData.pendingSessionReview = null;
    appData.sessionState = "pre-session";
  }
  if (databaseLoaded) {
    try {
      await studyMateApi(`sessions/client/${sessionId}`, { method: "DELETE" });
    } catch (error) {
      console.warn(error.message);
    }
  }
  saveData();
  await persistAppDataNow();
  updateAllDisplays();
}

function formatGoalResult(result) {
  const labels = { yes: "completed", partly: "partly done", no: "not finished" };
  return labels[result] || result;
}

async function startSession() {
  if (appData.activeSession || appData.pendingSessionReview) return;

  appData.customFocusMinutes = Math.max(1, Number(customFocusInput.value) || appData.customFocusMinutes);
  appData.customBreakMinutes = Math.max(0, Number(customBreakInput.value) || 0);
  appData.selectedSubjectId = sessionSubjectSelect.value || appData.selectedSubjectId;
  appData.currentSessionDraft.goal = sessionGoalInput.value.trim();

  if (databaseLoaded) {
    try {
      const response = await studyMateApi("focus/active");
      const backendActiveSession = normalizeActiveFocusSession(response.activeSession);
      if (applyBackendActiveSession(backendActiveSession)) {
        if (appData.sessionState !== "paused") resumeSessionTimer();
        saveData();
        updateAllDisplays();
        return;
      }
    } catch (error) {
      console.warn(error.message);
    }
  }

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
    pausedAt: null,
    totalPausedSeconds: 0,
    state: "running",
    elapsedSeconds: 0,
    focusSeconds: getTimerFocusSeconds(),
    breakSeconds: getTimerBreakSeconds()
  };
  appData.sessionState = "active";

  await saveActiveFocusSession("start");
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
  renderRecentSessions();
  updateBrowserTimerTitle();

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
    if (appData.activeSession.pausedAt) {
      appData.activeSession.totalPausedSeconds = Number(appData.activeSession.totalPausedSeconds || 0)
        + Math.max(0, Math.floor((Date.now() - new Date(appData.activeSession.pausedAt).getTime()) / 1000));
    }
    appData.activeSession.pausedAt = null;
    appData.activeSession.state = "running";
    appData.sessionState = appData.activeSession.phase === "break" ? "break" : "active";
    saveActiveFocusSession("resume");
    saveData();
    resumeSessionTimer();
    updateAllDisplays();
    return;
  }

  appData.activeSession.elapsedSeconds = getSessionElapsedSeconds();
  appData.activeSession.pausedAt = new Date().toISOString();
  appData.activeSession.state = "paused";
  appData.sessionState = "paused";
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  saveActiveFocusSession("pause");
  saveData();
  updateAllDisplays();
}

function resetActiveSession() {
  if (!appData.activeSession) return;
  clearActiveFocusSession();
  appData.activeSession = null;
  appData.sessionState = "pre-session";
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  saveData();
  updateAllDisplays();
}

async function finalizeFocusSession(shouldShowReview = true) {
  if (!appData.activeSession) return null;
  if (isCompletingSession) return null;
  isCompletingSession = true;

  const durationSeconds = getSessionElapsedSeconds();
  const subject = getSubjectById(appData.activeSession.subjectId) || getSelectedSubject();
  const activeSession = appData.activeSession;

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
    appData.sessions = appData.sessions.filter(function (session) { return session.id !== review.id; });
    appData.sessions.unshift(review);
    await completeActiveFocusSession(review);
    if (typeof playCompletionChime === "function") playCompletionChime();
    if (shouldShowReview) {
      appData.pendingSessionReview = review;
      renderCompletionReview(review);
    }
  }

  appData.activeSession = null;
  appData.sessionState = shouldShowReview && review ? "complete" : "pre-session";
  clearInterval(sessionTimerId);
  sessionTimerId = null;
  saveData();
  await persistAppDataNow();
  updateAllDisplays();
  isCompletingSession = false;
  return review;
}

async function completeFocusPhase() {
  const activeSession = appData.activeSession;
  if (!activeSession) return;

  await finalizeFocusSession(!activeSession.breakSeconds);

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
      pausedAt: null,
      totalPausedSeconds: 0,
      state: "running",
      elapsedSeconds: 0,
      focusSeconds: activeSession.breakSeconds,
      breakSeconds: 0
    };
    appData.sessionState = "break";
    saveActiveFocusSession("break");
    saveData();
    resumeSessionTimer();
  }

  updateAllDisplays();
}

function completeBreakPhase() {
  if (!appData.activeSession) return;
  clearActiveFocusSession();
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
  const index = appData.sessions.findIndex(function (session) { return session.id === review.id; });
  if (index >= 0) {
    appData.sessions[index] = review;
  } else {
    appData.sessions.unshift(review);
  }
  appData.pendingSessionReview = null;
  appData.sessionState = "pre-session";
  if (startAnother) appData.currentSessionDraft.goal = "";
  saveData();
  persistAppDataNow();
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
  if (appData.activeSession && appData.activeSession.modeId === "stopwatch") return;
  resetActiveSession();
}

function changeSessionSubject() {
  if (appData.activeSession) {
    sessionSubjectSelect.value = appData.activeSession.subjectId || "";
    return;
  }
  appData.selectedSubjectId = sessionSubjectSelect.value;

  saveData();
  updateAllDisplays();
}

function openSubjectModal() {
  subjectModal.hidden = false;
  subjectInput.value = "";
  renderColorOptions(subjectColorInput, getNextSubjectColorKey());
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
    const subject = createSubject(subjectName, subjectColorInput.value);
    appData.subjects.push(subject);
    appData.selectedSubjectId = subject.id;
  }

  subjectInput.value = "";
  renderColorOptions(subjectColorInput, getNextSubjectColorKey());
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

async function addFocusDistraction(event) {
  event.preventDefault();
  const now = new Date();
  const distraction = {
    id: createId(),
    category: focusDistractionCategory.value,
    reason: focusDistractionNote.value.trim(),
    time: formatClockTime(now.toISOString()),
    date: getTodayKey(),
    timestamp: now.toISOString(),
    sessionId: appData.activeSession ? appData.activeSession.id : null
  };
  appData.distractions.unshift(distraction);
  if (databaseLoaded) {
    try {
      await studyMateApi("focus/distractions", {
        method: "POST",
        body: JSON.stringify(distraction)
      });
    } catch (error) {
      console.warn(error.message);
    }
  }
  closeFocusDistractionModal();
  saveData();
  await persistAppDataNow();
  updateAllDisplays();
}

function saveIntention(event) {
  event.preventDefault();
  appData.focusIntention = intentionInput.value.trim();
  saveData();
  updateAllDisplays();
}

function createTask(text, date, subjectId, repeat, priority = "normal", durationMinutes = 25) {
  return {
    id: createId(),
    text,
    completed: false,
    date: date || getTodayKey(),
    subjectId: subjectId || "",
    repeat: repeat || "never",
    priority: priority || "normal",
    durationMinutes: Number(durationMinutes || 25),
    completedDates: []
  };
}

function addTask(event) {
  event.preventDefault();
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  const priority = taskPriorityInput ? taskPriorityInput.value : "normal";
  const duration = taskDurationInput ? Number(taskDurationInput.value) || 25 : 25;

  appData.tasks.push(createTask(taskText, taskDateInput.value, taskSubjectInput.value, taskRepeatInput.value, priority, duration));
  taskInput.value = "";
  taskDateInput.value = "";
  taskSubjectInput.value = "";
  if (taskPriorityInput) taskPriorityInput.value = "normal";
  if (taskDurationInput) taskDurationInput.value = "25";
  taskRepeatInput.value = "never";
  saveData();
  closeTaskModal();
  renderTasks();
  updateAllDisplays();
}

function startFocusOnTask(task) {
  if (task.subjectId) {
    appData.selectedSubjectId = task.subjectId;
  }
  appData.currentSessionDraft.goal = task.text;
  if (sessionGoalInput) sessionGoalInput.value = task.text;
  if (!appData.activeSession) {
    const mins = Number(task.durationMinutes || 25);
    if (mins === 25) {
      const idx = timerModes.findIndex(function (m) { return m.id === "pomodoro"; });
      if (idx >= 0) appData.timerModeIndex = idx;
    } else if (mins === 50) {
      const idx = timerModes.findIndex(function (m) { return m.id === "deep-focus"; });
      if (idx >= 0) appData.timerModeIndex = idx;
    } else if (mins === 90) {
      const idx = timerModes.findIndex(function (m) { return m.id === "ultradian"; });
      if (idx >= 0) appData.timerModeIndex = idx;
    } else {
      const idx = timerModes.findIndex(function (m) { return m.id === "custom"; });
      if (idx >= 0) {
        appData.timerModeIndex = idx;
        appData.customFocusMinutes = mins;
        appData.customBreakMinutes = Math.max(5, Math.round(mins / 5));
      }
    }
  }

  saveData();
  showSection("focus-hub");
  updateAllDisplays();

  if (sessionStartButton && !appData.activeSession) {
    sessionStartButton.scrollIntoView({ behavior: "smooth", block: "center" });
    sessionStartButton.classList.add("focus-pulse-highlight");
    setTimeout(function () {
      sessionStartButton.classList.remove("focus-pulse-highlight");
    }, 2200);
  }
}

function renderTaskSubjectFilter() {
  if (!taskSubjectFilter) return;
  const currentVal = appData.selectedTaskSubjectFilter || "all";
  taskSubjectFilter.innerHTML = '<option value="all">All Subjects</option>';
  appData.subjects.forEach(function (sub) {
    const opt = document.createElement("option");
    opt.value = sub.id;
    opt.textContent = sub.name;
    opt.selected = sub.id === currentVal;
    taskSubjectFilter.appendChild(opt);
  });
  taskSubjectFilter.value = currentVal;
}

function clearCompletedTasks() {
  const completedCount = getCompletedTodayTasks().length;
  if (completedCount === 0) return;
  if (!window.confirm(`Clear ${completedCount} completed task(s)?`)) return;

  const today = getTodayKey();
  appData.tasks = appData.tasks.filter(function (task) {
    if (task.repeat === "daily") {
      if (Array.isArray(task.completedDates)) {
        task.completedDates = task.completedDates.filter(function (d) { return d !== today; });
        task.completed = false;
      }
      return true;
    }
    return !task.completed;
  });

  saveData();
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
  const allPendingTasks = getPendingTodayTasks();
  const completedTasks = getCompletedTodayTasks();

  pendingTaskList.innerHTML = "";
  completedTaskList.innerHTML = "";
  planDateLabel.textContent = new Date().toLocaleDateString(undefined, {
    timeZone: getAccountTimezone(),
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // Calculate estimated workload
  const totalEstMinutes = allPendingTasks.reduce(function (sum, task) {
    return sum + Number(task.durationMinutes || 25);
  }, 0);
  if (planSummaryWorkload) {
    planSummaryWorkload.textContent = formatShortTime(totalEstMinutes * 60);
  }

  // Filter badge counts
  const highPriorityCount = allPendingTasks.filter(function (t) {
    return t.priority === "high" || t.priority === "urgent";
  }).length;
  const todayOnlyCount = allPendingTasks.filter(function (t) {
    return t.date === getTodayKey();
  }).length;
  if (filterCountAll) filterCountAll.textContent = allPendingTasks.length;
  if (filterCountHigh) filterCountHigh.textContent = highPriorityCount;
  if (filterCountToday) filterCountToday.textContent = todayOnlyCount;

  renderTaskSubjectFilter();

  // Active filter state
  const activeFilter = appData.selectedTaskFilter || "all";
  const activeSubject = appData.selectedTaskSubjectFilter || "all";

  taskFilterChips.forEach(function (chip) {
    chip.classList.toggle("active", chip.dataset.taskFilter === activeFilter);
  });

  let filteredPending = allPendingTasks.slice();
  if (activeFilter === "high") {
    filteredPending = filteredPending.filter(function (t) { return t.priority === "high" || t.priority === "urgent"; });
  } else if (activeFilter === "today") {
    filteredPending = filteredPending.filter(function (t) { return t.date === getTodayKey(); });
  }

  if (activeSubject !== "all") {
    filteredPending = filteredPending.filter(function (t) { return t.subjectId === activeSubject; });
  }

  planTaskSummary.textContent = allPendingTasks.length === 0
    ? "Nothing planned yet."
    : `${allPendingTasks.length} open today (${formatShortTime(totalEstMinutes * 60)} est.)`;
  planSummaryPlanned.textContent = getTodayTasks().length;
  planSummaryDone.textContent = completedTasks.length;
  completedTaskSummary.textContent = `Completed (${completedTasks.length})`;
  if (clearCompletedTasksButton) {
    clearCompletedTasksButton.hidden = completedTasks.length === 0;
  }

  renderTaskGroup(pendingTaskList, filteredPending);
  renderTaskGroup(completedTaskList, completedTasks);
}

function renderTaskGroup(listElement, tasks) {
  if (tasks.length === 0) {
    appendSimpleItem(listElement, listElement === pendingTaskList ? "No tasks matching current filter." : "Completed tasks will appear here.");
    return;
  }

  tasks.forEach(function (task) {
    const listItem = document.createElement("li");
    listItem.className = "task-row";
    if (task.completed) listItem.classList.add("completed");
    if (task.priority === "urgent") listItem.classList.add("is-urgent");
    if (task.priority === "high") listItem.classList.add("is-high");
    if (task.subjectId) listItem.style.borderLeft = `3px solid ${getSubjectColorValue(getSubjectById(task.subjectId) || "blue")}`;

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = isTaskCompletedToday(task);
    checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);
    checkbox.addEventListener("change", function () { toggleTask(task.id); });

    const taskContent = document.createElement("span");
    taskContent.className = "task-content";

    const taskHeader = document.createElement("div");
    taskHeader.className = "task-header-line";

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;
    taskHeader.appendChild(taskText);

    if (task.priority && task.priority !== "normal") {
      const priorityBadge = document.createElement("span");
      priorityBadge.className = `task-priority-pill priority-${task.priority}`;
      priorityBadge.textContent = task.priority === "urgent" ? "Urgent" : (task.priority === "high" ? "High" : "Low");
      taskHeader.appendChild(priorityBadge);
    }

    if (task.durationMinutes) {
      const durationBadge = document.createElement("span");
      durationBadge.className = "task-duration-pill";
      durationBadge.textContent = `${task.durationMinutes}m`;
      taskHeader.appendChild(durationBadge);
    }

    const taskMeta = document.createElement("small");
    taskMeta.className = "task-meta";
    const metaParts = [];
    if (task.date) metaParts.push(task.date);
    if (task.subjectId) metaParts.push(getSubjectName(task.subjectId));
    if (task.repeat === "daily") metaParts.push("Daily");
    taskMeta.textContent = metaParts.join(" · ");

    taskContent.appendChild(taskHeader);
    if (taskMeta.textContent) taskContent.appendChild(taskMeta);

    const actionsWrap = document.createElement("div");
    actionsWrap.className = "task-row-actions";

    if (listElement === pendingTaskList) {
      const focusBtn = document.createElement("button");
      focusBtn.type = "button";
      focusBtn.className = "task-focus-button";
      focusBtn.title = `Launch Focus Hub for ${task.text}`;
      focusBtn.innerHTML = "<span>▶ Focus</span>";
      focusBtn.addEventListener("click", function () { startFocusOnTask(task); });
      actionsWrap.appendChild(focusBtn);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.title = "Delete task";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", function () { deleteTask(task.id); });
    actionsWrap.appendChild(deleteButton);

    listItem.appendChild(checkbox);
    listItem.appendChild(taskContent);
    listItem.appendChild(actionsWrap);
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
  const currentGoal = Number(appData.goalHours || 0);
  appData.goalHours = Math.max(0.25, Number((currentGoal + amount).toFixed(2)));
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
  appData.timerModeIndex = timerModes.findIndex(function (mode) { return mode.id === "stopwatch"; });
  if (appData.timerModeIndex < 0) appData.timerModeIndex = 0;
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

  const todayKey = getTodayKey();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = getDateKeyFromDate(new Date(appData.plannerYear, appData.plannerMonth, day));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.classList.toggle("active", dateKey === appData.selectedPlannerDate);
    button.classList.toggle("today", dateKey === todayKey);

    const dayNumber = document.createElement("span");
    dayNumber.className = "calendar-day-num";
    dayNumber.textContent = day;
    button.appendChild(dayNumber);

    const tasksForDay = getTasksForDate(dateKey);
    const examsForDay = appData.exams.filter(function (exam) { return exam.date === dateKey; });
    const sessionsForDay = getCompletedStudySessionsForDate(dateKey);
    const legacyItems = appData.plannerItems.filter(function (item) { return item.date === dateKey; });

    if (tasksForDay.length > 0 || examsForDay.length > 0 || sessionsForDay.length > 0 || legacyItems.length > 0) {
      const dots = document.createElement("span");
      dots.className = "calendar-dots";
      if (tasksForDay.length > 0 || legacyItems.length > 0) {
        dots.appendChild(createCalendarDot("Tasks scheduled", "dot-task"));
      }
      if (examsForDay.length > 0) {
        dots.appendChild(createCalendarDot("Exam scheduled", "dot-exam"));
      }
      if (sessionsForDay.length > 0) {
        dots.appendChild(createCalendarDot("Study logged", "dot-session"));
      }
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

function createCalendarDot(label, customClass) {
  const dot = document.createElement("span");
  dot.className = `calendar-dot ${customClass || ""}`;
  dot.title = label;
  return dot;
}

function formatPlannerType(type) {
  const labels = {
    task: "Task",
    study: "Study Block",
    reminder: "Reminder",
    revisionreminder: "Revision Reminder",
    "revision-reminder": "Revision Reminder"
  };
  return labels[type] || String(type || "Plan").replace(/[-_]/g, " ").replace(/\b\w/g, function (letter) {
    return letter.toUpperCase();
  });
}

function addPlannerItem(event) {
  event.preventDefault();
  const title = plannerTitleInput ? plannerTitleInput.value.trim() : "";
  if (!title) return;

  const newTask = createTask(title, appData.selectedPlannerDate, "", "never", "normal", 25);
  appData.tasks.push(newTask);
  if (plannerTitleInput) plannerTitleInput.value = "";
  saveData();
  renderTasks();
  renderPlanner();
  updateAllDisplays();
}

function renderPlannerItems() {
  const selectedDate = new Date(`${appData.selectedPlannerDate}T00:00:00`);
  const tasksForDay = getTasksForDate(appData.selectedPlannerDate);
  const examsForDay = appData.exams.filter(function (exam) { return exam.date === appData.selectedPlannerDate; });
  const sessionsForDay = getCompletedStudySessionsForDate(appData.selectedPlannerDate);
  const legacyItems = appData.plannerItems.filter(function (item) { return item.date === appData.selectedPlannerDate; });

  selectedDateLabel.textContent = selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const summaryEl = document.getElementById("selected-date-summary");
  if (summaryEl) {
    const parts = [];
    parts.push(`${tasksForDay.length} ${tasksForDay.length === 1 ? "task" : "tasks"}`);
    if (examsForDay.length > 0) parts.push(`${examsForDay.length} ${examsForDay.length === 1 ? "exam" : "exams"}`);
    if (sessionsForDay.length > 0) parts.push(`${sessionsForDay.length} logged`);
    summaryEl.textContent = parts.join(" · ");
  }

  plannerItems.innerHTML = "";

  // 1. Tasks section (Fully synced with Plan & checkboxes!)
  const taskSection = document.createElement("div");
  taskSection.className = "calendar-agenda-group";
  const taskHeader = document.createElement("div");
  taskHeader.className = "calendar-group-header";
  taskHeader.innerHTML = `<h4>Tasks (${tasksForDay.length})</h4>`;
  taskSection.appendChild(taskHeader);

  if (tasksForDay.length === 0) {
    const emptyTask = document.createElement("p");
    emptyTask.className = "muted-text agenda-empty-text";
    emptyTask.textContent = "No tasks scheduled for this day.";
    taskSection.appendChild(emptyTask);
  } else {
    const taskList = document.createElement("ul");
    taskList.className = "task-list shared-list";
    renderTaskGroup(taskList, tasksForDay);
    taskSection.appendChild(taskList);
  }
  plannerItems.appendChild(taskSection);

  // 2. Exams section if any
  if (examsForDay.length > 0) {
    const examSection = document.createElement("div");
    examSection.className = "calendar-agenda-group";
    examSection.innerHTML = `<div class="calendar-group-header"><h4>Exams (${examsForDay.length})</h4></div>`;
    const examList = document.createElement("div");
    examList.className = "calendar-agenda-sublist";
    examsForDay.forEach(function (exam) {
      const card = document.createElement("article");
      card.className = "planner-item exam-item";
      card.innerHTML = `<strong>${exam.name}</strong><small>${exam.category || "Target Exam"}</small>`;
      const action = document.createElement("button");
      action.type = "button";
      action.className = "text-button";
      action.textContent = "Open Exam";
      action.addEventListener("click", function () { openExamWorkspace(exam.id); });
      card.appendChild(action);
      examList.appendChild(card);
    });
    examSection.appendChild(examList);
    plannerItems.appendChild(examSection);
  }

  // 3. Study Sessions section if any
  if (sessionsForDay.length > 0) {
    const sessionSection = document.createElement("div");
    sessionSection.className = "calendar-agenda-group";
    sessionSection.innerHTML = `<div class="calendar-group-header"><h4>Study Sessions Logged (${sessionsForDay.length})</h4></div>`;
    const sessionList = document.createElement("div");
    sessionList.className = "calendar-agenda-sublist";
    sessionsForDay.forEach(function (session) {
      const card = document.createElement("article");
      card.className = "planner-item session-log-item";
      card.innerHTML = `<strong>${session.subjectName || getSubjectName(session.subjectId)}</strong><small>${formatShortTime(session.durationSeconds)} · ${session.mode || "Timer"}</small>`;
      sessionList.appendChild(card);
    });
    sessionSection.appendChild(sessionList);
    plannerItems.appendChild(sessionSection);
  }

  // 4. Legacy planner items if any
  if (legacyItems.length > 0) {
    const legacySection = document.createElement("div");
    legacySection.className = "calendar-agenda-group";
    legacySection.innerHTML = `<div class="calendar-group-header"><h4>Reminders &amp; Notes (${legacyItems.length})</h4></div>`;
    const legList = document.createElement("div");
    legList.className = "calendar-agenda-sublist";
    legacyItems.forEach(function (item) {
      const card = document.createElement("article");
      card.className = "planner-item";
      card.innerHTML = `<strong>${item.title}</strong><small>${formatPlannerType(item.type)}</small>`;
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "delete-button";
      delBtn.textContent = "×";
      delBtn.title = "Delete";
      delBtn.addEventListener("click", function () { deletePlannerItem(item.id); });
      card.appendChild(delBtn);
      legList.appendChild(card);
    });
    legacySection.appendChild(legList);
    plannerItems.appendChild(legacySection);
  }
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
  if (!dateKey) return "Date not set";
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
  next.innerHTML = `<h3>Next Planned Step</h3><p class="muted-text">${nextMilestone ? escapeHtml(nextMilestone.title) : "No milestones yet. Create the next thing you want to finish."}</p>`;
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
  summary.innerHTML = `<strong>${escapeHtml(subject.name)}</strong><span>${stats.progressPercent}%</span>`;
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
  summary.innerHTML = `<strong>${escapeHtml(chapter.name)}</strong><span>${stats.completedTopics}/${stats.totalTopics}</span>`;
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
    row.innerHTML = `<span>${escapeHtml(subject.name)}</span><strong>${subjectStats.progressPercent}%</strong>`;
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
    time: formatClockTime(now.toISOString()),
    date: getTodayKey(),
    timestamp: now.toISOString(),
    sessionId: appData.activeSession ? appData.activeSession.id : null
  });

  distractionInput.value = "";
  saveData();
  renderDistractions();
  updateHome();
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

  leaderboardTabs.forEach(function (tab) {
    const isActive = tab.dataset.leaderboardRange === range;
    tab.classList.toggle("active", isActive);
    tab.classList.toggle("secondary-button", !isActive);
  });

  studyMateApi(`leaderboard?range=${range}`)
    .then(function (response) {
      if (!response.rows || response.rows.length === 0) {
        appendSimpleItem(leaderboardTable, "No leaderboard activity yet.");
        return;
      }

      response.rows.forEach(function (user, index) {
        const row = document.createElement("div");
        row.className = "leaderboard-row";
        row.innerHTML = `
          <strong>#${index + 1}</strong>
          <span class="group-avatar">${escapeHtml(getInitials(user.name))}</span>
          <span>${escapeHtml(user.name)}</span>
          <span>${formatShortTime(user.totalSeconds)}</span>
        `;
        leaderboardTable.appendChild(row);
      });
    })
    .catch(function (error) {
      appendSimpleItem(leaderboardTable, error.message);
    });
}

function renderThemes() {
  themeGrid.innerHTML = "";
  themes.forEach(function (theme) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-option";
    button.innerHTML = `
      <div class="theme-option-header">
        <span class="theme-radio-dot"></span>
        <strong>${theme.name}</strong>
      </div>
      <span class="theme-option-desc">${theme.desc || ""}</span>
      <div class="theme-preview-pill">
        <span class="theme-preview-chip primary" style="background:${theme.accent}"></span>
        <span class="theme-preview-chip secondary" style="background:${theme.secondaryAccent}"></span>
      </div>
    `;
    button.classList.toggle("active", appData.theme === theme.id);
    button.addEventListener("click", function () {
      appData.theme = theme.id;
      studyMateUser.preferredTheme = theme.id;
      try {
        localStorage.setItem("studymate-theme", theme.id);
      } catch (e) {}
      appData.accentColor = null;
      applyAppearance();
      saveData();
      studyMateApi("profile", {
        method: "PATCH",
        body: JSON.stringify({ preferredTheme: theme.id })
      }).then(function (response) {
        updateProfileState(response.profile);
      }).catch(function (error) {
        console.warn(error.message);
      });
      renderThemes();
    });
    themeGrid.appendChild(button);
  });
}

function openProfileModal() {
  profileNameInput.value = studyMateUser.displayName || "";
  profileUsernameInput.value = studyMateUser.username || "";
  profileBioInput.value = studyMateUser.bio || "";
  profileCountryInput.value = studyMateUser.country || "";
  profileTimezoneInput.value = studyMateUser.timezone || "Asia/Kolkata";
  if (profileStudyDayStartInput) profileStudyDayStartInput.value = studyMateUser.studyDayStartTime || "00:00";
  profileAvatarStyleInput.value = studyMateUser.avatarStyle || "initials";
  profileAvatarColorInput.value = studyMateUser.avatarColor || "teal";
  renderAvatarChoices();
  renderProfile();
  profileModal.hidden = false;
  document.body.classList.add("modal-open");
  profileNameInput.focus();
}

function closeProfileModal() {
  profileModal.hidden = true;
  document.body.classList.remove("modal-open");
}

async function saveProfile(event) {
  event.preventDefault();
  await saveProfilePayload({
    displayName: profileNameInput.value.trim(),
    username: profileUsernameInput.value.trim(),
    bio: profileBioInput.value.trim(),
    country: profileCountryInput.value.trim(),
    timezone: profileTimezoneInput.value.trim(),
    studyDayStartTime: profileStudyDayStartInput ? profileStudyDayStartInput.value : "00:00",
    avatarStyle: profileAvatarStyleInput.value,
    avatarColor: profileAvatarColorInput.value
  });
  closeProfileModal();
}

function getCurrentTheme() {
  return themes.find(function (theme) {
    return theme.id === appData.theme;
  }) || themes[0];
}

function applyAppearance() {
  if (appData.theme !== "light" && appData.theme !== "dark") {
    appData.theme = (studyMateUser.preferredTheme === "light" ? "light" : "dark");
  }
  const theme = getCurrentTheme();
  document.body.dataset.theme = appData.theme;
  document.documentElement.setAttribute("data-theme", appData.theme);
  try {
    localStorage.setItem("studymate-theme", appData.theme);
  } catch (e) {}
  document.documentElement.style.removeProperty("--primary");
  document.documentElement.style.removeProperty("--primary-dark");
  document.documentElement.style.removeProperty("--accent");
  if (accentInput) {
    accentInput.value = theme.accent;
  }
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

function openBannerPicker() {
  openProfileModal();
  if (profileBannerUpload) profileBannerUpload.click();
}

function toggleSidebar() {
  appData.sidebarCollapsed = !appData.sidebarCollapsed;
  applySidebarState();
  saveData();
}

function applySidebarState() {
  document.body.classList.toggle("sidebar-collapsed", appData.sidebarCollapsed);
}

function showSettingsSection(sectionName) {
  if (!settingsTabs) return;
  const headings = {
    profile: ["Profile", "Your StudyMate identity"],
    appearance: ["Appearance", "Make the workspace yours"],
    privacy: ["Privacy", "Control what others can see"],
    account: ["Account", "Manage your StudyMate account"]
  };
  const heading = headings[sectionName] || headings.profile;
  if (settingsHeadingLabel) settingsHeadingLabel.textContent = heading[0];
  if (settingsHeadingTitle) settingsHeadingTitle.textContent = heading[1];
  settingsTabs.querySelectorAll("button").forEach(function (button) {
    button.classList.toggle("active", button.dataset.settingsTab === sectionName);
  });
  settingsSections.forEach(function (section) {
    const isActive = section.dataset.settingsSection === sectionName;
    section.hidden = !isActive;
    section.classList.toggle("active", isActive);
  });
}

async function savePrivacySettings() {
  if (!leaderboardVisibilityInput) return;
  await saveProfilePayload({
    leaderboardVisibility: leaderboardVisibilityInput.value
  });
  renderLeaderboard();
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
  renderGroupChat(circle);
}

async function openGroupWorkspace(circleId) {
  appData.selectedCircleId = circleId;
  appData.groupsView = "workspace";
  appData.selectedCircleTab = appData.selectedCircleTab || "overview";
  try {
    const response = await studyMateApi(`groups/${circleId}`);
    upsertStudyCircle(response.group);
  } catch (error) {
    console.warn(error.message);
  }
  updateLibraryGroupTitle();
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
    appendSimpleItem(groupStudyingNow, "No one is studying right now.");
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
      <span class="group-avatar">${escapeHtml(getInitials(member.name))}</span>
      <span><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.role)}</small></span>
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
  header.innerHTML = "<span>Rank</span><span>Name</span><span>Study time</span>";
  groupRankingList.appendChild(header);

  studyMateApi(`leaderboard?range=${appData.selectedRankingRange}&groupId=${circle.id}`)
    .then(function (response) {
      if (!response.rows || response.rows.length === 0) {
        appendSimpleItem(groupRankingList, "No study time yet for this range.");
        return;
      }

      response.rows.forEach(function (member, index) {
        const row = document.createElement("div");
        row.className = "ranking-row";
        row.innerHTML = `<span>#${index + 1}</span><span>${escapeHtml(member.name)}</span><span>${formatShortTime(member.totalSeconds)}</span>`;
        groupRankingList.appendChild(row);
      });
    })
    .catch(function (error) {
      appendSimpleItem(groupRankingList, error.message);
    });
}

function renderGroupChat(circle) {
  if (!groupChatMessages) return;
  groupChatMessages.innerHTML = "";

  if (!circle.messages || circle.messages.length === 0) {
    appendSimpleItem(groupChatMessages, "No messages yet.");
    return;
  }

  circle.messages.forEach(function (message) {
    const row = document.createElement("div");
    row.className = "mock-bubble";
    const name = (message.user && message.user.displayName) || "Student";
    row.innerHTML = `<strong>${escapeHtml(name)}</strong><span>${escapeHtml(message.message)}</span><small>${escapeHtml(formatActivityTime(message.createdAt))}</small>`;
    groupChatMessages.appendChild(row);
  });
}

async function sendGroupMessage(event) {
  event.preventDefault();
  const circle = getSelectedCircle();
  const message = groupChatInput.value.trim();
  if (!circle || !message) return;

  try {
    await studyMateApi(`groups/${circle.id}/messages`, {
      method: "POST",
      body: JSON.stringify({ message })
    });
    groupChatInput.value = "";
    const response = await studyMateApi(`groups/${circle.id}`);
    upsertStudyCircle(response.group);
    renderStudyCircles();
  } catch (error) {
    console.warn(error.message);
  }
}

let groupChatPollId = null;

async function pollGroupChat() {
  if (document.hidden) return;
  const circle = getSelectedCircle();
  if (!circle || appData.groupsView !== "workspace" || appData.selectedCircleTab !== "chat") return;

  try {
    const response = await studyMateApi(`groups/${circle.id}/messages`);
    const latest = (response.messages || []).map(normalizeGroupMessage);
    const known = circle.messages || [];
    const sameLast = latest.length && known.length && latest[latest.length - 1].id === known[known.length - 1].id;
    if (sameLast && latest.length === known.length) return;
    circle.messages = latest;
    renderGroupChat(circle);
    groupChatMessages.scrollTop = groupChatMessages.scrollHeight;
  } catch (error) {
    console.warn(error.message);
  }
}

if (!groupChatPollId) groupChatPollId = setInterval(pollGroupChat, 5000);

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

async function saveGroup(event) {
  event.preventDefault();
  const selectedCircle = getSelectedCircle();
  const circleName = groupNameInput.value.trim();
  const circleIcon = groupIconInput.value.trim().slice(0, 3).toUpperCase() || getInitials(circleName);
  const circleDescription = groupDescriptionInput.value.trim() || "A shared StudyMate group.";
  if (!circleName) return;

  try {
    const payload = {
      name: circleName,
      icon: circleIcon,
      description: circleDescription
    };
    const response = selectedCircle && groupForm.dataset.mode === "edit"
      ? await studyMateApi(`groups/${selectedCircle.id}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await studyMateApi("groups", { method: "POST", body: JSON.stringify(payload) });
    const savedCircle = upsertStudyCircle(response.group);
    appData.selectedCircleId = savedCircle.id;
    appData.groupsView = "workspace";
    appData.selectedCircleTab = "overview";
    closeGroupModal();
    renderStudyCircles();
  } catch (error) {
    console.warn(error.message);
  }
}

async function deleteSelectedGroup() {
  const circle = getSelectedCircle();
  if (!circle) return;
  if (!confirm(`Delete ${circle.name}?`)) return;

  try {
    await studyMateApi(`groups/${circle.id}`, { method: "DELETE" });
    appData.studyCircles = appData.studyCircles.filter(function (candidate) { return String(candidate.id) !== String(circle.id); });
    appData.selectedCircleId = null;
    appData.groupsView = "list";
    if (appData.activeRoomId && !getRoomById(appData.activeRoomId)) appData.activeRoomId = null;
    closeGroupModal();
    renderStudyCircles();
  } catch (error) {
    console.warn(error.message);
  }
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

async function joinGroupByCode(event) {
  event.preventDefault();
  const code = joinCodeInput.value.trim().toUpperCase();

  try {
    const response = await studyMateApi("groups/join", {
      method: "POST",
      body: JSON.stringify({ inviteCode: code })
    });
    const circle = upsertStudyCircle(response.group);
    appData.selectedCircleId = circle.id;
    appData.groupsView = "workspace";
    appData.selectedCircleTab = "overview";
    closeJoinGroupModal();
    renderStudyCircles();
  } catch (error) {
    joinGroupMessage.textContent = error.message;
  }
}

function openInviteModal() {
  const circle = getSelectedCircle();
  if (!circle) return;
  inviteModal.hidden = false;
  inviteCodeDisplay.textContent = circle.inviteCode;
  inviteCopyMessage.textContent = "Share this code with another StudyMate account.";
}

function closeInviteModal() {
  inviteModal.hidden = true;
}

function copyInviteCode() {
  const circle = getSelectedCircle();
  if (!circle) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(circle.inviteCode);
    inviteCopyMessage.textContent = "Code copied.";
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
    description: "A focus room.",
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
    activeRoomDescription.textContent = "Join a room to see the session.";
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
    duo: "Duo challenges combine two members per pair.",
    teams: "Team challenges combine larger groups.",
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
        <h3>${escapeHtml(challenge.title)}</h3>
        <p class="muted-text">${formatChallengeFormat(challenge.format)} - ${formatChallengeMetric(challenge.metric)} - ${getChallengeTimeLabel(challenge)}</p>
      </div>
      <span class="status-pill">${status}</span>
    </div>
    <div class="challenge-progress">
      <span>${challenge.format === "group-goal" ? "Group progress" : "Current leader"}</span>
      <strong>${challenge.format === "group-goal" ? `${formatChallengeValue(challenge.progress, challenge.metric)} / ${formatChallengeValue(challenge.target, challenge.metric)}` : `${escapeHtml(leader.name)} - ${formatChallengeValue(leader.progress, challenge.metric)}`}</strong>
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
      <h3>${escapeHtml(challenge.title)}</h3>
      <p class="muted-text">${getChallengeTimeLabel(challenge)}</p>
    </div>
    <div class="summary-strip compact">
      <div><span>Status</span><strong>${status}</strong></div>
      <div><span>${isGroupGoal ? "Progress" : "Leader"}</span><strong>${isGroupGoal ? `${formatChallengeValue(challenge.progress, challenge.metric)} / ${formatChallengeValue(challenge.target, challenge.metric)}` : escapeHtml(leader.name)}</strong></div>
      <div><span>Your progress</span><strong>${formatChallengeValue(challenge.yourProgress, challenge.metric)}</strong></div>
    </div>
  `;
  challengeDetailContent.appendChild(header);

  if (result) {
    const resultBox = document.createElement("article");
    resultBox.className = "challenge-result-box";
    resultBox.innerHTML = `<h3>${escapeHtml(isGroupGoal ? result.title : "Challenge Complete")}</h3><p>${escapeHtml(result.copy)}</p>`;
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
    row.innerHTML = `<span>${isGroupGoal ? "" : `#${index + 1}`}</span><span>${escapeHtml(entry.name)}<small>${escapeHtml(getEntryMembers(entry, circle))}</small></span><span>${formatChallengeValue(entry.progress, challenge.metric)}</span><span>${getEntryPercent(entry, challenge)}%</span><span>${entry.memberIds.includes("you") ? "You" : ""}</span>`;
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
  return formatClockTime(dateString);
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
homeAddSubject.addEventListener("click", openSubjectModal);
homeSubjectSelect.addEventListener("change", function () {
  if (appData.activeSession) {
    homeSubjectSelect.value = appData.activeSession.subjectId || "";
    return;
  }
  appData.selectedSubjectId = homeSubjectSelect.value;
  saveData();
  renderSubjectOptions();
});
timelinePrevDay.addEventListener("click", function () { changeTimelineDate(-1); });
timelineNextDay.addEventListener("click", function () { changeTimelineDate(1); });
timelineTodayButton.addEventListener("click", function () { selectTimelineDate(getTodayKey()); });
timelineDateInput.addEventListener("change", function () { selectTimelineDate(timelineDateInput.value); });
openStudyLogModalButton.addEventListener("click", function () { openStudyLogModal(null); });
if (focusOpenStudyLogModalButton) {
  focusOpenStudyLogModalButton.addEventListener("click", function () { openStudyLogModal(null, getTodayKey()); });
}
sessionStartButton.addEventListener("click", startSession);
sessionPauseButton.addEventListener("click", function () { pauseSession(true); });
sessionFinishButton.addEventListener("click", finishSession);
sessionDiscardButton.addEventListener("click", function () { discardActiveSession(true); });
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
closeStudyLogModalButton.addEventListener("click", closeStudyLogModal);
studyLogModal.addEventListener("click", function (event) {
  if (event.target === studyLogModal) closeStudyLogModal();
});
studyLogForm.addEventListener("submit", saveStudyLog);
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
if (inlineTaskForm && inlineTaskInput) {
  inlineTaskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const taskText = inlineTaskInput.value.trim();
    if (!taskText) return;
    const priority = inlineTaskPriority ? inlineTaskPriority.value : "normal";
    const duration = inlineTaskDuration ? Number(inlineTaskDuration.value) || 25 : 25;
    appData.tasks.push(createTask(taskText, getTodayKey(), "", "never", priority, duration));
    inlineTaskInput.value = "";
    saveData();
    renderTasks();
    updateAllDisplays();
  });
}
goalForm.addEventListener("submit", saveGoal);
goalDecreaseButton.addEventListener("click", function () { changeGoalBy(-0.5); });
goalIncreaseButton.addEventListener("click", function () { changeGoalBy(0.5); });

if (clearCompletedTasksButton) {
  clearCompletedTasksButton.addEventListener("click", clearCompletedTasks);
}

taskFilterChips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    appData.selectedTaskFilter = chip.dataset.taskFilter || "all";
    saveData();
    renderTasks();
  });
});

if (taskSubjectFilter) {
  taskSubjectFilter.addEventListener("change", function () {
    appData.selectedTaskSubjectFilter = taskSubjectFilter.value;
    saveData();
    renderTasks();
  });
}

if (timerPresetsBar) {
  timerPresetsBar.querySelectorAll(".preset-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (appData.activeSession) return;
      const preset = chip.dataset.preset;
      const targetIdx = timerModes.findIndex(function (m) { return m.id === preset; });
      if (targetIdx >= 0) {
        appData.timerModeIndex = targetIdx;
      }
      saveData();
      updateSessionPage();
    });
  });
}

if (chimeToggleBtn) {
  chimeToggleBtn.addEventListener("click", function () {
    appData.chimeEnabled = appData.chimeEnabled === false;
    saveData();
    updateSessionPage();
    if (appData.chimeEnabled && typeof playCompletionChime === "function") {
      playCompletionChime();
    }
  });
}

if (taskHudCheckbox) {
  taskHudCheckbox.addEventListener("change", function () {
    if (!appData.activeSession) return;
    const isChecked = taskHudCheckbox.checked;
    appData.activeSession.isTaskCompleted = isChecked;
    const currentGoal = appData.activeSession.goal || "";
    let matchingTask = appData.tasks.find(function (t) {
      return (appData.activeSession.taskId && t.id === appData.activeSession.taskId)
        || (t.text && t.text.toLowerCase().trim() === currentGoal.toLowerCase().trim());
    });
    if (matchingTask) {
      if (matchingTask.repeat === "daily") {
        const today = getTodayKey();
        matchingTask.completedDates = Array.isArray(matchingTask.completedDates) ? matchingTask.completedDates : [];
        if (isChecked && !matchingTask.completedDates.includes(today)) matchingTask.completedDates.push(today);
        if (!isChecked) matchingTask.completedDates = matchingTask.completedDates.filter(function (d) { return d !== today; });
        matchingTask.completed = matchingTask.completedDates.includes(today);
      } else {
        matchingTask.completed = isChecked;
      }
    } else if (isChecked && currentGoal) {
      const newTask = createTask(currentGoal, getTodayKey(), appData.activeSession.subjectId || "", "never");
      newTask.completed = true;
      appData.tasks.push(newTask);
      appData.activeSession.taskId = newTask.id;
    }
    saveData();
    renderTasks();
    updateSessionPage();
  });
}

if (taskHudNote) {
  let noteTimeout = null;
  taskHudNote.addEventListener("input", function () {
    if (!appData.activeSession) return;
    appData.activeSession.sessionNotes = taskHudNote.value;
    clearTimeout(noteTimeout);
    noteTimeout = setTimeout(function () {
      saveData();
      if (taskHudNoteFeedback) {
        taskHudNoteFeedback.hidden = false;
        setTimeout(function () { taskHudNoteFeedback.hidden = true; }, 1600);
      }
    }, 400);
  });
}

document.addEventListener("keydown", function (event) {
  const activeEl = document.activeElement;
  const isInputActive = activeEl && (
    activeEl.tagName === "INPUT" ||
    activeEl.tagName === "TEXTAREA" ||
    activeEl.tagName === "SELECT" ||
    activeEl.isContentEditable
  );

  if (event.key === "Escape") {
    if (taskModal && !taskModal.hidden) closeTaskModal();
    if (subjectModal && !subjectModal.hidden) closeSubjectModal();
    if (focusDistractionModal && !focusDistractionModal.hidden) closeFocusDistractionModal();
    return;
  }

  if (isInputActive) return;

  if (event.code === "Space") {
    const focusSection = document.getElementById("focus-hub");
    if (focusSection && focusSection.classList.contains("active")) {
      event.preventDefault();
      if (appData.activeSession) {
        toggleSessionPause();
      } else if (!appData.pendingSessionReview) {
        startSession();
      }
    }
  } else if (event.key === "d" || event.key === "D") {
    if (appData.activeSession) {
      event.preventDefault();
      openFocusDistractionModal();
    }
  }
});
openTaskModalButton.addEventListener("click", openTaskModal);
closeTaskModalButton.addEventListener("click", closeTaskModal);
taskModal.addEventListener("click", handleTaskModalBackdrop);
plannerPrev.addEventListener("click", function () { changePlannerMonth(-1); });
plannerNext.addEventListener("click", function () { changePlannerMonth(1); });
plannerForm.addEventListener("submit", addPlannerItem);

const calendarQuickTaskForm = document.getElementById("calendar-quick-task-form");
if (calendarQuickTaskForm) {
  calendarQuickTaskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const input = document.getElementById("calendar-quick-task-input");
    const priInput = document.getElementById("calendar-quick-task-priority");
    if (!input) return;
    const title = input.value.trim();
    if (!title) return;
    const priority = priInput ? priInput.value : "normal";
    const targetDate = appData.selectedPlannerDate || getTodayKey();
    const newTask = createTask(title, targetDate, "", "never", priority, 25);
    appData.tasks.push(newTask);
    input.value = "";
    saveData();
    renderTasks();
    renderPlanner();
    updateAllDisplays();
  });
}

const calendarJumpToday = document.getElementById("calendar-jump-today");
if (calendarJumpToday) {
  calendarJumpToday.addEventListener("click", function () {
    const today = new Date();
    appData.plannerYear = today.getFullYear();
    appData.plannerMonth = today.getMonth();
    appData.selectedPlannerDate = getTodayKey();
    saveData();
    renderPlanner();
  });
}
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
editProfileButton.addEventListener("click", openProfileModal);
if (profileBanner) profileBanner.addEventListener("click", openBannerPicker);
closeProfileModalButton.addEventListener("click", closeProfileModal);
profileModal.addEventListener("click", function (event) {
  if (event.target === profileModal) closeProfileModal();
});
profileForm.addEventListener("submit", saveProfile);
profileAvatarUpload.addEventListener("change", function () { uploadAvatar(profileAvatarUpload, profileAvatarHelp); });
profileAvatarRemove.addEventListener("click", function () { removeAvatar(profileAvatarHelp); });
profileBannerUpload.addEventListener("change", function () { uploadBanner(profileBannerUpload, profileBannerHelp); });
profileBannerRemove.addEventListener("click", function () { removeBanner(profileBannerHelp); });
if (leaderboardVisibilityInput) leaderboardVisibilityInput.addEventListener("change", savePrivacySettings);
onboardingStartButton.addEventListener("click", function () { showOnboardingStep(2); });
onboardingBasicsNext.addEventListener("click", async function () {
  await saveOnboardingBasics();
  showOnboardingStep(3);
});
onboardingSkipBasics.addEventListener("click", function () { showOnboardingStep(3); });
onboardingExamsNext.addEventListener("click", async function () {
  await saveOnboardingExams();
  showOnboardingStep(4);
});
onboardingSkipExams.addEventListener("click", function () { showOnboardingStep(4); });
onboardingSubjectsNext.addEventListener("click", async function () {
  await saveOnboardingSubjects();
  showOnboardingStep(5);
});
onboardingSkipSubjects.addEventListener("click", function () { showOnboardingStep(5); });
onboardingAvatarUpload.addEventListener("change", function () { uploadAvatar(onboardingAvatarUpload, onboardingAvatarHelp); });
onboardingAvatarRemove.addEventListener("click", function () { removeAvatar(onboardingAvatarHelp); });
onboardingProfileForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  await saveProfilePayload({
    displayName: onboardingDisplayName.value.trim(),
    username: onboardingUsername.value.trim() || studyMateUser.username,
    country: onboardingCountry.value.trim(),
    timezone: onboardingTimezone.value.trim() || "Asia/Kolkata",
    bio: onboardingBio.value.trim(),
    avatarStyle: onboardingAvatarStyle.value,
    avatarColor: onboardingAvatarColor.value || studyMateUser.avatarColor || "teal",
    onboardingCompleted: true
  });
  onboardingModal.hidden = true;
});
onboardingFinishSkip.addEventListener("click", async function () {
  await saveProfilePayload({ onboardingCompleted: true });
  onboardingModal.hidden = true;
});
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
if (groupChatForm) groupChatForm.addEventListener("submit", sendGroupMessage);
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

if (importLocalDataButton) {
  importLocalDataButton.addEventListener("click", importLegacyLocalData);
}

if (settingsTabs) {
  settingsTabs.querySelectorAll("button").forEach(function (button) {
    button.addEventListener("click", function () {
      showSettingsSection(button.dataset.settingsTab);
    });
  });
}

// --- Focus: Ambient Sound Engine ---
let ambientAudioCtx = null;
let ambientSourceNode = null;
let ambientGainNode = null;
let ambientIsPlaying = false;
let ambientIntervals = [];

function clearAmbientIntervals() {
  ambientIntervals.forEach(function (id) { clearInterval(id); });
  ambientIntervals = [];
}

function playCompletionChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = ambientAudioCtx || new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    // Sweet, soft 3-note ascending chime: C5 (523Hz), E5 (659Hz), G5 (784Hz)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach(function (freq, index) {
      const startTime = ctx.currentTime + index * 0.16;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.9);
    });
  } catch (err) {
    console.warn("Chime error:", err);
  }
}

function initAmbientSoundEngine() {
  const toggleBtn = document.getElementById("ambient-toggle-btn");
  const soundSelect = document.getElementById("ambient-sound-select");
  const volumeSlider = document.getElementById("ambient-volume");
  const btnIcon = document.getElementById("ambient-btn-icon");
  const btnLabel = document.getElementById("ambient-btn-label");

  if (!toggleBtn || !soundSelect) return;

  function getAudioContext() {
    if (!ambientAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ambientAudioCtx = new AudioCtx();
    }
    if (ambientAudioCtx && ambientAudioCtx.state === "suspended") {
      ambientAudioCtx.resume();
    }
    return ambientAudioCtx;
  }

  function stopAmbientSound() {
    clearAmbientIntervals();
    if (ambientSourceNode) {
      try {
        if (typeof ambientSourceNode.stop === "function") ambientSourceNode.stop();
        if (typeof ambientSourceNode.disconnect === "function") ambientSourceNode.disconnect();
      } catch (e) {}
      ambientSourceNode = null;
    }
    ambientIsPlaying = false;
    if (btnIcon) btnIcon.textContent = "▶";
    if (btnLabel) btnLabel.textContent = "Ambient";
    toggleBtn.classList.remove("playing");
  }

  function createBrownNoiseBuffer(ctx, durationSeconds) {
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
      }
    }
    return buffer;
  }

  function startAmbientSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopAmbientSound();

    let currentSound = soundSelect.value || "rain";
    if (currentSound === "cafe") currentSound = "chords";
    if (currentSound === "white") currentSound = "brown";

    const vol = volumeSlider ? Number(volumeSlider.value) : 0.3;
    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime(vol, ctx.currentTime);
    ambientGainNode.connect(ctx.destination);

    if (currentSound === "chords") {
      // Warm, lush polyphonic Lo-Fi study chords pad
      const chords = [
        [130.81, 196.00, 246.94, 329.63], // Cmaj7
        [110.00, 164.81, 220.00, 261.63], // Am7
        [87.31, 130.81, 174.61, 220.00],  // Fmaj7
        [98.00, 146.83, 196.00, 246.94]   // G6
      ];
      let chordIndex = 0;
      const activeVoices = [];

      function playNextChord() {
        const chordNotes = chords[chordIndex % chords.length];
        chordIndex++;
        const chordGain = ctx.createGain();
        chordGain.gain.setValueAtTime(0, ctx.currentTime);
        chordGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 1.6);
        chordGain.gain.setValueAtTime(0.28, ctx.currentTime + 4.2);
        chordGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 6.0);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(460, ctx.currentTime);

        const oscs = chordNotes.map(function (freq, i) {
          const osc = ctx.createOscillator();
          osc.type = i === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);
          osc.connect(filter);
          osc.start();
          return osc;
        });

        filter.connect(chordGain);
        chordGain.connect(ambientGainNode);

        const voiceObj = { oscs: oscs, gain: chordGain, filter: filter };
        activeVoices.push(voiceObj);

        setTimeout(function () {
          oscs.forEach(function (o) { try { o.stop(); o.disconnect(); } catch (e) {} });
          try { chordGain.disconnect(); filter.disconnect(); } catch (e) {}
          const idx = activeVoices.indexOf(voiceObj);
          if (idx !== -1) activeVoices.splice(idx, 1);
        }, 6200);
      }

      playNextChord();
      const chordInterval = setInterval(playNextChord, 5200);
      ambientIntervals.push(chordInterval);

      ambientSourceNode = {
        stop: function () {
          activeVoices.forEach(function (v) {
            v.oscs.forEach(function (o) { try { o.stop(); o.disconnect(); } catch (e) {} });
            try { v.gain.disconnect(); } catch (e) {}
          });
        },
        disconnect: function () {
          try { ambientGainNode.disconnect(); } catch (e) {}
        }
      };

    } else if (currentSound === "binaural") {
      // 432Hz Calm Alpha Wave (432Hz + 442Hz = 10Hz Alpha beat) + 216Hz warm drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);

      osc1.frequency.setValueAtTime(432, ctx.currentTime);
      osc2.frequency.setValueAtTime(442, ctx.currentTime);
      sub.frequency.setValueAtTime(216, ctx.currentTime);

      osc1.type = "sine";
      osc2.type = "sine";
      sub.type = "sine";

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.35, ctx.currentTime);
      sub.connect(subGain);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(520, ctx.currentTime);

      osc1.connect(merger, 0, 0);
      osc2.connect(merger, 0, 1);
      subGain.connect(merger, 0, 0);
      subGain.connect(merger, 0, 1);

      merger.connect(filter);
      filter.connect(ambientGainNode);

      osc1.start();
      osc2.start();
      sub.start();

      ambientSourceNode = {
        stop: function () {
          try { osc1.stop(); osc2.stop(); sub.stop(); } catch (e) {}
        },
        disconnect: function () {
          try { osc1.disconnect(); osc2.disconnect(); sub.disconnect(); merger.disconnect(); } catch (e) {}
        }
      };

    } else if (currentSound === "rain") {
      // Soft window rain: smooth continuous brown noise + gentle organic droplet impulses
      const rainBuffer = createBrownNoiseBuffer(ctx, 6);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = rainBuffer;
      noiseSource.loop = true;

      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = "highpass";
      hpFilter.frequency.setValueAtTime(160, ctx.currentTime);

      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.setValueAtTime(920, ctx.currentTime);

      noiseSource.connect(hpFilter);
      hpFilter.connect(lpFilter);
      lpFilter.connect(ambientGainNode);
      noiseSource.start();

      // Soft raindrop taps
      const dropInterval = setInterval(function () {
        if (!ambientIsPlaying) return;
        const dropFreq = 750 + Math.random() * 600;
        const dropOsc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        dropOsc.type = "sine";
        dropOsc.frequency.setValueAtTime(dropFreq, ctx.currentTime);
        dropGain.gain.setValueAtTime(0.04, ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
        dropOsc.connect(dropGain);
        dropGain.connect(ambientGainNode);
        dropOsc.start();
        dropOsc.stop(ctx.currentTime + 0.04);
      }, 160);
      ambientIntervals.push(dropInterval);

      ambientSourceNode = {
        stop: function () { try { noiseSource.stop(); } catch (e) {} },
        disconnect: function () { try { noiseSource.disconnect(); hpFilter.disconnect(); lpFilter.disconnect(); } catch (e) {} }
      };

    } else if (currentSound === "waves") {
      // Gentle ocean waves: brown noise swept by slow 0.08Hz tide LFO
      const waveBuffer = createBrownNoiseBuffer(ctx, 8);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = waveBuffer;
      noiseSource.loop = true;

      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = "lowpass";
      waveFilter.frequency.setValueAtTime(350, ctx.currentTime);

      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.5, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // ~12.5s cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(260, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(waveFilter.frequency);

      noiseSource.connect(waveFilter);
      waveFilter.connect(waveGain);
      waveGain.connect(ambientGainNode);

      lfo.start();
      noiseSource.start();

      ambientSourceNode = {
        stop: function () { try { noiseSource.stop(); lfo.stop(); } catch (e) {} },
        disconnect: function () { try { noiseSource.disconnect(); lfo.disconnect(); waveFilter.disconnect(); waveGain.disconnect(); } catch (e) {} }
      };

    } else if (currentSound === "forest") {
      // Forest breeze + soft pentatonic wind bells
      const breezeBuffer = createBrownNoiseBuffer(ctx, 6);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = breezeBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(580, ctx.currentTime);
      filter.Q.setValueAtTime(0.9, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(ambientGainNode);
      noiseSource.start();

      // Soft wind chime tones
      const bells = [659.25, 783.99, 880.00, 987.77, 1174.66, 1318.51];
      const bellInterval = setInterval(function () {
        if (!ambientIsPlaying) return;
        if (Math.random() < 0.45) return;
        const bellFreq = bells[Math.floor(Math.random() * bells.length)];
        const bellOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bellOsc.type = "sine";
        bellOsc.frequency.setValueAtTime(bellFreq, ctx.currentTime);
        bGain.gain.setValueAtTime(0.04, ctx.currentTime);
        bGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
        bellOsc.connect(bGain);
        bGain.connect(ambientGainNode);
        bellOsc.start();
        bellOsc.stop(ctx.currentTime + 1.45);
      }, 2600);
      ambientIntervals.push(bellInterval);

      ambientSourceNode = {
        stop: function () { try { noiseSource.stop(); } catch (e) {} },
        disconnect: function () { try { noiseSource.disconnect(); filter.disconnect(); } catch (e) {} }
      };

    } else {
      // "brown": Deep focus Brown noise for deep work
      const brownBuffer = createBrownNoiseBuffer(ctx, 6);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = brownBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(480, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(ambientGainNode);
      noiseSource.start();

      ambientSourceNode = {
        stop: function () { try { noiseSource.stop(); } catch (e) {} },
        disconnect: function () { try { noiseSource.disconnect(); filter.disconnect(); } catch (e) {} }
      };
    }

    ambientIsPlaying = true;
    if (btnIcon) btnIcon.textContent = "⏸";
    if (btnLabel) btnLabel.textContent = "Playing";
    toggleBtn.classList.add("playing");
  }

  toggleBtn.addEventListener("click", function () {
    if (ambientIsPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  });

  soundSelect.addEventListener("change", function () {
    if (ambientIsPlaying) {
      startAmbientSound();
    }
  });

  if (volumeSlider) {
    volumeSlider.addEventListener("input", function () {
      if (ambientGainNode && ambientAudioCtx) {
        ambientGainNode.gain.setValueAtTime(Number(volumeSlider.value), ambientAudioCtx.currentTime);
      }
    });
  }
}

// ==========================================================================
// COZY VIRTUAL LIBRARY & REAL-TIME VC LOUNGE CLIENT ENGINE
// ==========================================================================

let libraryWs = null;
let libraryPeerId = null;
let libraryRoomState = null;
let libraryAmbientAudioCtx = null;
let libraryAmbientGainNode = null;
let libraryAmbientSource = null;
let libraryAmbientPlaying = false;
let localMediaStream = null;
let localAudioAnalyser = null;
let localAudioInterval = null;
let isScreenSharing = false;
let screenMediaStream = null;
let quietStudyModeActive = false;
let isCallJoined = false;
const peerConnections = new Map();

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

function connectLibraryWs() {
  if (libraryWs && (libraryWs.readyState === WebSocket.OPEN || libraryWs.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//${window.location.host}/ws/library`;

  try {
    libraryWs = new WebSocket(wsUrl);

    libraryWs.addEventListener("open", function () {
      const user = window.STUDYMATE_USER || { id: 1, displayName: "Mahenoor" };
      libraryWs.send(JSON.stringify({
        type: "join:library",
        user: {
          id: user.id,
          displayName: user.displayName || user.username || "Mahenoor",
          avatarStyle: user.avatarStyle || "initials",
          avatarColor: user.avatarColor || "teal",
          avatarUrl: user.avatarUrl || null
        }
      }));
    });

    libraryWs.addEventListener("message", function (event) {
      try {
        const data = JSON.parse(event.data);
        handleLibraryWsMessage(data);
      } catch (err) {
        console.warn("Error parsing library WS message:", err);
      }
    });

    libraryWs.addEventListener("close", function () {
      setTimeout(function () {
        const cozySection = document.getElementById("cozy-library");
        if (cozySection && cozySection.classList.contains("active")) {
          connectLibraryWs();
        }
      }, 3000);
    });
  } catch (e) {
    console.warn("WebSocket connection failure:", e);
  }
}

function handleLibraryWsMessage(data) {
  if (!data) return;

  switch (data.type) {
    case "init:room_state": {
      libraryPeerId = data.peerId;
      libraryRoomState = data.room;
      renderAllLibraryComponents();
      break;
    }

    case "desk:updated": {
      if (libraryRoomState && Array.isArray(libraryRoomState.desks)) {
        const idx = libraryRoomState.desks.findIndex(function (d) { return d.id === data.deskId; });
        if (idx >= 0) {
          libraryRoomState.desks[idx] = data.desk;
        }
        renderLibraryDesks();
      }
      break;
    }

    case "desk:cheer_received": {
      triggerFloatingCheer(data.targetDeskId, data.reaction, data.fromName);
      break;
    }

    case "timer:updated":
    case "timer:cycle_switched": {
      if (libraryRoomState) {
        libraryRoomState.syncTimer = data.syncTimer;
        renderLibraryTimer();

        // Handle Quiet Study Mode auto-mute on cycle switch
        if (quietStudyModeActive && isCallJoined && localMediaStream) {
          const isFocus = data.syncTimer.mode === "focus";
          const audioTrack = localMediaStream.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.enabled = !isFocus;
            updateMicUI(!isFocus);
            if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
              libraryWs.send(JSON.stringify({
                type: "vc:media_state",
                hasAudio: !isFocus
              }));
            }
          }
        }
      }
      break;
    }

    case "room:atmosphere_changed": {
      if (libraryRoomState) {
        libraryRoomState.atmosphere = data.atmosphere;
        renderAtmosphere(data.atmosphere);
      }
      break;
    }

    case "chat:new_message": {
      if (libraryRoomState) {
        if (!Array.isArray(libraryRoomState.messages)) libraryRoomState.messages = [];
        libraryRoomState.messages.push(data.message);
        appendChatMessage(data.message);
      }
      break;
    }

    case "sticky:added": {
      if (libraryRoomState) {
        if (!Array.isArray(libraryRoomState.stickyNotes)) libraryRoomState.stickyNotes = [];
        libraryRoomState.stickyNotes.unshift(data.note);
        renderStickyNotes();
      }
      break;
    }

    case "sticky:deleted": {
      if (libraryRoomState && Array.isArray(libraryRoomState.stickyNotes)) {
        libraryRoomState.stickyNotes = libraryRoomState.stickyNotes.filter(function (n) { return n.id !== data.noteId; });
        renderStickyNotes();
      }
      break;
    }

    // --- WebRTC Call Signaling ---
    case "vc:existing_peers": {
      if (isCallJoined && Array.isArray(data.peers)) {
        data.peers.forEach(function (peer) {
          if (peer.peerId !== libraryPeerId) {
            createPeerConnection(peer.peerId, true);
          }
        });
        updateVCParticipantCount(data.peers.length + 1);
      }
      break;
    }

    case "vc:participant_joined": {
      if (isCallJoined && data.participant && data.participant.peerId !== libraryPeerId) {
        createPeerConnection(data.participant.peerId, false);
      }
      break;
    }

    case "vc:participant_left": {
      closePeerConnection(data.peerId);
      break;
    }

    case "vc:media_state_changed": {
      updateRemotePeerState(data.peerId, data.participant);
      break;
    }

    case "signal:offer": {
      handleRemoteOffer(data.fromPeerId, data.offer);
      break;
    }

    case "signal:answer": {
      handleRemoteAnswer(data.fromPeerId, data.answer);
      break;
    }

    case "signal:ice_candidate": {
      handleRemoteIceCandidate(data.fromPeerId, data.candidate);
      break;
    }
  }
}

function updateLibraryGroupTitle() {
  const titleEl = document.getElementById("library-group-title");
  if (!titleEl) return;
  const activeGroup = (appData.studyCircles && appData.studyCircles.find(function(c) { return c.id === appData.selectedCircleId; })) || (appData.studyCircles && appData.studyCircles[0]);
  const groupName = activeGroup ? activeGroup.name : "Deep Work Club";
  titleEl.textContent = `${groupName} — Library`;
}

function renderAllLibraryComponents() {
  if (!libraryRoomState) return;
  updateLibraryGroupTitle();
  renderLibraryDesks();
  renderLibraryTimer();
  renderAtmosphere(libraryRoomState.atmosphere || "rainy");
  renderAllChatMessages();
  renderStickyNotes();
  if (Array.isArray(libraryRoomState.vcParticipants)) {
    updateVCParticipantCount(libraryRoomState.vcParticipants.length);
  }
}

function getSweaterColor(avatarColor) {
  const map = {
    teal: "#0D9488",
    blue: "#1D4ED8",
    amber: "#B45309",
    rose: "#BE123C",
    purple: "#7C3AED",
    forest: "#15803D",
    indigo: "#4338CA",
    crimson: "#991B1B"
  };
  return map[avatarColor] || "#1E3A8A";
}

function createSpatialDeskStation(desk, currentUserId) {
  const station = document.createElement("div");
  station.id = `desk-card-${desk.id}`;

  const isOccupied = !!desk.occupiedBy;
  const isMyDesk = isOccupied && desk.occupiedBy.userId === currentUserId && !desk.occupiedBy.isBuddy;

  station.className = `spatial-desk-station ${isOccupied ? "occupied" : "empty"} ${isMyDesk ? "my-desk" : ""}`;

  if (isOccupied) {
    const mins = Math.floor((desk.occupiedBy.timerSeconds || 1500) / 60);
    const posture = desk.occupiedBy.posture || "reading";
    const postureEmoji = posture === "typing" ? "💻" : (posture === "writing" ? "✍️" : (posture === "coffee" ? "☕" : "📖"));
    const sweaterColor = getSweaterColor(desk.occupiedBy.avatarColor);
    const firstName = (desk.occupiedBy.displayName || "Member").split(" ")[0];
    const isLampOn = desk.occupiedBy.lampOn !== false;
    const initials = getInitials(desk.occupiedBy.displayName || "Student");

    station.innerHTML = `
      <!-- Desk Wooden Surface & Props -->
      <div class="desk-wooden-table">
        <!-- Banker's Lamp with Warm Radial Glow -->
        <div class="desk-banker-lamp ${isLampOn ? "lit" : ""}" title="${isLampOn ? "Banker's lamp on" : "Banker's lamp off"}">
          <div class="lamp-brass-stem"></div>
          <div class="lamp-emerald-shade"></div>
          <div class="lamp-radial-glow"></div>
        </div>

        <!-- Seated Circular Character Avatar -->
        <div class="desk-seated-avatar-wrap" onclick="${isMyDesk ? `openDeskModal(${desk.id})` : `togglePeerPopover(${desk.id})`}" title="${isMyDesk ? 'Edit my goal / seat' : 'View ' + escapeHtml(desk.occupiedBy.displayName)}">
          <div class="seated-circle-avatar" style="background-color: ${sweaterColor};">
            ${desk.occupiedBy.avatarUrl ? `<img src="${escapeHtml(desk.occupiedBy.avatarUrl)}" alt="${escapeHtml(desk.occupiedBy.displayName)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : `<span>${escapeHtml(initials)}</span>`}
          </div>
        </div>

        <!-- Props Cluster -->
        <div class="table-props-cluster">
          ${posture === "typing" ? `
            <div class="prop-laptop" title="Laptop">
              <div class="prop-laptop-screen"></div>
            </div>
          ` : `
            <div class="prop-book" title="Open Book"></div>
          `}
          <div class="prop-coffee-cup" title="Coffee Cup"></div>
        </div>
      </div>

      <!-- Minimalist Underneath Caption: FirstName • Live Timer ● -->
      <div class="desk-minimal-caption" onclick="${isMyDesk ? `openDeskModal(${desk.id})` : `togglePeerPopover(${desk.id})`}">
        <span class="caption-name">${escapeHtml(firstName)}</span>
        <span class="caption-divider">•</span>
        <span class="caption-timer">${mins}m</span>
        <span class="caption-pulse-dot" title="Active Study Session"></span>
      </div>

      <!-- Floating Paper Note Tooltip on Hover / Click -->
      <div class="desk-paper-tooltip" id="peer-popover-${desk.id}">
        <div class="tooltip-subject">${escapeHtml(desk.occupiedBy.subject || "Focus Study")}</div>
        <div class="tooltip-activity">${postureEmoji} ${escapeHtml(posture.charAt(0).toUpperCase() + posture.slice(1))} ${desk.occupiedBy.goal ? `• “${escapeHtml(desk.occupiedBy.goal)}”` : ""}</div>
        <div class="tooltip-cheer-row">
          <button type="button" class="tooltip-cheer-btn" onclick="sendDeskCheer(${desk.id}, '☕');" title="Send Coffee">☕</button>
          <button type="button" class="tooltip-cheer-btn" onclick="sendDeskCheer(${desk.id}, '👏');" title="Send Clap">👏</button>
          <button type="button" class="tooltip-cheer-btn" onclick="sendDeskCheer(${desk.id}, '✨');" title="Send Encouragement">✨</button>
          <button type="button" class="tooltip-cheer-btn" onclick="sendDeskCheer(${desk.id}, '💡');" title="Send Bright Idea">💡</button>
        </div>
      </div>
    `;
  } else {
    station.innerHTML = `
      <!-- Empty Desk with Subtle Ghosted + Sit Button -->
      <div class="desk-wooden-table" onclick="openDeskModal(${desk.id})" title="Click to sit at Desk ${desk.id}">
        <!-- Lamp Off -->
        <div class="desk-banker-lamp" title="Reading lamp off">
          <div class="lamp-brass-stem"></div>
          <div class="lamp-emerald-shade"></div>
        </div>

        <button type="button" class="empty-sit-ghost-btn" onclick="openDeskModal(${desk.id}); event.stopPropagation();">
          <span>+ Sit</span>
        </button>

        <!-- Desk Book Prop -->
        <div class="table-props-cluster">
          <div class="prop-book" title="Open Book"></div>
        </div>
      </div>

      <!-- Minimalist Underneath Caption for Empty Desk -->
      <div class="desk-minimal-caption">
        <span style="opacity:0.6;">Desk ${desk.id}</span>
        <span class="caption-divider" style="opacity:0.4;">•</span>
        <span style="opacity:0.6; font-style:italic;">Open</span>
      </div>
    `;
  }

  return station;
}

function renderLibraryDesks() {
  const slot1 = document.getElementById("slot-zone-1");
  const slot2 = document.getElementById("slot-zone-2");
  const slot3 = document.getElementById("slot-zone-3");
  const slot4 = document.getElementById("slot-zone-4");
  const dockLeaveBtn = document.getElementById("dock-leave-seat-btn");

  if (!libraryRoomState || !Array.isArray(libraryRoomState.desks)) return;

  const currentUserId = window.STUDYMATE_USER?.id || 1;
  let takenCount = 0;
  let myDesk = null;

  if (slot1) slot1.innerHTML = "";
  if (slot2) slot2.innerHTML = "";
  if (slot3) slot3.innerHTML = "";
  if (slot4) slot4.innerHTML = "";

  libraryRoomState.desks.forEach(function (desk, index) {
    if (desk.occupiedBy) {
      takenCount++;
      if (desk.occupiedBy.userId === currentUserId && !desk.occupiedBy.isBuddy) {
        myDesk = desk;
      }
    }

    const station = createSpatialDeskStation(desk, currentUserId);

    // Distribute into 4 spatial physical zones:
    // Zone 1: Window Nook (Desks 1-2)
    // Zone 2: Fireplace Alcove (Desks 3-4)
    // Zone 3: Central Reading Table (Desks 5-6)
    // Zone 4: Quiet Corner (Desks 7-8)
    if (index < 2 && slot1) {
      slot1.appendChild(station);
    } else if (index < 4 && slot2) {
      slot2.appendChild(station);
    } else if (index < 6 && slot3) {
      slot3.appendChild(station);
    } else if (slot4) {
      slot4.appendChild(station);
    }
  });

  // Update Leave Seat button in bottom dock
  if (dockLeaveBtn) {
    dockLeaveBtn.hidden = !myDesk;
    if (myDesk) {
      dockLeaveBtn.onclick = function() {
        leaveDesk(myDesk.id);
      };
    }
  }
}

function togglePeerPopover(deskId) {
  const popover = document.getElementById(`peer-popover-${deskId}`);
  if (!popover) return;
  const isHidden = popover.hidden;
  closeAllPeerPopovers();
  popover.hidden = !isHidden;
}

function closeAllPeerPopovers() {
  document.querySelectorAll(".peer-card-popover").forEach(function (p) {
    p.hidden = true;
  });
}

function setMyDeskPosture(posture) {
  const currentUserId = window.STUDYMATE_USER?.id || 1;
  const myDesk = libraryRoomState?.desks?.find(function (d) {
    return d.occupiedBy && d.occupiedBy.userId === currentUserId && !d.occupiedBy.isBuddy;
  });

  if (!myDesk) return;

  if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
    libraryWs.send(JSON.stringify({
      type: "desk:posture",
      deskId: myDesk.id,
      posture
    }));
  }

  // Optimistic update
  if (myDesk.occupiedBy) {
    myDesk.occupiedBy.posture = posture;
    renderLibraryDesks();
  }
}

function toggleMyDeskLamp() {
  const currentUserId = window.STUDYMATE_USER?.id || 1;
  const myDesk = libraryRoomState?.desks?.find(function (d) {
    return d.occupiedBy && d.occupiedBy.userId === currentUserId && !d.occupiedBy.isBuddy;
  });

  if (!myDesk || !myDesk.occupiedBy) return;

  const newLampState = !myDesk.occupiedBy.lampOn;
  if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
    libraryWs.send(JSON.stringify({
      type: "desk:update_progress",
      deskId: myDesk.id,
      lampOn: newLampState
    }));
  }

  myDesk.occupiedBy.lampOn = newLampState;
  renderLibraryDesks();
}

function renderLibraryTimer() {
  const digits = document.getElementById("sync-timer-digits");
  const modeLabel = document.getElementById("sync-timer-mode-label");
  const pill = document.querySelector(".sync-pomodoro-pill");
  const toggleBtn = document.getElementById("sync-timer-toggle-btn");
  if (!digits || !libraryRoomState || !libraryRoomState.syncTimer) return;

  const timer = libraryRoomState.syncTimer;
  const rem = Math.max(0, timer.remainingSeconds || 0);
  const mins = Math.floor(rem / 60);
  const secs = rem % 60;

  digits.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  if (modeLabel) {
    modeLabel.textContent = timer.mode === "break" ? "Break" : "Focus";
  }
  const dot = document.getElementById("sync-timer-dot");
  if (dot) {
    dot.style.background = timer.mode === "break" ? "#38BDF8" : "#22C55E";
    dot.style.boxShadow = timer.mode === "break" ? "0 0 6px #38BDF8" : "0 0 6px #22C55E";
  }
  if (pill) {
    pill.classList.toggle("break", timer.mode === "break");
  }
  if (toggleBtn) {
    toggleBtn.textContent = timer.status === "running" ? "⏸️" : "▶️";
  }
}

function renderAtmosphere(atmosphere) {
  const nameLabel = document.getElementById("atmosphere-name");
  const icon = document.getElementById("atmosphere-icon");
  const rainOverlay = document.getElementById("window-rain-overlay");
  const lightOverlay = document.getElementById("window-light-overlay");

  const atmospheres = {
    rainy: { name: "Rainy Window", icon: "🌧️", rain: true, light: "rgba(30, 50, 40, 0.6)" },
    candlelight: { name: "Warm Candlelight", icon: "🕯️", rain: false, light: "rgba(80, 50, 20, 0.4)" },
    sunny: { name: "Sunny Courtyard", icon: "☀️", rain: false, light: "rgba(70, 90, 60, 0.5)" },
    midnight: { name: "Midnight Deep Work", icon: "🌙", rain: false, light: "rgba(10, 15, 25, 0.85)" }
  };

  const current = atmospheres[atmosphere] || atmospheres.rainy;
  if (nameLabel) nameLabel.textContent = current.name;
  if (icon) icon.textContent = current.icon;
  if (rainOverlay) rainOverlay.style.display = current.rain ? "block" : "none";
  if (lightOverlay) lightOverlay.style.background = current.light;
}

function openDeskModal(deskId) {
  const modal = document.getElementById("desk-action-modal");
  const deskInput = document.getElementById("desk-modal-target-id");
  const subjectInput = document.getElementById("desk-modal-subject");
  const goalInput = document.getElementById("desk-modal-goal");
  const lampInput = document.getElementById("desk-modal-lamp");
  const leaveBtn = document.getElementById("desk-modal-leave-btn");
  const submitBtn = document.getElementById("desk-modal-submit-btn");

  if (!modal || !deskInput) return;

  deskInput.value = deskId;

  // Check if desk is already occupied by current user
  const desk = libraryRoomState?.desks?.find(function (d) { return d.id === Number(deskId); });
  const isMine = desk?.occupiedBy?.userId === (window.STUDYMATE_USER?.id || 1) && !desk?.occupiedBy?.isBuddy;

  if (isMine && desk.occupiedBy) {
    if (subjectInput) subjectInput.value = desk.occupiedBy.subject || "";
    if (goalInput) goalInput.value = desk.occupiedBy.goal || "";
    if (lampInput) lampInput.checked = desk.occupiedBy.lampOn !== false;
    const postureRadio = modal.querySelector(`input[name="modal-desk-posture"][value="${desk.occupiedBy.posture || 'reading'}"]`);
    if (postureRadio) postureRadio.checked = true;

    if (leaveBtn) {
      leaveBtn.hidden = false;
      leaveBtn.onclick = function () { leaveDesk(deskId); modal.hidden = true; };
    }
    if (submitBtn) submitBtn.textContent = "Update Desk Goal";
  } else {
    // Pre-fill from active local session if any
    const activeGoal = appData.activeSession?.goal || "";
    const activeSubj = appData.subjects.find(function (s) { return s.id === appData.activeSession?.subjectId; })?.name || "";
    if (subjectInput) subjectInput.value = activeSubj || "";
    if (goalInput) goalInput.value = activeGoal || "";
    if (lampInput) lampInput.checked = true;
    const defaultRadio = modal.querySelector('input[name="modal-desk-posture"][value="reading"]');
    if (defaultRadio) defaultRadio.checked = true;

    if (leaveBtn) leaveBtn.hidden = true;
    if (submitBtn) submitBtn.textContent = "Sit at Desk";
  }

  modal.hidden = false;
}

function closeDeskModal() {
  const modal = document.getElementById("desk-action-modal");
  if (modal) modal.hidden = true;
}

function leaveDesk(deskId) {
  if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
    libraryWs.send(JSON.stringify({
      type: "desk:leave",
      deskId: Number(deskId)
    }));
  }
}

function sendDeskCheer(targetDeskId, reaction) {
  if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
    libraryWs.send(JSON.stringify({
      type: "desk:cheer",
      targetDeskId: Number(targetDeskId),
      reaction: reaction || "☕"
    }));
  }
}

function triggerFloatingCheer(targetDeskId, reaction, fromName) {
  const card = document.getElementById(`desk-card-${targetDeskId}`);
  if (!card) return;

  const cheer = document.createElement("div");
  cheer.className = "floating-cheer";
  cheer.textContent = reaction || "☕";
  card.appendChild(cheer);

  setTimeout(function () {
    cheer.remove();
  }, 1900);
}

function appendChatMessage(msg) {
  const container = document.getElementById("library-chat-messages");
  if (!container || !msg) return;

  const currentUserId = window.STUDYMATE_USER?.id || 1;
  const isMine = msg.senderName === (window.STUDYMATE_USER?.displayName || "Mahenoor");

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${isMine ? "mine" : ""}`;

  const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  bubble.innerHTML = `
    <div class="chat-bubble-header">
      <span class="chat-sender">${escapeHtml(msg.senderName || "Student")}</span>
      <span class="chat-time">${time}</span>
    </div>
    <div class="chat-content">${escapeHtml(msg.content)}</div>
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;

  const drawer = document.getElementById("library-slide-drawer");
  const unreadBadge = document.getElementById("drawer-unread-badge");
  if (drawer && drawer.hidden && unreadBadge && !isMine) {
    unreadBadge.hidden = false;
  }
}

function renderAllChatMessages() {
  const container = document.getElementById("library-chat-messages");
  if (!container || !libraryRoomState || !Array.isArray(libraryRoomState.messages)) return;
  container.innerHTML = "";
  libraryRoomState.messages.forEach(appendChatMessage);
}

function renderStickyNotes() {
  const corkboard = document.getElementById("sticky-corkboard");
  const count = document.getElementById("sticky-count");
  if (!corkboard || !libraryRoomState || !Array.isArray(libraryRoomState.stickyNotes)) return;

  corkboard.innerHTML = "";
  if (count) count.textContent = String(libraryRoomState.stickyNotes.length);

  libraryRoomState.stickyNotes.forEach(function (note) {
    const card = document.createElement("div");
    card.className = `sticky-card ${note.color || "amber"}`;
    card.innerHTML = `
      <div class="sticky-header">
        <span>${escapeHtml(note.author || "Member")}</span>
        <button type="button" class="btn-del-note" title="Remove note" onclick="deleteStickyNote('${note.id}')">×</button>
      </div>
      <div>${escapeHtml(note.content)}</div>
    `;
    corkboard.appendChild(card);
  });
}

function deleteStickyNote(noteId) {
  if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
    libraryWs.send(JSON.stringify({
      type: "sticky:delete",
      noteId
    }));
  }
}

// --- WebRTC Voice & Video Call Engine ---

async function joinVC() {
  if (isCallJoined) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(function () {
      // Fallback to audio-only if video fails
      return navigator.mediaDevices.getUserMedia({ audio: true });
    });

    localMediaStream = stream;
    isCallJoined = true;

    const localVideo = document.getElementById("vc-local-video");
    const fallback = document.getElementById("vc-local-avatar-fallback");
    const localName = document.getElementById("vc-local-name");
    const micBadge = document.getElementById("vc-local-mic-badge");

    if (localVideo) {
      localVideo.srcObject = stream;
      localVideo.play().catch(function () {});
    }

    const hasVideo = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
    if (fallback) fallback.style.display = hasVideo ? "none" : "flex";
    if (localName) localName.textContent = `${window.STUDYMATE_USER?.displayName || "You"} (Local)`;
    if (micBadge) {
      micBadge.textContent = "Live";
      micBadge.classList.add("live");
    }

    setupAudioAnalyser(stream);

    // Notify server
    if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
      libraryWs.send(JSON.stringify({
        type: "vc:join",
        hasVideo,
        hasAudio: true
      }));
    }

    updateVCButtonStates(true);
    switchLibraryView("vc");
  } catch (err) {
    console.warn("Unable to capture media devices:", err);
    // Continue in listen-only presence mode
    isCallJoined = true;
    updateVCButtonStates(true);
    switchLibraryView("vc");

    if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
      libraryWs.send(JSON.stringify({
        type: "vc:join",
        hasVideo: false,
        hasAudio: false
      }));
    }
  }
}

function leaveVC() {
  if (!isCallJoined) return;

  if (localMediaStream) {
    localMediaStream.getTracks().forEach(function (track) { track.stop(); });
    localMediaStream = null;
  }
  if (screenMediaStream) {
    screenMediaStream.getTracks().forEach(function (track) { track.stop(); });
    screenMediaStream = null;
    isScreenSharing = false;
  }

  clearInterval(localAudioInterval);

  peerConnections.forEach(function (pc) { pc.close(); });
  peerConnections.clear();

  const remoteContainer = document.getElementById("vc-remote-container");
  if (remoteContainer) {
    remoteContainer.innerHTML = `
      <div class="vc-empty-peers" id="vc-empty-peers">
        <div class="empty-peers-graphic">🎧</div>
        <h4>No other members on call yet</h4>
        <p class="muted-text">Invite group members or study buddies to turn on their cams and mic.</p>
      </div>
    `;
  }

  const localVideo = document.getElementById("vc-local-video");
  const fallback = document.getElementById("vc-local-avatar-fallback");
  if (localVideo) localVideo.srcObject = null;
  if (fallback) fallback.style.display = "flex";

  if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
    libraryWs.send(JSON.stringify({ type: "vc:leave" }));
  }

  isCallJoined = false;
  updateVCButtonStates(false);
  switchLibraryView("desks");
}

function toggleMic() {
  if (!localMediaStream) return;
  const audioTrack = localMediaStream.getAudioTracks()[0];
  if (!audioTrack) return;

  audioTrack.enabled = !audioTrack.enabled;
  updateMicUI(audioTrack.enabled);

  if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
    libraryWs.send(JSON.stringify({
      type: "vc:media_state",
      hasAudio: audioTrack.enabled
    }));
  }
}

function updateMicUI(enabled) {
  const micLabel = document.getElementById("vc-mic-label");
  const micBadge = document.getElementById("vc-local-mic-badge");
  const micBtn = document.getElementById("vc-toggle-mic");

  if (micLabel) micLabel.textContent = enabled ? "Mute" : "Unmute";
  if (micBtn) micBtn.classList.toggle("active", enabled);
  if (micBadge) {
    micBadge.textContent = enabled ? "Live" : "Muted";
    micBadge.classList.toggle("live", enabled);
  }
}

function toggleCam() {
  if (!localMediaStream) return;
  const videoTrack = localMediaStream.getVideoTracks()[0];
  const fallback = document.getElementById("vc-local-avatar-fallback");
  const camLabel = document.getElementById("vc-cam-label");
  const camBtn = document.getElementById("vc-toggle-cam");

  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    const isLive = videoTrack.enabled;
    if (fallback) fallback.style.display = isLive ? "none" : "flex";
    if (camLabel) camLabel.textContent = isLive ? "Stop Video" : "Start Video";
    if (camBtn) camBtn.classList.toggle("active", isLive);

    if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
      libraryWs.send(JSON.stringify({
        type: "vc:media_state",
        hasVideo: isLive
      }));
    }
  }
}

async function toggleScreenShare() {
  const screenBtn = document.getElementById("vc-toggle-screen");
  const screenLabel = document.getElementById("vc-screen-label");

  if (!isScreenSharing) {
    try {
      screenMediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      isScreenSharing = true;
      if (screenLabel) screenLabel.textContent = "Stop Share";
      if (screenBtn) screenBtn.classList.add("active");

      const screenTrack = screenMediaStream.getVideoTracks()[0];

      // Replace track on all peer connections
      peerConnections.forEach(function (pc) {
        const senders = pc.getSenders();
        const videoSender = senders.find(function (s) { return s.track && s.track.kind === "video"; });
        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }
      });

      screenTrack.onended = function () {
        stopScreenShare();
      };

      if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
        libraryWs.send(JSON.stringify({
          type: "vc:media_state",
          isScreenSharing: true
        }));
      }
    } catch (e) {
      console.warn("Screen share canceled or failed:", e);
    }
  } else {
    stopScreenShare();
  }
}

function stopScreenShare() {
  if (screenMediaStream) {
    screenMediaStream.getTracks().forEach(function (t) { t.stop(); });
    screenMediaStream = null;
  }
  isScreenSharing = false;

  const screenBtn = document.getElementById("vc-toggle-screen");
  const screenLabel = document.getElementById("vc-screen-label");
  if (screenLabel) screenLabel.textContent = "Share Screen";
  if (screenBtn) screenBtn.classList.remove("active");

  // Restore camera video track
  if (localMediaStream) {
    const camTrack = localMediaStream.getVideoTracks()[0];
    if (camTrack) {
      peerConnections.forEach(function (pc) {
        const senders = pc.getSenders();
        const videoSender = senders.find(function (s) { return s.track && s.track.kind === "video"; });
        if (videoSender) {
          videoSender.replaceTrack(camTrack);
        }
      });
    }
  }

  if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
    libraryWs.send(JSON.stringify({
      type: "vc:media_state",
      isScreenSharing: false
    }));
  }
}

function toggleQuietStudyMode() {
  quietStudyModeActive = !quietStudyModeActive;
  const label = document.getElementById("vc-quiet-label");
  const btn = document.getElementById("vc-toggle-quiet-mode");

  if (label) label.textContent = quietStudyModeActive ? "Quiet Mode: On" : "Quiet Mode: Off";
  if (btn) btn.classList.toggle("active", quietStudyModeActive);

  // If active and focus session running, mute immediately
  if (quietStudyModeActive && localMediaStream) {
    const isFocus = libraryRoomState?.syncTimer?.mode === "focus";
    if (isFocus) {
      const audioTrack = localMediaStream.getAudioTracks()[0];
      if (audioTrack && audioTrack.enabled) {
        audioTrack.enabled = false;
        updateMicUI(false);
      }
    }
  }
}

function updateVCButtonStates(joined) {
  const quickBtn = document.getElementById("quick-join-vc-btn");
  const quickLabel = document.getElementById("quick-vc-btn-label");
  if (quickLabel) quickLabel.textContent = joined ? "Leave Call" : "Join Study Call";
  if (quickBtn) {
    quickBtn.classList.toggle("delete-button", joined);
    quickBtn.onclick = joined ? leaveVC : joinVC;
  }
}

function setupAudioAnalyser(stream) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    localAudioAnalyser = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const meter = document.getElementById("vc-local-audio-meter");
    let wasSpeaking = false;

    clearInterval(localAudioInterval);
    localAudioInterval = setInterval(function () {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;
      const isSpeaking = avg > 28;

      if (meter) meter.classList.toggle("active", isSpeaking);

      if (isSpeaking !== wasSpeaking) {
        wasSpeaking = isSpeaking;
        if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
          libraryWs.send(JSON.stringify({
            type: "vc:media_state",
            isSpeaking
          }));
        }
      }
    }, 150);
  } catch (err) {
    console.warn("Audio analyser setup error:", err);
  }
}

function createPeerConnection(remotePeerId, isInitiator) {
  if (peerConnections.has(remotePeerId)) {
    return peerConnections.get(remotePeerId);
  }

  const pc = new RTCPeerConnection(rtcConfig);
  peerConnections.set(remotePeerId, pc);

  if (localMediaStream) {
    localMediaStream.getTracks().forEach(function (track) {
      pc.addTrack(track, localMediaStream);
    });
  }

  pc.onicecandidate = function (event) {
    if (event.candidate && libraryWs && libraryWs.readyState === WebSocket.OPEN) {
      libraryWs.send(JSON.stringify({
        type: "signal:ice_candidate",
        targetPeerId: remotePeerId,
        candidate: event.candidate
      }));
    }
  };

  pc.ontrack = function (event) {
    ensureRemotePeerTile(remotePeerId, event.streams[0]);
  };

  if (isInitiator) {
    pc.createOffer()
      .then(function (offer) { return pc.setLocalDescription(offer); })
      .then(function () {
        if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
          libraryWs.send(JSON.stringify({
            type: "signal:offer",
            targetPeerId: remotePeerId,
            offer: pc.localDescription
          }));
        }
      })
      .catch(function (err) {
        console.warn("Offer error:", err);
      });
  }

  return pc;
}

function handleRemoteOffer(fromPeerId, offer) {
  const pc = createPeerConnection(fromPeerId, false);
  pc.setRemoteDescription(new RTCSessionDescription(offer))
    .then(function () { return pc.createAnswer(); })
    .then(function (answer) { return pc.setLocalDescription(answer); })
    .then(function () {
      if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
        libraryWs.send(JSON.stringify({
          type: "signal:answer",
          targetPeerId: fromPeerId,
          answer: pc.localDescription
        }));
      }
    })
    .catch(function (err) {
      console.warn("Answer error:", err);
    });
}

function handleRemoteAnswer(fromPeerId, answer) {
  const pc = peerConnections.get(fromPeerId);
  if (pc) {
    pc.setRemoteDescription(new RTCSessionDescription(answer)).catch(function (err) {
      console.warn("Set remote description error:", err);
    });
  }
}

function handleRemoteIceCandidate(fromPeerId, candidate) {
  const pc = peerConnections.get(fromPeerId);
  if (pc) {
    pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(function (err) {
      console.warn("Add ICE candidate error:", err);
    });
  }
}

function ensureRemotePeerTile(peerId, stream) {
  const container = document.getElementById("vc-remote-container");
  const emptyPeers = document.getElementById("vc-empty-peers");
  if (!container) return;
  if (emptyPeers) emptyPeers.style.display = "none";

  let tile = document.getElementById("vc-peer-tile-" + peerId);
  if (!tile) {
    tile = document.createElement("div");
    tile.className = "vc-tile remote-tile";
    tile.id = "vc-peer-tile-" + peerId;

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    if (stream) video.srcObject = stream;

    const footer = document.createElement("div");
    footer.className = "vc-tile-footer";

    const participant = libraryRoomState?.vcParticipants?.find(function (p) { return p.peerId === peerId; });
    const name = participant ? participant.displayName : "Study Partner";

    footer.innerHTML = `
      <span class="participant-name">${escapeHtml(name)}</span>
      <div class="tile-indicators">
        <span class="tile-badge mic-status live" id="mic-badge-${peerId}">Live</span>
      </div>
    `;

    tile.appendChild(video);
    tile.appendChild(footer);
    container.appendChild(tile);
  } else if (stream) {
    const video = tile.querySelector("video");
    if (video) video.srcObject = stream;
  }
}

function updateRemotePeerState(peerId, participant) {
  const tile = document.getElementById("vc-peer-tile-" + peerId);
  if (!tile || !participant) return;

  tile.classList.toggle("speaking", !!participant.isSpeaking);
  const badge = document.getElementById("mic-badge-" + peerId);
  if (badge) {
    badge.textContent = participant.hasAudio ? "Live" : "Muted";
    badge.classList.toggle("live", !!participant.hasAudio);
  }
}

function closePeerConnection(peerId) {
  const pc = peerConnections.get(peerId);
  if (pc) {
    pc.close();
    peerConnections.delete(peerId);
  }
  const tile = document.getElementById("vc-peer-tile-" + peerId);
  if (tile) tile.remove();

  const container = document.getElementById("vc-remote-container");
  if (container && container.querySelectorAll(".remote-tile").length === 0) {
    const emptyPeers = document.getElementById("vc-empty-peers");
    if (emptyPeers) emptyPeers.style.display = "block";
  }
}

function updateVCParticipantCount(count) {
  const badge = document.getElementById("vc-live-count");
  if (badge) {
    badge.textContent = String(count);
    badge.hidden = count <= 0;
  }
}

function switchLibraryView(view) {
  const roomView = document.getElementById("cozy-library-room");
  const vcView = document.getElementById("library-vc-viewport");
  const desksBtn = document.getElementById("btn-view-desks");
  const vcBtn = document.getElementById("btn-view-vc");

  if (view === "vc") {
    if (roomView) {
      roomView.classList.remove("active");
      roomView.hidden = true;
    }
    if (vcView) {
      vcView.hidden = false;
    }
    if (desksBtn) desksBtn.classList.remove("active");
    if (vcBtn) vcBtn.classList.add("active");

    if (!isCallJoined) {
      joinVC();
    }
  } else {
    if (roomView) {
      roomView.classList.add("active");
      roomView.hidden = false;
    }
    if (vcView) {
      vcView.hidden = true;
    }
    if (desksBtn) desksBtn.classList.add("active");
    if (vcBtn) vcBtn.classList.remove("active");
  }
}

// --- Cozy Ambient Sound Generator ---

function startLibraryAmbient(type) {
  stopLibraryAmbient();
  if (type === "off") return;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!libraryAmbientAudioCtx) libraryAmbientAudioCtx = new AudioCtx();
    if (libraryAmbientAudioCtx.state === "suspended") libraryAmbientAudioCtx.resume();

    const volSlider = document.getElementById("library-sound-vol");
    const vol = volSlider ? Number(volSlider.value) : 0.35;

    libraryAmbientGainNode = libraryAmbientAudioCtx.createGain();
    libraryAmbientGainNode.gain.setValueAtTime(vol, libraryAmbientAudioCtx.currentTime);
    libraryAmbientGainNode.connect(libraryAmbientAudioCtx.destination);

    const bufferSize = libraryAmbientAudioCtx.sampleRate * 3;
    const buffer = libraryAmbientAudioCtx.createBuffer(1, bufferSize, libraryAmbientAudioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "hearth") {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5 + (Math.random() > 0.998 ? (Math.random() - 0.5) * 0.8 : 0);
      } else if (type === "rain") {
        lastOut = (lastOut + 0.04 * white) / 1.04;
        data[i] = lastOut * 2.2;
      } else if (type === "cafe") {
        lastOut = (lastOut + 0.015 * white) / 1.015;
        data[i] = lastOut * 2.5;
      } else {
        lastOut = (lastOut + 0.03 * white) / 1.03;
        data[i] = lastOut * 1.5;
      }
    }

    const source = libraryAmbientAudioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = libraryAmbientAudioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(type === "rain" ? 850 : (type === "hearth" ? 420 : 600), libraryAmbientAudioCtx.currentTime);

    source.connect(filter);
    filter.connect(libraryAmbientGainNode);
    source.start(0);

    libraryAmbientSource = source;
    libraryAmbientPlaying = true;

    const toggleBtn = document.getElementById("library-sound-toggle");
    if (toggleBtn) {
      toggleBtn.textContent = "Pause";
      toggleBtn.classList.add("playing");
    }
  } catch (err) {
    console.warn("Library ambient error:", err);
  }
}

function stopLibraryAmbient() {
  if (libraryAmbientSource) {
    try {
      libraryAmbientSource.stop();
      libraryAmbientSource.disconnect();
    } catch (e) {}
    libraryAmbientSource = null;
  }
  libraryAmbientPlaying = false;
  const toggleBtn = document.getElementById("library-sound-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = "Play";
    toggleBtn.classList.remove("playing");
  }
}

// Global hook called when user opens the Cozy Library tab
function initCozyLibrary() {
  updateLibraryGroupTitle();
  connectLibraryWs();
}

function initCozyLibraryUI() {
  // Navigation & View switcher
  const btnDesks = document.getElementById("btn-view-desks");
  const btnVC = document.getElementById("btn-view-vc");
  if (btnDesks) btnDesks.addEventListener("click", function () { switchLibraryView("desks"); });
  if (btnVC) btnVC.addEventListener("click", function () { switchLibraryView("vc"); });

  // Fullscreen button
  const fullscreenBtn = document.getElementById("btn-library-fullscreen");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", function () {
      const section = document.getElementById("cozy-library");
      if (!document.fullscreenElement) {
        if (section && section.requestFullscreen) {
          section.requestFullscreen().catch(function (err) {
            console.warn("Fullscreen request error:", err);
          });
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(function (err) {
            console.warn("Fullscreen exit error:", err);
          });
        }
      }
    });
  }

  // Quick join button
  const quickJoinBtn = document.getElementById("quick-join-vc-btn");
  if (quickJoinBtn) quickJoinBtn.addEventListener("click", joinVC);

  // Group workspace Cozy Library jump button
  const groupCozyBtn = document.getElementById("group-cozy-library-button");
  if (groupCozyBtn) {
    groupCozyBtn.addEventListener("click", function () {
      updateLibraryGroupTitle();
      showSection("cozy-library");
    });
  }

  // Atmosphere switcher toggle
  const atmoToggle = document.getElementById("library-atmosphere-toggle");
  if (atmoToggle) {
    atmoToggle.addEventListener("click", function () {
      const order = ["rainy", "candlelight", "sunny", "midnight"];
      const current = libraryRoomState?.atmosphere || "rainy";
      const next = order[(order.indexOf(current) + 1) % order.length];
      if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
        libraryWs.send(JSON.stringify({
          type: "room:atmosphere",
          atmosphere: next
        }));
      }
    });
  }

  // Room Timer controls
  const timerToggleBtn = document.getElementById("sync-timer-toggle-btn");
  if (timerToggleBtn) {
    timerToggleBtn.addEventListener("click", function () {
      const isRunning = libraryRoomState?.syncTimer?.status === "running";
      if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
        libraryWs.send(JSON.stringify({
          type: "room:timer_action",
          action: isRunning ? "pause" : "start"
        }));
      }
    });
  }

  const syncToLocalBtn = document.getElementById("sync-to-my-timer-btn");
  if (syncToLocalBtn) {
    syncToLocalBtn.addEventListener("click", function () {
      if (libraryRoomState && libraryRoomState.syncTimer) {
        // Sync local timer to room timer
        const roomSecs = libraryRoomState.syncTimer.remainingSeconds || 1500;
        appData.timerSeconds = roomSecs;
        saveData();
        updateSessionPage();
        updateAllDisplays();
        showToast("Synced your local focus timer with the library room timer!");
      }
    });
  }

  // Soundscape selector
  const soundSelect = document.getElementById("library-sound-select");
  const soundToggle = document.getElementById("library-sound-toggle");
  const soundVol = document.getElementById("library-sound-vol");

  if (soundToggle) {
    soundToggle.addEventListener("click", function () {
      if (libraryAmbientPlaying) {
        stopLibraryAmbient();
      } else {
        const type = soundSelect ? soundSelect.value : "rain";
        startLibraryAmbient(type);
      }
    });
  }

  if (soundSelect) {
    soundSelect.addEventListener("change", function () {
      if (libraryAmbientPlaying) {
        startLibraryAmbient(soundSelect.value);
      }
    });
  }

  if (soundVol) {
    soundVol.addEventListener("input", function () {
      if (libraryAmbientGainNode && libraryAmbientAudioCtx) {
        libraryAmbientGainNode.gain.setValueAtTime(Number(soundVol.value), libraryAmbientAudioCtx.currentTime);
      }
    });
  }

  // Media Controls in Bottom Dock
  const toggleMicBtn = document.getElementById("vc-toggle-mic");
  const toggleCamBtn = document.getElementById("vc-toggle-cam");
  const toggleScreenBtn = document.getElementById("vc-toggle-screen");
  const toggleQuietBtn = document.getElementById("vc-toggle-quiet-mode");
  const leaveCallBtn = document.getElementById("vc-leave-call-btn");

  if (toggleMicBtn) toggleMicBtn.addEventListener("click", toggleMic);
  if (toggleCamBtn) toggleCamBtn.addEventListener("click", toggleCam);
  if (toggleScreenBtn) toggleScreenBtn.addEventListener("click", toggleScreenShare);
  if (toggleQuietBtn) toggleQuietBtn.addEventListener("click", toggleQuietStudyMode);
  if (leaveCallBtn) leaveCallBtn.addEventListener("click", leaveVC);

  // Leave Seat Button in Bottom Dock
  const dockLeaveBtn = document.getElementById("dock-leave-seat-btn");
  if (dockLeaveBtn) {
    dockLeaveBtn.addEventListener("click", function () {
      const currentUserId = window.STUDYMATE_USER?.id || 1;
      const myDesk = libraryRoomState?.desks?.find(function (d) {
        return d.occupiedBy && d.occupiedBy.userId === currentUserId && !d.occupiedBy.isBuddy;
      });
      if (myDesk) {
        leaveDesk(myDesk.id);
      }
    });
  }

  // Collaboration Slide-Out Drawer (Chat & Notes)
  const drawer = document.getElementById("library-slide-drawer");
  const drawerToggle = document.getElementById("library-drawer-toggle");
  const closeDrawerBtn = document.getElementById("close-library-drawer");
  const unreadBadge = document.getElementById("drawer-unread-badge");

  function toggleDrawer(show) {
    if (!drawer) return;
    const shouldShow = typeof show === "boolean" ? show : drawer.hidden;
    drawer.hidden = !shouldShow;
    if (shouldShow && unreadBadge) {
      unreadBadge.hidden = true;
    }
  }

  if (drawerToggle) {
    drawerToggle.addEventListener("click", function () {
      toggleDrawer();
    });
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener("click", function () {
      toggleDrawer(false);
    });
  }

  // Drawer Tabs (Chat vs Notes)
  document.querySelectorAll(".drawer-tabs .collab-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".drawer-tabs .collab-tab").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      const target = tab.dataset.collabTab;
      const chatPane = document.getElementById("collab-pane-chat");
      const stickyPane = document.getElementById("collab-pane-sticky");
      if (chatPane) chatPane.hidden = target !== "chat";
      if (stickyPane) stickyPane.hidden = target !== "sticky";
    });
  });

  // Chat Form
  const chatForm = document.getElementById("library-chat-form");
  const chatInput = document.getElementById("library-chat-input");
  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
        libraryWs.send(JSON.stringify({
          type: "chat:message",
          content: text
        }));
      }
      chatInput.value = "";
    });
  }

  // Quick Cheers
  document.querySelectorAll(".quick-reactions-strip .reaction-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const reaction = btn.dataset.reaction || "☕";
      const targetDesk = libraryRoomState?.desks?.find(function (d) { return d.occupiedBy; })?.id || 1;
      sendDeskCheer(targetDesk, reaction);
    });
  });

  // Sticky Notes Form
  const stickyForm = document.getElementById("new-sticky-form");
  const stickyContent = document.getElementById("new-sticky-content");
  if (stickyForm && stickyContent) {
    stickyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const text = stickyContent.value.trim();
      if (!text) return;
      const colorInput = stickyForm.querySelector('input[name="sticky-color"]:checked');
      const color = colorInput ? colorInput.value : "amber";

      if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
        libraryWs.send(JSON.stringify({
          type: "sticky:add",
          content: text,
          color
        }));
      }
      stickyContent.value = "";
    });
  }

  // Desk Action Modal
  const deskModal = document.getElementById("desk-action-modal");
  const deskForm = document.getElementById("desk-action-form");
  const closeDeskModalBtn = document.getElementById("close-desk-modal");

  if (closeDeskModalBtn) closeDeskModalBtn.addEventListener("click", closeDeskModal);
  if (deskModal) {
    deskModal.addEventListener("click", function (e) {
      if (e.target === deskModal) closeDeskModal();
    });
  }

  if (deskForm) {
    deskForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const deskId = document.getElementById("desk-modal-target-id")?.value;
      const subjectInput = document.getElementById("desk-modal-subject");
      const goalInput = document.getElementById("desk-modal-goal");
      const lampInput = document.getElementById("desk-modal-lamp");

      if (!deskId) return;

      const subjectName = subjectInput?.value?.trim() || "Focus Study";
      const goal = goalInput?.value?.trim() || "";
      const lampOn = lampInput ? lampInput.checked : true;

      const postureInput = deskForm.querySelector('input[name="modal-desk-posture"]:checked');
      const posture = postureInput ? postureInput.value : "reading";

      findOrCreateSubject(subjectName);

      if (libraryWs && libraryWs.readyState === WebSocket.OPEN) {
        libraryWs.send(JSON.stringify({
          type: "desk:take",
          deskId: Number(deskId),
          subject: subjectName,
          goal,
          timerSeconds: appData.activeSession ? appData.activeSession.elapsedSeconds : (appData.timerSeconds || 1500),
          lampOn,
          posture
        }));
      }

      closeDeskModal();
    });
  }

  // Close peer popovers when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".desk-minimal-caption") && !e.target.closest(".desk-paper-tooltip") && !e.target.closest(".desk-seated-avatar-wrap")) {
      closeAllPeerPopovers();
    }
  });
}

// Window global helper functions for inline desk events
window.openDeskModal = openDeskModal;
window.leaveDesk = leaveDesk;
window.sendDeskCheer = sendDeskCheer;
window.deleteStickyNote = deleteStickyNote;
window.togglePeerPopover = togglePeerPopover;
window.closeAllPeerPopovers = closeAllPeerPopovers;
window.setMyDeskPosture = setMyDeskPosture;
window.toggleMyDeskLamp = toggleMyDeskLamp;

async function initializeApp() {
  await loadData();
  await loadGroups();
  applyAppearance();
  applySidebarState();
  renderThemes();
  renderTasks();
  renderDistractions();
  renderStudyCircles();
  updateAllDisplays();
  initAmbientSoundEngine();
  initCozyLibraryUI();
  showSettingsSection("profile");
  maybeShowOnboarding();
}

initializeApp();
