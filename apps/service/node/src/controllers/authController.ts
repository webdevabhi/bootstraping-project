import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

import config from '../config';

const JWT_SECRET = config.jwtSecret;
const pool = new Pool({
  connectionString: config.databaseUrl,
});

export const register = async (req: Request, res: Response) => {
  const { email, password, role = 'app_client', name } = req.body;

  // Validate inputs
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (!['app_admin', 'app_client'].includes(role)) {
    throw new Error('Invalid role specified');
  }

  try {
    const result = await pool.query(
      `INSERT INTO app_public.users (email, password_hash, role, name)
         VALUES ($1, app_private.hash_password($2), $3, $4)
         RETURNING id, email, role, created_at`,
      [email, password, role, name]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM app_private.verify_password($1, $2)',
      [email, password]
    );

    const user = result.rows[0];
    
    if (!user?.id) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
