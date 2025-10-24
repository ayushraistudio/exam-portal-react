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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.authRoutes = router;
/**
 * POST /api/auth/login
 * Login user with username/password and create session
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password, userType } = req.body;
        if (!username || !password || !userType) {
            return res.status(400).json({
                success: false,
                error: 'Username, password, and userType are required'
            });
        }
        // Find user by username and role
        const usersSnapshot = await admin.firestore()
            .collection('users')
            .where('username', '==', username)
            .where('role', '==', userType)
            .where('isActive', '==', true)
            .limit(1)
            .get();
        if (usersSnapshot.empty) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        // Simple password verification (in production, use proper hashing)
        if (userData.password !== password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        // Create new session
        const sessionId = (0, uuid_1.v4)();
        const sessionData = {
            sessionId,
            userId: userDoc.id,
            role: userData.role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };
        // Save session
        await admin.firestore()
            .collection('sessions')
            .doc(sessionId)
            .set(sessionData);
        // Update user with new session ID
        await admin.firestore()
            .collection('users')
            .doc(userDoc.id)
            .update({
            sessionId,
            lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Invalidate old sessions for single session enforcement
        if (userData.sessionId && userData.sessionId !== sessionId) {
            await admin.firestore()
                .collection('sessions')
                .doc(userData.sessionId)
                .update({ isActive: false });
        }
        res.json({
            success: true,
            data: {
                user: {
                    uid: userDoc.id,
                    username: userData.username,
                    role: userData.role,
                    email: userData.email
                },
                sessionId
            },
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});
/**
 * POST /api/auth/login-token
 * Login user with Firebase ID token and create session
 */
router.post('/login-token', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({
                success: false,
                error: 'ID token is required'
            });
        }
        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // Get user data from Firestore
        const userDoc = await admin.firestore()
            .collection('users')
            .doc(decodedToken.uid)
            .get();
        if (!userDoc.exists) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }
        const userData = userDoc.data();
        if (!(userData === null || userData === void 0 ? void 0 : userData.isActive)) {
            return res.status(401).json({
                success: false,
                error: 'Account is inactive'
            });
        }
        // Create new session
        const sessionId = (0, uuid_1.v4)();
        const sessionData = {
            sessionId,
            userId: decodedToken.uid,
            role: userData.role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };
        // Save session
        await admin.firestore()
            .collection('sessions')
            .doc(sessionId)
            .set(sessionData);
        // Update user with new session ID
        await admin.firestore()
            .collection('users')
            .doc(decodedToken.uid)
            .update({
            sessionId,
            lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Invalidate old sessions for single session enforcement
        if (userData.sessionId && userData.sessionId !== sessionId) {
            await admin.firestore()
                .collection('sessions')
                .doc(userData.sessionId)
                .update({ isActive: false });
        }
        res.json({
            success: true,
            data: {
                user: {
                    uid: decodedToken.uid,
                    username: userData.username,
                    role: userData.role,
                    email: userData.email
                },
                sessionId
            },
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});
/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post('/logout', auth_1.verifyToken, auth_1.updateActivity, async (req, res) => {
    try {
        const { sessionId } = req.auth;
        // Invalidate session
        await admin.firestore()
            .collection('sessions')
            .doc(sessionId)
            .update({ isActive: false });
        // Clear session ID from user
        await admin.firestore()
            .collection('users')
            .doc(req.auth.uid)
            .update({ sessionId: admin.firestore.FieldValue.delete() });
        res.json({
            success: true,
            message: 'Logout successful'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to logout'
        });
    }
});
/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', auth_1.verifyToken, auth_1.updateActivity, async (req, res) => {
    try {
        const userDoc = await admin.firestore()
            .collection('users')
            .doc(req.auth.uid)
            .get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const userData = userDoc.data();
        res.json({
            success: true,
            data: {
                uid: req.auth.uid,
                username: userData === null || userData === void 0 ? void 0 : userData.username,
                role: userData === null || userData === void 0 ? void 0 : userData.role,
                email: userData === null || userData === void 0 ? void 0 : userData.email,
                createdAt: userData === null || userData === void 0 ? void 0 : userData.createdAt,
                lastLoginAt: userData === null || userData === void 0 ? void 0 : userData.lastLoginAt
            }
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user info'
        });
    }
});
/**
 * POST /api/auth/refresh
 * Refresh session activity
 */
router.post('/refresh', auth_1.verifyToken, auth_1.updateActivity, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Session refreshed'
        });
    }
    catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh session'
        });
    }
});
//# sourceMappingURL=auth.js.map