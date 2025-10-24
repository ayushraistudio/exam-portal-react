import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { AuthContext } from '../types';

// Extend Express Request to include auth context
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}

/**
 * Middleware to verify Firebase ID token
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
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
    
    if (!userData?.isActive) {
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
      
      if (!sessionDoc.exists || !sessionDoc.data()?.isActive) {
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
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Middleware to check if user is student
 */
export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Middleware to update last activity
 */
export const updateActivity = async (req: Request, res: Response, next: NextFunction) => {
  if (req.auth?.sessionId) {
    try {
      await admin.firestore()
        .collection('sessions')
        .doc(req.auth.sessionId)
        .update({
          lastActivity: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }
  next();
};
