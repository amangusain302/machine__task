import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend the Request interface to include the `user` property
declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload | string;
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.token;

    if (!token) {
        res.status(403).json({ message: 'Access denied, no token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded; // Attach the decoded token to the request object
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};
