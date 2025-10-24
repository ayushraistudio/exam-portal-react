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
exports.updateActivity = exports.requireStudent = exports.requireAdmin = exports.verifyToken = void 0;
const admin = __importStar(require("firebase-admin"));
/**
 * Middleware to verify Firebase ID token
 */
const verifyToken = async (req, res, next) => {
    var _a;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }
        const token = authHeader.split('Bearer ')[1];
        // Verify the token
        const decodedToken = await admin.auth().verifyIdToken(token);
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
        // Check session validity
        if (userData.sessionId) {
            const sessionDoc = await admin.firestore()
                .collection('sessions')
                .doc(userData.sessionId)
                .get();
            if (!sessionDoc.exists || !((_a = sessionDoc.data()) === null || _a === void 0 ? void 0 : _a.isActive)) {
                return res.status(401).json({
                    success: false,
                    error: 'Session expired'
                });
            }
        }
        // Add auth context to request
        req.auth = {
            uid: decodedToken.uid,
            role: userData.role,
            sessionId: userData.sessionId || ''
        };
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};
exports.verifyToken = verifyToken;
/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
    if (!req.auth) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    if (req.auth.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware to check if user is student
 */
const requireStudent = (req, res, next) => {
    if (!req.auth) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    if (req.auth.role !== 'student') {
        return res.status(403).json({
            success: false,
            error: 'Student access required'
        });
    }
    next();
};
exports.requireStudent = requireStudent;
/**
 * Middleware to update last activity
 */
const updateActivity = async (req, res, next) => {
    var _a;
    if ((_a = req.auth) === null || _a === void 0 ? void 0 : _a.sessionId) {
        try {
            await admin.firestore()
                .collection('sessions')
                .doc(req.auth.sessionId)
                .update({
                lastActivity: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        catch (error) {
            console.error('Failed to update activity:', error);
        }
    }
    next();
};
exports.updateActivity = updateActivity;
//# sourceMappingURL=auth.js.map