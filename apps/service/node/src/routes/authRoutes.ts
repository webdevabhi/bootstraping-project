import express from 'express';
import type { Request, Response } from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();

type AuthHandler = (req: Request, res: Response) => Promise<Response>;
router.post('/register', register as AuthHandler);
router.post('/login', login as AuthHandler);

export default router;