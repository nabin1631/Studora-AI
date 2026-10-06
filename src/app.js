const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const chatRoutes = require("./routes/chatRoutes"); // Added chat routes import
const taskRoutes = require("./routes/taskRoutes");
const pdfRoutes = require("./routes/pdfRoutes"); // Added PDF routes import
const quizRoutes = require("./routes/quizRoutes"); // Added Quiz routes import

const { protect } = require("./middleware/authMiddleware");

// ==============================
// Models
// ==============================
const User = require("./models/User");
const Note = require("./models/Note");
const Task = require("./models/Task");

const app = express();

app.set("trust proxy", 1);

// ==============================
// Rate Limit Security
// ==============================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    success: false,
    message: "Too many requests, try again later",
  },
});

// ==============================
// Security Middleware
// ==============================
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// ==============================
// Logger
// ==============================
app.use(morgan("dev"));

// ==============================
// Body Parser
// ==============================
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==============================
// Test Route
// ==============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "STUDORA AI Backend Running",
  });
});

// ==============================
// Authentication Routes
// ==============================
app.use("/api/auth", authLimiter, authRoutes);

// ==============================
// Notes Routes
// ==============================
app.use("/api/notes", noteRoutes);

// ==============================
// Chat Routes
// ==============================
app.use("/api/chat", chatRoutes); // Added chat middleware mount

// ==============================
// Planner / Tasks Routes
// ==============================
app.use("/api/tasks", taskRoutes);

// ==============================
// PDF Routes
// ==============================
app.use("/api/pdf", pdfRoutes);

// ==============================
// Quiz Routes
// ==============================
app.use("/api/quiz", quizRoutes); // Added quiz middleware mount

// ==============================
// Endpoint 1: Dashboard Stats
// ==============================
app.get("/api/dashboard/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const [notes, tasks] = await Promise.all([
      Note.find({ user: userId }),
      Task.find({ user: userId }),
    ]);

    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = tasks.filter((t) => !t.completed).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTasks = tasks.filter((t) => {
      const d = new Date(t.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    const recentNotes = notes
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4);

    const upcomingTasks = tasks
      .filter((t) => !t.completed && new Date(t.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const notesThisWeek = notes.filter((n) => new Date(n.createdAt) >= weekAgo).length;

    res.json({
      success: true,
      stats: {
        totalNotes: notes.length,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        todayTasksCount: todayTasks.length,
        todayCompletedCount: todayTasks.filter((t) => t.completed).length,
        notesThisWeek,
        recentNotes,
        upcomingTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==============================
// Endpoint 2: Analytics Data
// ==============================
app.get("/api/analytics", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const [notes, tasks] = await Promise.all([
      Note.find({ user: userId }),
      Task.find({ user: userId }),
    ]);

    // Notes per subject
    const notesBySubject = notes.reduce((acc, note) => {
      const s = note.subject || "General";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    // Tasks per subject
    const tasksBySubject = tasks.reduce((acc, task) => {
      const s = task.subject || "General";
      if (!acc[s]) acc[s] = { total: 0, completed: 0 };
      acc[s].total++;
      if (task.completed) acc[s].completed++;
      return acc;
    }, {});

    // Notes created per day (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const count = notes.filter((n) => {
        const nd = new Date(n.createdAt);
        nd.setHours(0, 0, 0, 0);
        return nd.getTime() === d.getTime();
      }).length;
      last7Days.push({ label, count });
    }

    // Tasks per priority
    const tasksByPriority = {
      low: tasks.filter((t) => t.priority === "low").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      high: tasks.filter((t) => t.priority === "high").length,
    };

    // Completion rate
    const completionRate =
      tasks.length === 0
        ? 0
        : Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);

    // Important notes count
    const importantNotes = notes.filter((n) => n.isImportant).length;

    // Tasks due this week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);
    const tasksDueThisWeek = tasks.filter((t) => {
      const d = new Date(t.date);
      return d >= today && d <= weekEnd && !t.completed;
    }).length;

    res.json({
      success: true,
      analytics: {
        notesBySubject,
        tasksBySubject,
        last7Days,
        tasksByPriority,
        completionRate,
        importantNotes,
        tasksDueThisWeek,
        totalNotes: notes.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.completed).length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==============================
// Protected Route (Profile)
// ==============================
app.get("/api/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });
});

// ==============================
// User Profile / Settings Routes
// ==============================

// Update profile name
app.put("/api/user/profile", protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Change password
app.put("/api/user/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new password are required",
      });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!\%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters with a letter, number and symbol",
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete account
app.delete("/api/user/delete-account", protect, async (req, res) => {
  try {
    const userId = req.user._id; // Delete all user data
    await Promise.all([
      require("./models/Note").deleteMany({ user: userId }),
      require("./models/Task").deleteMany({ user: userId }),
      require("./models/Chat").deleteMany({ user: userId }),
      require("./models/Pdf").deleteMany({ user: userId }),
      require("./models/Quiz").deleteMany({ createdBy: userId }),
      require("./models/QuizAttempt").deleteMany({ user: userId }),
      require("./models/User").findByIdAndDelete(userId),
    ]);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==============================
// Notifications Center Endpoint
// ==============================
app.get("/api/notifications", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);

    const [tasks, user] = await Promise.all([
      Task.find({ user: userId, completed: false }),
      User.findById(userId).select("streak badges points totalQuizzes lastQuizDate name")
    ]);

    const notifications = [];

    // Tasks due today
    const todayTasks = tasks.filter(t => {
      const d = new Date(t.date); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    if (todayTasks.length > 0) {
      notifications.push({
        id: "tasks_today",
        type: "warning",
        icon: "📅",
        title: `${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} due today`,
        message: todayTasks.slice(0, 2).map(t => t.title).join(", ") + (todayTasks.length > 2 ? ` +${todayTasks.length - 2} more` : ""),
        time: "Today",
        action: "/planner"
      });
    }

    // Tasks due tomorrow
    const tomorrowTasks = tasks.filter(t => {
      const d = new Date(t.date); d.setHours(0, 0, 0, 0);
      return d.getTime() === tomorrow.getTime();
    });
    if (tomorrowTasks.length > 0) {
      notifications.push({
        id: "tasks_tomorrow",
        type: "info",
        icon: "⏰",
        title: `${tomorrowTasks.length} task${tomorrowTasks.length > 1 ? "s" : ""} due tomorrow`,
        message: tomorrowTasks.slice(0, 2).map(t => t.title).join(", "),
        time: "Tomorrow",
        action: "/planner"
      });
    }

    // Overdue tasks
    const overdueTasks = tasks.filter(t => {
      const d = new Date(t.date); d.setHours(0, 0, 0, 0);
      return d.getTime() < today.getTime();
    });
    if (overdueTasks.length > 0) {
      notifications.push({
        id: "tasks_overdue",
        type: "error",
        icon: "🚨",
        title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`,
        message: "You have tasks past their due date",
        time: "Overdue",
        action: "/planner"
      });
    }

    // Streak reminder
    if (user.lastQuizDate) {
      const lastQuiz = new Date(user.lastQuizDate); lastQuiz.setHours(0, 0, 0, 0);
      const diff = Math.floor((today - lastQuiz) / (1000 * 60 * 60 * 24));
      if (diff === 1 && user.streak > 0) {
        notifications.push({
          id: "streak_reminder",
          type: "warning",
          icon: "🔥",
          title: `Keep your ${user.streak}-day streak!`,
          message: "Take a quiz today to maintain your streak",
          time: "Today",
          action: "/quiz-arena"
        });
      } else if (diff >= 2 && user.streak > 0) {
        notifications.push({
          id: "streak_broken",
          type: "error",
          icon: "💔",
          title: "Your streak was broken",
          message: "Start a new streak by taking a quiz today",
          time: "Recently",
          action: "/quiz-arena"
        });
      }
    } else if (user.totalQuizzes === 0) {
      notifications.push({
        id: "first_quiz",
        type: "info",
        icon: "🎮",
        title: "Try Quiz Arena!",
        message: "Test your knowledge and earn points & badges",
        time: "New",
        action: "/quiz-arena"
      });
    }

    // Badge notifications
    if (user.badges && user.badges.length > 0) {
      const latestBadge = user.badges[user.badges.length - 1];
      const badgeLabels = {
        first_quiz: "🎯 First Quiz",
        quiz_5: "📚 Quiz Enthusiast",
        quiz_25: "🏆 Quiz Master",
        streak_3: "🔥 3 Day Streak",
        streak_7: "⚡ 7 Day Streak",
        points_100: "⭐ 100 Points",
        points_500: "💎 500 Points",
        perfect: "✨ Perfect Score"
      };
      notifications.push({
        id: "badge_" + latestBadge,
        type: "success",
        icon: "🏅",
        title: "Badge earned!",
        message: badgeLabels[latestBadge] || latestBadge,
        time: "Recently",
        action: "/quiz-arena"
      });
    }

    // Points milestone
    if (user.points >= 100 && user.points < 200) {
      notifications.push({
        id: "points_100",
        type: "success",
        icon: "⭐",
        title: "100 points reached!",
        message: `You have ${user.points} total points. Keep going!`,
        time: "Achievement",
        action: "/quiz-arena"
      });
    }

    // Welcome if new user
    if (user.totalQuizzes === 0 && tasks.length === 0) {
      notifications.push({
        id: "welcome",
        type: "info",
        icon: "👋",
        title: `Welcome to STUDORA AI, ${user.name}!`,
        message: "Create your first note or take a quiz to get started",
        time: "New",
        action: "/dashboard"
      });
    }

    res.json({
      success: true,
      notifications,
      unreadCount: notifications.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==============================
// 404 Handler
// ==============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`STUDORA AI Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;