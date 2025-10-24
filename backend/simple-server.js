const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory database
const users = [
  { id: '1', username: 'admin', password: 'admin', role: 'admin', email: 'admin@example.com' },
  { id: '2', username: 'student', password: 'student', role: 'student', email: 'student@example.com' }
];

const sessions = new Map();

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password, userType } = req.body;
  
  const user = users.find(u => u.username === username && u.role === userType && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Create session
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  sessions.set(sessionId, {
    userId: user.id,
    role: user.role,
    createdAt: new Date(),
    isActive: true
  });
  
  res.json({
    success: true,
    data: {
      user: {
        uid: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      sessionId
    },
    message: 'Login successful'
  });
});

app.post('/api/auth/logout', (req, res) => {
  const { sessionId } = req.body;
  
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
  }
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

app.get('/api/auth/me', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid session'
    });
  }
  
  const session = sessions.get(sessionId);
  const user = users.find(u => u.id === session.userId);
  
  res.json({
    success: true,
    data: {
      uid: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    }
  });
});

// Admin routes
app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      activeContests: Math.floor(Math.random() * 10) + 1,
      totalStudents: Math.floor(Math.random() * 100) + 50,
      activeSessions: Math.floor(Math.random() * 20) + 5,
      pendingRequests: Math.floor(Math.random() * 5)
    }
  });
});

// Student routes
app.get('/api/student/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      availableContests: Math.floor(Math.random() * 5) + 1,
      completedContests: Math.floor(Math.random() * 3),
      inProgressContests: Math.floor(Math.random() * 2),
      totalQuestions: Math.floor(Math.random() * 20) + 10
    }
  });
});

// Contest routes
app.get('/api/contests/active/timer', (req, res) => {
  res.json({
    success: true,
    data: {
      timeRemaining: Math.floor(Math.random() * 3600) + 1800 // 30-90 minutes
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
});

module.exports = app;
