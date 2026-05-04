import jwt from 'jsonwebtoken';
import { jwtConfig } from './config.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Invalid Authorization header format' });
  }

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    req.user = payload;
    next();
  } catch (err) {
    // Provide clearer debug messages for development (do not leak in production)
    console.warn('Auth failure:', err.name, err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'TokenExpired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'InvalidToken', detail: err.message });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
