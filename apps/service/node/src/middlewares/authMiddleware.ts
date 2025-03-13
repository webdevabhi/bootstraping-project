import jwt from 'jsonwebtoken';
import config from '../config';

const JWT_SECRET = config.jwtSecret;

// Authentication middleware
const authMiddleware = async (req: any, _res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
    } catch (err) {
      console.error('JWT verification failed:', err);
    }
  }
  next();
};

export default authMiddleware;