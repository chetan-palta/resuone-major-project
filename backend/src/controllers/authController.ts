import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import pool from '../config/db';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId: string, email: string) => {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

const setSessionCookie = (res: Response, token: string) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const googleLogin = async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: 'Invalid Google token' });

    const { email, sub: googleId, name, picture: avatar } = payload;
    
    // Check if user exists
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user = rows[0];

    if (!user) {
      // Create user
      const id = randomUUID();
      await pool.query(
        'INSERT INTO users (id, google_id, email, name, avatar) VALUES (?, ?, ?, ?, ?)',
        [id, googleId, email, name, avatar]
      );
      user = { id, email, name, avatar };
    } else if (!user.google_id) {
      // Link Google account to existing email user
      await pool.query('UPDATE users SET google_id = ?, avatar = ? WHERE email = ?', [googleId, avatar, email]);
      user.google_id = googleId;
      user.avatar = avatar;
    }

    const token = generateToken(user.id, user.email);
    setSessionCookie(res, token);
    
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
      [id, email, name, passwordHash]
    );

    const token = generateToken(id, email);
    setSessionCookie(res, token);
    
    res.json({ user: { id, email, name } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    
    if (!user || !user.password_hash) {
      return res.status(400).json({ error: 'Invalid credentials or user signed up with Google' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id, user.email);
    setSessionCookie(res, token);
    
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getSession = async (req: Request, res: Response) => {
  // authMiddleware sets req.user
  const authReq = req as any;
  if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });
  
  try {
    const [rows]: any = await pool.query('SELECT id, email, name, avatar FROM users WHERE id = ?', [authReq.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json({ user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Logged out successfully' });
};
