import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import cookieParser from "cookie-parser";
import nunjucks from "nunjucks";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Ensure upload folders exist
const uploadsDir = path.join(__dirname, "app", "static", "uploads");
const avatarsDir = path.join(uploadsDir, "avatars");
const bannersDir = path.join(uploadsDir, "banners");
fs.mkdirSync(avatarsDir, { recursive: true });
fs.mkdirSync(bannersDir, { recursive: true });

// Setup Multer for avatar / banner uploads
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Nunjucks Loader supporting Jinja2 {% with %} blocks
class JinjaCompatibleLoader extends nunjucks.FileSystemLoader {
  getSource(name) {
    const res = super.getSource(name);
    if (!res || !res.src) return res;
    // Replace {% with key = val %} -> {% set key = val %} and {% endwith %} -> {# endwith #}
    let src = res.src.replace(/\{%\s*with\s+([^%]+)\s*%\}/g, "{% set $1 %}");
    src = src.replace(/\{%\s*endwith\s*%\}/g, "{# endwith #}");
    return { ...res, src };
  }
}

const templatesPath = path.join(__dirname, "app", "templates");
const nunjucksEnv = new nunjucks.Environment(new JinjaCompatibleLoader(templatesPath), {
  autoescape: false,
  noCache: true
});

nunjucksEnv.addGlobal("url_for", (endpoint, opts) => {
  if (endpoint === "static") {
    return "/static/" + (opts?.filename || "");
  }
  if (endpoint === "auth.login") return "/login";
  if (endpoint === "auth.register") return "/register";
  if (endpoint === "auth.forgot_password") return "/forgot-password";
  if (endpoint === "auth.reset_password") return "/reset-password";
  if (endpoint === "auth.logout") return "/logout";
  if (endpoint === "main.app_home") return "/app";
  if (endpoint === "main.index") return "/";
  if (opts && opts.filename) return "/static/" + opts.filename;
  return "/" + endpoint;
});

nunjucksEnv.addFilter("tojson", (val) => {
  return JSON.stringify(val);
});

// In-Memory Data Store
const users = new Map();
const userAppStates = new Map();
const activeFocusSessions = new Map();
const studyGroups = new Map();
const groupMessages = new Map();
const resetTokens = new Map();

// Default seed user
const defaultUser = {
  id: 1,
  display_name: "Mahenoor",
  username: "mahenoor",
  email: "mahenoor1305@gmail.com",
  password_hash: bcrypt.hashSync("password123", 10),
  bio: "Calm and consistent focus workspace.",
  avatar_url: null,
  banner_url: null,
  avatar_style: "initials",
  avatar_color: "teal",
  onboarding_completed: true,
  country: "India",
  timezone: "Asia/Kolkata",
  study_day_start_time: "00:00",
  preferred_theme: "dark",
  profile_visibility: "private",
  group_visibility: "members",
  leaderboard_visibility: "public",
  created_at: new Date("2026-01-01T00:00:00Z"),
  last_login_at: new Date()
};
users.set(1, defaultUser);

// Sample group
const defaultGroup = {
  id: 101,
  name: "Deep Work Club",
  description: "A calm, supportive room for daily study sessions.",
  invite_code: "CALM26",
  visibility: "public",
  owner_id: 1,
  created_at: new Date().toISOString(),
  members: [
    {
      user_id: 1,
      role: "owner",
      joined_at: new Date().toISOString(),
      display_name: "Mahenoor",
      username: "mahenoor",
      avatar_url: null,
      avatar_style: "initials",
      avatar_color: "teal",
      today_seconds: 7200,
      week_seconds: 36000
    },
    {
      user_id: 2,
      role: "member",
      joined_at: new Date().toISOString(),
      display_name: "Elena Rostova",
      username: "elena_study",
      avatar_url: null,
      avatar_style: "orbit",
      avatar_color: "blue",
      today_seconds: 11400,
      week_seconds: 42000
    },
    {
      user_id: 3,
      role: "member",
      joined_at: new Date().toISOString(),
      display_name: "Dev Patel",
      username: "dev_coder",
      avatar_url: null,
      avatar_style: "spark",
      avatar_color: "amber",
      today_seconds: 9600,
      week_seconds: 31000
    },
    {
      user_id: 102,
      role: "member",
      joined_at: new Date().toISOString(),
      display_name: "Aarav Sharma",
      username: "aarav_s",
      avatar_url: null,
      avatar_style: "spark",
      avatar_color: "rose",
      today_seconds: 8100,
      week_seconds: 28000
    },
    {
      user_id: 103,
      role: "member",
      joined_at: new Date().toISOString(),
      display_name: "Sophia Chen",
      username: "sophia_c",
      avatar_url: null,
      avatar_style: "orbit",
      avatar_color: "purple",
      today_seconds: 12500,
      week_seconds: 49000
    }
  ]
};
studyGroups.set(101, defaultGroup);
groupMessages.set(101, [
  {
    id: 1,
    group_id: 101,
    user_id: 1,
    sender_name: "Mahenoor",
    sender_username: "mahenoor",
    sender_avatar_url: null,
    sender_avatar_style: "initials",
    sender_avatar_color: "teal",
    content: "Welcome to StudyMate! Let's build healthy, calm study habits.",
    created_at: new Date().toISOString()
  }
]);

function serializeProfile(user) {
  return {
    id: user.id,
    displayName: user.display_name,
    username: user.username,
    email: user.email,
    bio: user.bio || "",
    avatarUrl: user.avatar_url,
    bannerUrl: user.banner_url,
    avatarStyle: user.avatar_style || "initials",
    avatarColor: user.avatar_color || "teal",
    onboardingCompleted: !!user.onboarding_completed,
    country: user.country || "",
    timezone: user.timezone || "Asia/Kolkata",
    studyDayStartTime: user.study_day_start_time || "00:00",
    preferredTheme: (user.preferred_theme && user.preferred_theme !== "system") ? user.preferred_theme : "dark",
    profileVisibility: user.profile_visibility || "private",
    groupVisibility: user.group_visibility || "members",
    leaderboardVisibility: user.leaderboard_visibility || "public",
    createdAt: user.created_at ? (user.created_at.toISOString ? user.created_at.toISOString() : user.created_at) : null,
    lastLoginAt: user.last_login_at ? (user.last_login_at.toISOString ? user.last_login_at.toISOString() : user.last_login_at) : null
  };
}

function makeTemplateUser(user) {
  return {
    id: user.id,
    display_name: user.display_name,
    username: user.username,
    email: user.email,
    bio: user.bio || "",
    avatar_url: user.avatar_url,
    banner_url: user.banner_url,
    avatar_style: user.avatar_style || "initials",
    avatar_color: user.avatar_color || "teal",
    onboarding_completed: !!user.onboarding_completed,
    country: user.country || "",
    timezone: user.timezone || "Asia/Kolkata",
    study_day_start_time: user.study_day_start_time || "00:00",
    preferred_theme: (user.preferred_theme && user.preferred_theme !== "system") ? user.preferred_theme : "dark",
    profile_visibility: user.profile_visibility || "private",
    group_visibility: user.group_visibility || "members",
    leaderboard_visibility: user.leaderboard_visibility || "public",
    created_at: {
      isoformat: () => (user.created_at?.toISOString ? user.created_at.toISOString() : String(user.created_at))
    },
    last_login_at: user.last_login_at ? {
      isoformat: () => (user.last_login_at?.toISOString ? user.last_login_at.toISOString() : String(user.last_login_at))
    } : null
  };
}

// Middlewares
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET_KEY || "studymate-calm-secure-secret-key-2026",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// Static files
app.use("/static", express.static(path.join(__dirname, "app", "static")));
app.use("/vendor/three", express.static(path.join(__dirname, "node_modules", "three")));
app.use(express.static(path.join(__dirname, "app", "static")));

// Flash messages middleware
app.use((req, res, next) => {
  if (!req.session.flash) {
    req.session.flash = [];
  }
  req.flash = (category, message) => {
    req.session.flash.push([category, message]);
  };
  req.getFlashedMessages = () => {
    const msgs = req.session.flash || [];
    req.session.flash = [];
    return msgs;
  };
  next();
});

// Auth helper
function getCurrentUser(req) {
  if (req.session.userId) {
    return users.get(req.session.userId) || defaultUser;
  }
  // Auto-login to default user for friction-free developer experience
  req.session.userId = defaultUser.id;
  return defaultUser;
}

// View Renderer Helper
function renderTemplate(req, res, templateName, context = {}) {
  const current_user = getCurrentUser(req);
  const flashMessages = req.getFlashedMessages();

  nunjucksEnv.addGlobal("get_flashed_messages", () => flashMessages);

  const mergedContext = {
    current_user: current_user ? makeTemplateUser(current_user) : null,
    ...context
  };

  try {
    const output = nunjucksEnv.render(templateName, mergedContext);
    res.send(output);
  } catch (err) {
    console.error("Template render error:", err);
    res.status(500).send("Rendering Error: " + err.message);
  }
}

// ----------------- ROUTES ----------------- //

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Main Index
app.get("/", (req, res) => {
  const user = getCurrentUser(req);
  if (user) {
    return res.redirect("/app");
  }
  return res.redirect("/login");
});

// App Dashboard
app.get("/app", (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.redirect("/login");
  }
  return renderTemplate(req, res, "app.html");
});

// Login
app.get("/login", (req, res) => {
  renderTemplate(req, res, "login.html", { login_value: "" });
});

app.post("/login", (req, res) => {
  const { login, password } = req.body;
  const cleanLogin = (login || "").trim().toLowerCase();

  let matchedUser = null;
  for (const u of users.values()) {
    if (u.username.toLowerCase() === cleanLogin || u.email.toLowerCase() === cleanLogin) {
      matchedUser = u;
      break;
    }
  }

  if (!matchedUser || !bcrypt.compareSync(password || "", matchedUser.password_hash)) {
    req.flash("error", "Invalid username/email or password.");
    return renderTemplate(req, res, "login.html", { login_value: login || "" });
  }

  matchedUser.last_login_at = new Date();
  req.session.userId = matchedUser.id;
  res.redirect("/app");
});

// Register
app.get("/register", (req, res) => {
  renderTemplate(req, res, "register.html", {
    form_data: { display_name: "", username: "", email: "" }
  });
});

app.post("/register", (req, res) => {
  const { display_name, username, email, password, confirm_password } = req.body;
  const cleanName = (display_name || "").trim();
  const cleanUser = (username || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();

  const formData = { display_name: cleanName, username: cleanUser, email: cleanEmail };

  if (!cleanName || !cleanUser || !cleanEmail || !password) {
    req.flash("error", "All fields are required.");
    return renderTemplate(req, res, "register.html", { form_data: formData });
  }

  if (password !== confirm_password) {
    req.flash("error", "Passwords do not match.");
    return renderTemplate(req, res, "register.html", { form_data: formData });
  }

  if (password.length < 8) {
    req.flash("error", "Password must be at least 8 characters long.");
    return renderTemplate(req, res, "register.html", { form_data: formData });
  }

  for (const u of users.values()) {
    if (u.username.toLowerCase() === cleanUser.toLowerCase()) {
      req.flash("error", "That username is already taken.");
      return renderTemplate(req, res, "register.html", { form_data: formData });
    }
    if (u.email.toLowerCase() === cleanEmail) {
      req.flash("error", "That email is already registered.");
      return renderTemplate(req, res, "register.html", { form_data: formData });
    }
  }

  const newId = users.size + 1;
  const newUser = {
    id: newId,
    display_name: cleanName,
    username: cleanUser,
    email: cleanEmail,
    password_hash: bcrypt.hashSync(password, 10),
    bio: "",
    avatar_url: null,
    banner_url: null,
    avatar_style: "initials",
    avatar_color: "teal",
    onboarding_completed: false,
    country: "India",
    timezone: "Asia/Kolkata",
    study_day_start_time: "00:00",
    preferred_theme: "dark",
    profile_visibility: "private",
    group_visibility: "members",
    leaderboard_visibility: "public",
    created_at: new Date(),
    last_login_at: new Date()
  };

  users.set(newId, newUser);
  req.session.userId = newId;
  res.redirect("/app");
});

// Forgot Password
app.get("/forgot-password", (req, res) => {
  renderTemplate(req, res, "forgot_password.html");
});

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  req.flash("info", `If an account with ${cleanEmail} exists, password reset instructions have been dispatched.`);
  renderTemplate(req, res, "forgot_password.html");
});

// Reset Password
app.get("/reset-password/:token", (req, res) => {
  renderTemplate(req, res, "reset_password.html");
});

app.post("/reset-password/:token", (req, res) => {
  const { password, confirm_password } = req.body;
  if (!password || password.length < 8) {
    req.flash("error", "Password must be at least 8 characters.");
    return renderTemplate(req, res, "reset_password.html");
  }
  if (password !== confirm_password) {
    req.flash("error", "Passwords do not match.");
    return renderTemplate(req, res, "reset_password.html");
  }
  req.flash("success", "Your password has been reset. Please log in.");
  res.redirect("/login");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/login");
});

// ----------------- API ROUTES ----------------- //

// GET /api/app-data
app.get("/api/app-data", (req, res) => {
  const user = getCurrentUser(req);
  const state = userAppStates.get(user.id);
  res.json({
    appData: state ? state.payload : null,
    hasData: !!state,
    profile: serializeProfile(user)
  });
});

// GET /api/app-data/revision
app.get("/api/app-data/revision", (req, res) => {
  const user = getCurrentUser(req);
  const state = userAppStates.get(user.id);
  const rev = state ? (state.payload?._rev || 0) : 0;
  res.json({ rev });
});

// PUT /api/app-data
app.put("/api/app-data", (req, res) => {
  const user = getCurrentUser(req);
  const current = userAppStates.get(user.id);
  const nextRev = ((current?.payload?._rev || 0) + 1);

  const payload = {
    ...(req.body || {}),
    _rev: nextRev
  };

  userAppStates.set(user.id, {
    user_id: user.id,
    payload,
    updated_at: new Date().toISOString()
  });

  res.json({
    status: "ok",
    rev: nextRev,
    appData: payload
  });
});

// GET /api/focus/active
app.get("/api/focus/active", (req, res) => {
  const user = getCurrentUser(req);
  const active = activeFocusSessions.get(user.id) || null;
  res.json({ activeSession: active });
});

// PUT /api/focus/active
app.put("/api/focus/active", (req, res) => {
  const user = getCurrentUser(req);
  const data = req.body || {};
  activeFocusSessions.set(user.id, data);
  res.json({ status: "ok", activeSession: data });
});

// PATCH /api/focus/active
app.patch("/api/focus/active", (req, res) => {
  const user = getCurrentUser(req);
  const existing = activeFocusSessions.get(user.id) || {};
  const updated = { ...existing, ...(req.body || {}) };
  activeFocusSessions.set(user.id, updated);
  res.json({ status: "ok", activeSession: updated });
});

// DELETE /api/focus/active
app.delete("/api/focus/active", (req, res) => {
  const user = getCurrentUser(req);
  activeFocusSessions.delete(user.id);
  res.json({ status: "ok" });
});

// POST /api/focus/active/complete
app.post("/api/focus/active/complete", (req, res) => {
  const user = getCurrentUser(req);
  const completed = req.body || {};
  activeFocusSessions.delete(user.id);

  // Append to user state sessions if exists
  const state = userAppStates.get(user.id);
  if (state && state.payload) {
    if (!Array.isArray(state.payload.sessions)) {
      state.payload.sessions = [];
    }
    state.payload.sessions.unshift({
      id: uuidv4(),
      ...completed,
      completedAt: new Date().toISOString()
    });
  }

  res.json({ status: "ok", savedSession: completed });
});

// POST /api/focus/active/distraction
app.post("/api/focus/active/distraction", (req, res) => {
  res.json({ status: "ok" });
});

// GET /api/profile
app.get("/api/profile", (req, res) => {
  const user = getCurrentUser(req);
  res.json({ profile: serializeProfile(user) });
});

// PUT or PATCH /api/profile
const updateProfileHandler = (req, res) => {
  const user = getCurrentUser(req);
  const data = req.body || {};

  if (data.displayName !== undefined) user.display_name = data.displayName;
  if (data.username !== undefined) user.username = data.username;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.country !== undefined) user.country = data.country;
  if (data.timezone !== undefined) user.timezone = data.timezone;
  if (data.studyDayStartTime !== undefined) user.study_day_start_time = data.studyDayStartTime;
  if (data.preferredTheme !== undefined) user.preferred_theme = data.preferredTheme;
  if (data.avatarStyle !== undefined) user.avatar_style = data.avatarStyle;
  if (data.avatarColor !== undefined) user.avatar_color = data.avatarColor;
  if (data.onboardingCompleted !== undefined) user.onboarding_completed = data.onboardingCompleted;

  res.json({ profile: serializeProfile(user) });
};
app.put("/api/profile", updateProfileHandler);
app.patch("/api/profile", updateProfileHandler);

// POST /api/profile/avatar
app.post("/api/profile/avatar", upload.single("avatar"), (req, res) => {
  const user = getCurrentUser(req);
  if (req.file) {
    const ext = path.extname(req.file.originalname) || ".png";
    const newFilename = `${user.id}_avatar_${Date.now()}${ext}`;
    const dest = path.join(avatarsDir, newFilename);
    fs.renameSync(req.file.path, dest);
    user.avatar_url = `/static/uploads/avatars/${newFilename}`;
  }
  res.json({ profile: serializeProfile(user) });
});

// DELETE /api/profile/avatar
app.delete("/api/profile/avatar", (req, res) => {
  const user = getCurrentUser(req);
  user.avatar_url = null;
  res.json({ profile: serializeProfile(user) });
});

// POST /api/profile/banner
app.post("/api/profile/banner", upload.single("banner"), (req, res) => {
  const user = getCurrentUser(req);
  if (req.file) {
    const ext = path.extname(req.file.originalname) || ".png";
    const newFilename = `${user.id}_banner_${Date.now()}${ext}`;
    const dest = path.join(bannersDir, newFilename);
    fs.renameSync(req.file.path, dest);
    user.banner_url = `/static/uploads/banners/${newFilename}`;
  }
  res.json({ profile: serializeProfile(user) });
});

// DELETE /api/profile/banner
app.delete("/api/profile/banner", (req, res) => {
  const user = getCurrentUser(req);
  user.banner_url = null;
  res.json({ profile: serializeProfile(user) });
});

// GET /api/groups
app.get("/api/groups", (req, res) => {
  const user = getCurrentUser(req);
  const groupsList = Array.from(studyGroups.values()).map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    inviteCode: g.invite_code,
    visibility: g.visibility,
    isOwner: g.owner_id === user.id,
    isMember: g.members.some(m => m.user_id === user.id),
    membersCount: g.members.length,
    members: g.members
  }));
  res.json({ groups: groupsList });
});

// POST /api/groups
app.post("/api/groups", (req, res) => {
  const user = getCurrentUser(req);
  const { name, description, visibility } = req.body;
  const newGroupId = Date.now();
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const newGroup = {
    id: newGroupId,
    name: name || "My Study Group",
    description: description || "",
    invite_code: inviteCode,
    visibility: visibility || "public",
    owner_id: user.id,
    created_at: new Date().toISOString(),
    members: [
      {
        user_id: user.id,
        role: "owner",
        joined_at: new Date().toISOString(),
        display_name: user.display_name,
        username: user.username,
        avatar_url: user.avatar_url,
        avatar_style: user.avatar_style || "initials",
        avatar_color: user.avatar_color || "teal",
        today_seconds: 0,
        week_seconds: 0
      }
    ]
  };

  studyGroups.set(newGroupId, newGroup);
  groupMessages.set(newGroupId, []);

  res.json({
    group: {
      ...newGroup,
      isOwner: true,
      isMember: true,
      membersCount: 1
    }
  });
});

// POST /api/groups/join
app.post("/api/groups/join", (req, res) => {
  const user = getCurrentUser(req);
  const { inviteCode } = req.body;
  const code = (inviteCode || "").trim().toUpperCase();

  let found = null;
  for (const g of studyGroups.values()) {
    if (g.invite_code === code) {
      found = g;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ error: "Invalid invite code" });
  }

  if (!found.members.some(m => m.user_id === user.id)) {
    found.members.push({
      user_id: user.id,
      role: "member",
      joined_at: new Date().toISOString(),
      display_name: user.display_name,
      username: user.username,
      avatar_url: user.avatar_url,
      avatar_style: user.avatar_style || "initials",
      avatar_color: user.avatar_color || "teal",
      today_seconds: 0,
      week_seconds: 0
    });
  }

  res.json({
    group: {
      ...found,
      isOwner: found.owner_id === user.id,
      isMember: true,
      membersCount: found.members.length
    }
  });
});

// GET /api/groups/:id
app.get("/api/groups/:id", (req, res) => {
  const user = getCurrentUser(req);
  const group = studyGroups.get(Number(req.params.id));
  if (!group) return res.status(404).json({ error: "Group not found" });

  res.json({
    group: {
      ...group,
      isOwner: group.owner_id === user.id,
      isMember: group.members.some(m => m.user_id === user.id),
      membersCount: group.members.length
    }
  });
});

// GET /api/groups/:id/messages
app.get("/api/groups/:id/messages", (req, res) => {
  const gid = Number(req.params.id);
  const msgs = groupMessages.get(gid) || [];
  res.json({ messages: msgs });
});

// POST /api/groups/:id/messages
app.post("/api/groups/:id/messages", (req, res) => {
  const user = getCurrentUser(req);
  const gid = Number(req.params.id);
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Message content is required" });
  }

  const message = {
    id: Date.now(),
    group_id: gid,
    user_id: user.id,
    sender_name: user.display_name,
    sender_username: user.username,
    sender_avatar_url: user.avatar_url,
    sender_avatar_style: user.avatar_style || "initials",
    sender_avatar_color: user.avatar_color || "teal",
    content: content.trim(),
    created_at: new Date().toISOString()
  };

  const msgs = groupMessages.get(gid) || [];
  msgs.push(message);
  groupMessages.set(gid, msgs);

  res.json({ message });
});

// GET /api/leaderboard
app.get("/api/leaderboard", (req, res) => {
  const leaderboard = [
    {
      userId: 1,
      displayName: "Mahenoor",
      username: "mahenoor",
      avatarUrl: null,
      avatarStyle: "initials",
      avatarColor: "teal",
      todayHours: 3.5,
      weekHours: 18.2,
      streak: 7
    },
    {
      userId: 2,
      displayName: "Elena Rostova",
      username: "elena_study",
      avatarUrl: null,
      avatarStyle: "orbit",
      avatarColor: "blue",
      todayHours: 4.2,
      weekHours: 24.5,
      streak: 12
    },
    {
      userId: 3,
      displayName: "Dev Patel",
      username: "dev_coder",
      avatarUrl: null,
      avatarStyle: "spark",
      avatarColor: "amber",
      todayHours: 2.8,
      weekHours: 15.0,
      streak: 5
    }
  ];
  res.json({ leaderboard });
});

// CRUD Session handlers
app.post("/api/sessions", (req, res) => {
  const session = { id: uuidv4(), ...(req.body || {}), created_at: new Date().toISOString() };
  res.json({ session });
});
app.get("/api/sessions/:id", (req, res) => {
  res.json({ session: { id: req.params.id } });
});
app.put("/api/sessions/:id", (req, res) => {
  res.json({ session: { id: req.params.id, ...(req.body || {}) } });
});
app.delete("/api/sessions/:id", (req, res) => {
  res.json({ status: "ok" });
});
app.put("/api/sessions/client/:id", (req, res) => {
  res.json({ session: { client_id: req.params.id, ...(req.body || {}) } });
});
app.delete("/api/sessions/client/:id", (req, res) => {
  res.json({ status: "ok" });
});

// Subjects CRUD
app.get("/api/subjects/:id", (req, res) => res.json({ subject: { id: req.params.id } }));
app.put("/api/subjects/:id", (req, res) => res.json({ subject: { id: req.params.id, ...(req.body || {}) } }));
app.delete("/api/subjects/:id", (req, res) => res.json({ status: "ok" }));

// ----------------- COZY LIBRARY & VC LOUNGE ----------------- //
const libraryRooms = new Map();

const defaultLibraryRoom = {
  id: "grand-oak",
  name: "Common Library",
  atmosphere: "midnight", // "cloudy" | "sunny" | "midnight"
  syncTimer: {
    status: "running",
    mode: "focus", // "focus" | "break"
    focusMinutes: 25,
    breakMinutes: 5,
    remainingSeconds: 23 * 60 + 40,
    lastTick: Date.now()
  },
  desks: [
    {
      id: 1,
      label: "Window Nook 1",
      occupiedBy: {
        userId: 2,
        displayName: "Elena Rostova",
        avatarStyle: "orbit",
        avatarColor: "blue",
        subject: "Calculus III",
        goal: "Stokes' Theorem problem set",
        timerSeconds: 1140,
        lampOn: true,
        posture: "reading",
        isBuddy: true
      }
    },
    {
      id: 2,
      label: "Window Nook 2",
      occupiedBy: null
    },
    {
      id: 3,
      label: "Window Nook 3",
      occupiedBy: {
        userId: 3,
        displayName: "Dev Patel",
        avatarStyle: "spark",
        avatarColor: "amber",
        subject: "Algorithms",
        goal: "Graph traversals & DFS/BFS",
        timerSeconds: 960,
        lampOn: true,
        posture: "typing",
        isBuddy: true
      }
    },
    {
      id: 4,
      label: "Window Nook 4",
      occupiedBy: null
    },
    {
      id: 5,
      label: "Window Nook 5",
      occupiedBy: null
    },
    {
      id: 6,
      label: "Hearthside 6",
      occupiedBy: null
    },
    {
      id: 7,
      label: "Hearthside 7",
      occupiedBy: null
    },
    {
      id: 8,
      label: "Hearthside 8",
      occupiedBy: null
    },
    {
      id: 9,
      label: "Hearthside 9",
      occupiedBy: null
    },
    {
      id: 10,
      label: "Hearthside 10",
      occupiedBy: null
    },
    {
      id: 11,
      label: "Main Archive 11",
      occupiedBy: null
    },
    {
      id: 12,
      label: "Main Archive 12",
      occupiedBy: null
    },
    {
      id: 13,
      label: "Main Archive 13",
      occupiedBy: null
    },
    {
      id: 14,
      label: "Main Archive 14",
      occupiedBy: null
    },
    {
      id: 15,
      label: "Main Archive 15",
      occupiedBy: null
    },
    {
      id: 16,
      label: "Quiet Corner 16",
      occupiedBy: null
    },
    {
      id: 17,
      label: "Quiet Corner 17",
      occupiedBy: null
    },
    {
      id: 18,
      label: "Quiet Corner 18",
      occupiedBy: null
    },
    {
      id: 19,
      label: "Quiet Corner 19",
      occupiedBy: null
    },
    {
      id: 20,
      label: "Quiet Corner 20",
      occupiedBy: null
    },
    ...Array.from({ length: 16 }, (_, idx) => ({
      id: 21 + idx,
      label: `2nd Floor Mezzanine ${21 + idx}`,
      occupiedBy: null,
      reservedBy: null
    })),
    ...Array.from({ length: 16 }, (_, idx) => ({
      id: 37 + idx,
      label: `Archive Wing ${37 + idx}`,
      occupiedBy: null,
      reservedBy: null
    }))
  ],
  stickyNotes: [
    {
      id: "note-1",
      author: "Elena R.",
      color: "sage",
      content: "Reminder: Review vector calculus problem set before 3pm tomorrow!",
      createdAt: new Date().toISOString()
    },
    {
      id: "note-2",
      author: "Dev P.",
      color: "amber",
      content: "2 more 25m pomodoros today. Phones away, deep focus mode!",
      createdAt: new Date().toISOString()
    }
  ],
  messages: [
    {
      id: "msg-1",
      senderName: "Elena Rostova",
      senderAvatarStyle: "orbit",
      senderAvatarColor: "blue",
      content: "Welcome to the study library! The rain outside makes it so peaceful today.",
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "msg-2",
      senderName: "Dev Patel",
      senderAvatarStyle: "spark",
      senderAvatarColor: "amber",
      content: "Starting a 25m focus sprint on algorithms. Feel free to join VC anytime!",
      createdAt: new Date(Date.now() - 600000).toISOString()
    }
  ],
  vcParticipants: new Map() // peerId -> { peerId, userId, displayName, avatarStyle, avatarColor, hasVideo, hasAudio, isScreenSharing, isSpeaking }
};
libraryRooms.set("grand-oak", defaultLibraryRoom);
libraryRooms.set("common", defaultLibraryRoom);

function getOrCreateLibraryRoom(roomId = "common") {
  const normId = roomId || "common";
  if (libraryRooms.has(normId)) {
    return libraryRooms.get(normId);
  }
  if (normId === "grand-oak") {
    return defaultLibraryRoom;
  }
  const isGroup = normId.startsWith("group:");
  const desks = [];
  const deskCount = 52;
  for (let i = 1; i <= deskCount; i++) {
    const zone = i <= 5 ? "Window Nook" : (i <= 10 ? "Hearthside" : (i <= 15 ? "Main Archive" : (i <= 20 ? "Quiet Corner" : (i <= 36 ? "2nd Floor Mezzanine" : "Archive Wing"))));
    desks.push({
      id: i,
      label: `${zone} ${i}`,
      occupiedBy: null,
      reservedBy: null
    });
  }
  desks[0].occupiedBy = {
    userId: 2,
    displayName: "Elena Rostova",
    avatarStyle: "orbit",
    avatarColor: "blue",
    subject: "Calculus III",
    goal: "Stokes' Theorem problem set",
    timerSeconds: 1140,
    lampOn: true,
    posture: "reading",
    isBuddy: true
  };
  desks[2].occupiedBy = {
    userId: 3,
    displayName: "Dev Patel",
    avatarStyle: "spark",
    avatarColor: "amber",
    subject: "Algorithms",
    goal: "Graph traversals & DFS/BFS",
    timerSeconds: 960,
    lampOn: true,
    posture: "typing",
    isBuddy: true
  };
  if (isGroup) {
    desks[1].reservedBy = {
      userId: 102,
      displayName: "Aarav Sharma",
      avatarStyle: "spark",
      avatarColor: "rose",
      subject: "Quantum Mechanics"
    };
    desks[3].reservedBy = {
      userId: 103,
      displayName: "Sophia Chen",
      avatarStyle: "orbit",
      avatarColor: "purple",
      subject: "Organic Chemistry"
    };
  }
  const newRoom = {
    id: normId,
    name: isGroup ? "Group Library" : "Common Library",
    atmosphere: "midnight",
    activeFloor: "ground",
    syncTimer: {
      status: "running",
      mode: "focus",
      focusMinutes: 25,
      breakMinutes: 5,
      remainingSeconds: 23 * 60 + 40,
      lastTick: Date.now()
    },
    desks: desks,
    stickyNotes: [],
    messages: [],
    vcParticipants: new Map()
  };
  libraryRooms.set(normId, newRoom);
  return newRoom;
}

// Library REST API
app.get("/api/library/room", (req, res) => {
  const roomId = req.query.roomId || "common";
  const room = getOrCreateLibraryRoom(roomId);
  res.json({
    room: {
      id: room.id,
      name: room.name,
      atmosphere: room.atmosphere,
      activeFloor: room.activeFloor || "ground",
      syncTimer: room.syncTimer,
      desks: room.desks,
      stickyNotes: room.stickyNotes,
      messages: room.messages,
      vcParticipants: Array.from(room.vcParticipants.values())
    }
  });
});

// Create HTTP server & WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws/library" });
const wsClients = new Map(); // ws -> { clientId, peerId, roomId, user }

function broadcastToRoom(roomId, message, excludeWs = null) {
  const payload = JSON.stringify(message);
  for (const [clientWs, clientMeta] of wsClients.entries()) {
    if (clientMeta.roomId === roomId && clientWs !== excludeWs && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(payload);
    }
  }
}

// Background interval for room synchronized timer
setInterval(() => {
  const room = libraryRooms.get("grand-oak");
  if (!room || room.syncTimer.status !== "running") return;

  room.syncTimer.remainingSeconds -= 1;
  if (room.syncTimer.remainingSeconds <= 0) {
    if (room.syncTimer.mode === "focus") {
      room.syncTimer.mode = "break";
      room.syncTimer.remainingSeconds = (room.syncTimer.breakMinutes || 5) * 60;
    } else {
      room.syncTimer.mode = "focus";
      room.syncTimer.remainingSeconds = (room.syncTimer.focusMinutes || 25) * 60;
    }
    broadcastToRoom("grand-oak", {
      type: "timer:cycle_switched",
      syncTimer: room.syncTimer
    });
  }
}, 1000);

wss.on("connection", (ws) => {
  const clientId = uuidv4();
  const peerId = "peer-" + Math.random().toString(36).substring(2, 9);
  wsClients.set(ws, { clientId, peerId, roomId: "grand-oak", user: null });

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw);
      const meta = wsClients.get(ws);
      if (!meta) return;
      const roomId = meta.roomId || "grand-oak";
      const room = libraryRooms.get(roomId);
      if (!room) return;

      switch (data.type) {
        case "join:library": {
          meta.user = data.user || { displayName: "Guest", id: 0 };
          if (data.roomId) meta.roomId = data.roomId;
          const targetRoom = getOrCreateLibraryRoom(meta.roomId || "common");
          ws.send(JSON.stringify({
            type: "init:room_state",
            peerId: meta.peerId,
            room: {
              id: targetRoom.id,
              name: targetRoom.name,
              atmosphere: targetRoom.atmosphere,
              activeFloor: targetRoom.activeFloor || "ground",
              syncTimer: targetRoom.syncTimer,
              desks: targetRoom.desks,
              stickyNotes: targetRoom.stickyNotes,
              messages: targetRoom.messages,
              vcParticipants: Array.from(targetRoom.vcParticipants.values())
            }
          }));
          break;
        }

        case "room:switch_floor": {
          const { floorId } = data;
          room.activeFloor = floorId || "ground";
          broadcastToRoom(roomId, {
            type: "room:floor_switched",
            floorId: room.activeFloor
          });
          break;
        }

        case "desk:take": {
          const { deskId, subject, goal, timerSeconds, lampOn } = data;
          const desk = room.desks.find(d => d.id === Number(deskId));
          if (!desk) break;

          const currentUserId = meta.user?.id;
          const isOccupiedByOther =
            desk.occupiedBy &&
            (String(desk.occupiedBy.userId) !== String(currentUserId) || desk.occupiedBy.isBuddy) &&
            desk.occupiedBy.peerId !== meta.peerId;

          if (isOccupiedByOther) {
            ws.send(JSON.stringify({
              type: "desk:occupied_error",
              deskId: desk.id,
              message: `${desk.occupiedBy.displayName || "Another student"} is already studying at this desk.`,
              desks: room.desks
            }));
            break;
          }

          // Strict Single-Seat Rule: Free any other desk previously occupied by this user or peer
          const vacatedDeskIds = [];
          room.desks.forEach(d => {
            if (
              d.id !== desk.id &&
              d.occupiedBy &&
              !d.occupiedBy.isBuddy &&
              (String(d.occupiedBy.userId) === String(currentUserId) || d.occupiedBy.peerId === meta.peerId)
            ) {
              d.occupiedBy = null;
              vacatedDeskIds.push(d.id);
              broadcastToRoom(roomId, {
                type: "desk:updated",
                deskId: d.id,
                desk: d,
                desks: room.desks
              });
            }
          });

          desk.occupiedBy = {
            userId: currentUserId,
            peerId: meta.peerId,
            displayName: meta.user?.displayName || "Student",
            avatarStyle: meta.user?.avatarStyle || "initials",
            avatarColor: meta.user?.avatarColor || "teal",
            avatarUrl: meta.user?.avatarUrl || null,
            subject: subject || "Focus Study",
            goal: goal || "",
            timerSeconds: timerSeconds || 1500,
            lampOn: lampOn !== false,
            posture: data.posture || "reading",
            isBuddy: false,
            joinedAt: new Date().toISOString()
          };

          broadcastToRoom(roomId, {
            type: "desk:updated",
            deskId: desk.id,
            vacatedDeskIds,
            desk,
            desks: room.desks
          });
          break;
        }

        case "desk:leave": {
          const { deskId } = data;
          const currentUserId = meta.user?.id;
          let changed = false;
          room.desks.forEach(d => {
            const matchId = deskId ? d.id === Number(deskId) : true;
            if (
              matchId &&
              d.occupiedBy &&
              !d.occupiedBy.isBuddy &&
              (String(d.occupiedBy.userId) === String(currentUserId) || d.occupiedBy.peerId === meta.peerId)
            ) {
              d.occupiedBy = null;
              changed = true;
              broadcastToRoom(roomId, {
                type: "desk:updated",
                deskId: d.id,
                desk: d,
                desks: room.desks
              });
            }
          });
          if (!changed && deskId) {
            const desk = room.desks.find(d => d.id === Number(deskId));
            if (desk) {
              broadcastToRoom(roomId, {
                type: "desk:updated",
                deskId: desk.id,
                desk,
                desks: room.desks
              });
            }
          }
          break;
        }

        case "desk:posture": {
          const { deskId, posture } = data;
          const currentUserId = meta.user?.id;
          const desk = room.desks.find(d =>
            deskId
              ? d.id === Number(deskId)
              : d.occupiedBy && !d.occupiedBy.isBuddy && (String(d.occupiedBy.userId) === String(currentUserId) || d.occupiedBy.peerId === meta.peerId)
          );
          if (desk && desk.occupiedBy && (String(desk.occupiedBy.userId) === String(currentUserId) || desk.occupiedBy.peerId === meta.peerId)) {
            desk.occupiedBy.posture = posture || "reading";
            broadcastToRoom(roomId, {
              type: "desk:updated",
              deskId: desk.id,
              desk,
              desks: room.desks
            });
          }
          break;
        }

        case "desk:update_progress": {
          const { deskId, timerSeconds, subject, goal, lampOn, posture } = data;
          const currentUserId = meta.user?.id;
          const desk = room.desks.find(d => d.id === Number(deskId));
          if (desk && desk.occupiedBy && (String(desk.occupiedBy.userId) === String(currentUserId) || desk.occupiedBy.peerId === meta.peerId)) {
            if (timerSeconds !== undefined) desk.occupiedBy.timerSeconds = timerSeconds;
            if (subject) desk.occupiedBy.subject = subject;
            if (goal !== undefined) desk.occupiedBy.goal = goal;
            if (lampOn !== undefined) desk.occupiedBy.lampOn = lampOn;
            if (posture !== undefined) desk.occupiedBy.posture = posture;

            broadcastToRoom(roomId, {
              type: "desk:updated",
              deskId: desk.id,
              desk,
              desks: room.desks
            });
          }
          break;
        }

        case "desk:cheer": {
          const { targetDeskId, reaction } = data;
          broadcastToRoom(roomId, {
            type: "desk:cheer_received",
            targetDeskId: Number(targetDeskId),
            reaction: reaction || "☕",
            fromName: meta.user ? meta.user.displayName : "A friend"
          });
          break;
        }

        case "desk:reserve": {
          if (!String(roomId).startsWith("group:")) break;
          const { deskId, subject } = data;
          const desk = room.desks.find(d => d.id === Number(deskId));
          if (!desk) break;
          const currentUserId = meta.user?.id || 1;
          const displayName = meta.user?.displayName || "Student";

          room.desks.forEach(d => {
            if (d.id !== desk.id && d.reservedBy && String(d.reservedBy.userId) === String(currentUserId)) {
              d.reservedBy = null;
            }
          });

          desk.reservedBy = {
            userId: currentUserId,
            peerId: meta.peerId,
            displayName: displayName,
            avatarStyle: meta.user?.avatarStyle || "initials",
            avatarColor: meta.user?.avatarColor || "teal",
            subject: subject || "Focus Study",
            reservedAt: new Date().toISOString()
          };

          broadcastToRoom(roomId, {
            type: "desk:updated",
            deskId: desk.id,
            desk,
            desks: room.desks
          });
          break;
        }

        case "desk:unreserve": {
          if (!String(roomId).startsWith("group:")) break;
          const { deskId } = data;
          const desk = room.desks.find(d => d.id === Number(deskId));
          if (!desk) break;
          desk.reservedBy = null;

          broadcastToRoom(roomId, {
            type: "desk:updated",
            deskId: desk.id,
            desk,
            desks: room.desks
          });
          break;
        }

        case "room:atmosphere": {
          const { atmosphere } = data;
          if (atmosphere) {
            room.atmosphere = atmosphere;
            broadcastToRoom(roomId, {
              type: "room:atmosphere_changed",
              atmosphere
            });
          }
          break;
        }

        case "room:timer_action": {
          const { action, minutes, mode } = data;
          if (action === "start") {
            room.syncTimer.status = "running";
          } else if (action === "pause") {
            room.syncTimer.status = "paused";
          } else if (action === "reset") {
            const targetMins = room.syncTimer.mode === "break" ? (room.syncTimer.breakMinutes || 5) : (room.syncTimer.focusMinutes || 25);
            room.syncTimer.remainingSeconds = targetMins * 60;
          } else if (action === "set_mode") {
            room.syncTimer.mode = mode || "focus";
            const targetMins = mode === "break" ? (room.syncTimer.breakMinutes || 5) : (room.syncTimer.focusMinutes || 25);
            room.syncTimer.remainingSeconds = targetMins * 60;
          } else if (action === "set_duration" && minutes) {
            if (room.syncTimer.mode === "focus") {
              room.syncTimer.focusMinutes = Number(minutes);
              room.syncTimer.remainingSeconds = Number(minutes) * 60;
            } else {
              room.syncTimer.breakMinutes = Number(minutes);
              room.syncTimer.remainingSeconds = Number(minutes) * 60;
            }
          }
          broadcastToRoom(roomId, {
            type: "timer:updated",
            syncTimer: room.syncTimer
          });
          break;
        }

        case "chat:message": {
          const { content } = data;
          if (content && content.trim()) {
            const newMsg = {
              id: "msg-" + Date.now(),
              senderName: meta.user?.displayName || "Student",
              senderAvatarStyle: meta.user?.avatarStyle || "initials",
              senderAvatarColor: meta.user?.avatarColor || "teal",
              senderAvatarUrl: meta.user?.avatarUrl || null,
              content: content.trim(),
              createdAt: new Date().toISOString()
            };
            room.messages.push(newMsg);
            if (room.messages.length > 100) room.messages.shift();
            broadcastToRoom(roomId, {
              type: "chat:new_message",
              message: newMsg
            });
          }
          break;
        }

        case "sticky:add": {
          const { content, color } = data;
          if (content && content.trim()) {
            const newNote = {
              id: "note-" + Date.now(),
              author: meta.user?.displayName || "Student",
              color: color || "amber",
              content: content.trim(),
              createdAt: new Date().toISOString()
            };
            room.stickyNotes.unshift(newNote);
            if (room.stickyNotes.length > 20) room.stickyNotes.pop();
            broadcastToRoom(roomId, {
              type: "sticky:added",
              note: newNote
            });
          }
          break;
        }

        case "sticky:delete": {
          const { noteId } = data;
          room.stickyNotes = room.stickyNotes.filter(n => n.id !== noteId);
          broadcastToRoom(roomId, {
            type: "sticky:deleted",
            noteId
          });
          break;
        }

        // --- WebRTC Voice & Video Call (VC) Signaling ---
        case "vc:join": {
          const { hasVideo, hasAudio } = data;
          const participant = {
            peerId: meta.peerId,
            userId: meta.user?.id || 0,
            displayName: meta.user?.displayName || "Student",
            avatarStyle: meta.user?.avatarStyle || "initials",
            avatarColor: meta.user?.avatarColor || "teal",
            avatarUrl: meta.user?.avatarUrl || null,
            hasVideo: !!hasVideo,
            hasAudio: !!hasAudio,
            isScreenSharing: false,
            isSpeaking: false,
            joinedAt: new Date().toISOString()
          };

          // Existing peers in the VC room (excluding self)
          const existingPeers = Array.from(room.vcParticipants.values()).filter(p => p.peerId !== meta.peerId);
          room.vcParticipants.set(meta.peerId, participant);
          const allParticipants = Array.from(room.vcParticipants.values());

          // Tell the joining client about existing peers so they can initiate offers
          ws.send(JSON.stringify({
            type: "vc:existing_peers",
            peers: existingPeers,
            participants: allParticipants
          }));

          // Tell others that a new peer joined
          broadcastToRoom(roomId, {
            type: "vc:participant_joined",
            participant,
            participants: allParticipants
          }, ws);

          // Broadcast updated participant list to everyone in the room
          broadcastToRoom(roomId, {
            type: "vc:participants_updated",
            participants: allParticipants
          });
          break;
        }

        case "vc:leave": {
          if (room.vcParticipants.has(meta.peerId)) {
            room.vcParticipants.delete(meta.peerId);
            const allParticipants = Array.from(room.vcParticipants.values());
            broadcastToRoom(roomId, {
              type: "vc:participant_left",
              peerId: meta.peerId,
              participants: allParticipants
            });
            broadcastToRoom(roomId, {
              type: "vc:participants_updated",
              participants: allParticipants
            });
          }
          break;
        }

        case "vc:media_state": {
          const participant = room.vcParticipants.get(meta.peerId);
          if (participant) {
            if (data.hasVideo !== undefined) participant.hasVideo = data.hasVideo;
            if (data.hasAudio !== undefined) participant.hasAudio = data.hasAudio;
            if (data.isScreenSharing !== undefined) participant.isScreenSharing = data.isScreenSharing;
            if (data.isSpeaking !== undefined) participant.isSpeaking = data.isSpeaking;

            broadcastToRoom(roomId, {
              type: "vc:media_state_changed",
              peerId: meta.peerId,
              participant,
              participants: Array.from(room.vcParticipants.values())
            });
          }
          break;
        }

        case "offer":
        case "signal:offer": {
          const { targetPeerId, offer } = data;
          for (const [targetWs, targetMeta] of wsClients.entries()) {
            if (targetMeta.peerId === targetPeerId && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: "signal:offer",
                fromPeerId: meta.peerId,
                fromUser: meta.user,
                offer
              }));
              break;
            }
          }
          break;
        }

        case "answer":
        case "signal:answer": {
          const { targetPeerId, answer } = data;
          for (const [targetWs, targetMeta] of wsClients.entries()) {
            if (targetMeta.peerId === targetPeerId && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: "signal:answer",
                fromPeerId: meta.peerId,
                answer
              }));
              break;
            }
          }
          break;
        }

        case "ice-candidate":
        case "signal:ice_candidate": {
          const { targetPeerId, candidate } = data;
          for (const [targetWs, targetMeta] of wsClients.entries()) {
            if (targetMeta.peerId === targetPeerId && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: "signal:ice_candidate",
                fromPeerId: meta.peerId,
                candidate
              }));
              break;
            }
          }
          break;
        }
      }
    } catch (err) {
      console.warn("WebSocket message error:", err);
    }
  });

  ws.on("close", () => {
    const meta = wsClients.get(ws);
    if (meta) {
      const room = libraryRooms.get(meta.roomId);
      if (room) {
        // If user was in VC, leave
        if (room.vcParticipants.has(meta.peerId)) {
          room.vcParticipants.delete(meta.peerId);
          const allParticipants = Array.from(room.vcParticipants.values());
          broadcastToRoom(meta.roomId, {
            type: "vc:participant_left",
            peerId: meta.peerId,
            participants: allParticipants
          });
          broadcastToRoom(meta.roomId, {
            type: "vc:participants_updated",
            participants: allParticipants
          });
        }
        // If user occupied a non-buddy desk, leave desk
        room.desks.forEach(d => {
          if (
            d.occupiedBy &&
            !d.occupiedBy.isBuddy &&
            (d.occupiedBy.peerId === meta.peerId || (meta.user && String(d.occupiedBy.userId) === String(meta.user.id)))
          ) {
            d.occupiedBy = null;
            broadcastToRoom(meta.roomId, {
              type: "desk:updated",
              deskId: d.id,
              desk: d,
              desks: room.desks
            });
          }
        });
      }
      wsClients.delete(ws);
    }
  });
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`StudyMate server with WebSockets listening on http://${HOST}:${PORT}`);
});
