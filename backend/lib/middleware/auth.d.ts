import { Request, Response, NextFunction } from 'express';
import { AuthContext } from '../types';
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
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to check if user is admin
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to check if user is student
 */
export declare const requireStudent: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to update last activity
 */
export declare const updateActivity: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map