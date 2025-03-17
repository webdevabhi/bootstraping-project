import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../config';

interface AuthRequest extends Request {
  user?: jwt.JwtPayload;
}

const JWT_SECRET = config.jwtSecret;

// Authentication middleware
const authMiddleware = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      req.user = payload;
    } catch (err) {
      console.error('JWT verification failed:', err);
    }
  }
  next();
};

export default authMiddleware;