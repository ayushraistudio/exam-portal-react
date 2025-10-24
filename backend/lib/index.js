"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveRejoin = exports.requestRejoin = exports.startContest = exports.createStudent = exports.cleanupSessions = exports.finalizeContest = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Initialize Firebase Admin
admin.initializeApp();
// Import route handlers
const auth_1 = require("./routes/auth");
const contests_1 = require("./routes/contests");
const students_1 = require("./routes/students");
const admin_1 = require("./routes/admin");
const rejoin_1 = require("./routes/rejoin");
// Import scheduled functions
const finalizeContest_1 = require("./scheduled/finalizeContest");
Object.defineProperty(exports, "finalizeContest", { enumerable: true, get: function () { return finalizeContest_1.finalizeContest; } });
const cleanupSessions_1 = require("./scheduled/cleanupSessions");
Object.defineProperty(exports, "cleanupSessions", { enumerable: true, get: function () { return cleanupSessions_1.cleanupSessions; } });
// Create Express app
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// API routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/contests', contests_1.contestRoutes);
app.use('/api/students', students_1.studentRoutes);
app.use('/api/admin', admin_1.adminRoutes);
app.use('/api/rejoin', rejoin_1.rejoinRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);
// HTTP callable functions for real-time operations
exports.createStudent = functions.https.onCall(async (data, context) => {
    // Implementation in admin routes
});
exports.startContest = functions.https.onCall(async (data, context) => {
    // Implementation in contest routes
});
exports.requestRejoin = functions.https.onCall(async (data, context) => {
    // Implementation in rejoin routes
});
exports.approveRejoin = functions.https.onCall(async (data, context) => {
    // Implementation in rejoin routes
});
//# sourceMappingURL=index.js.map