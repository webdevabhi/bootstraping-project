import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Pool, DatabaseError } from 'pg';

import config from '../config';

const JWT_SECRET = config.jwtSecret;
export const defaultPool = new Pool({
  connectionString: config.databaseUrl,
});

export const register = async (req: Request, res: Response, dbPool: Pool = defaultPool) => {
  const { email, password, role = 'app_client', name } = req.body;

  try {
    // Validate inputs
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!name) missingFields.push('name');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    if (!['app_admin', 'app_client'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const result = await dbPool.query(
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
  } catch (error: unknown) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unexpected error occurred' });
    }
  }
};

export const login = async (req: Request, res: Response, dbPool: Pool = defaultPool) => {
  const { email, password } = req.body;

  try {
    const result = await dbPool.query(
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
  } catch (error: unknown) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unexpected error occurred' });
    }
  }
};
