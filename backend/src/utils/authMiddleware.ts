import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded; // attaching decoded payload to req
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};
