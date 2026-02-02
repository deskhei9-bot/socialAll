import { verifyToken } from './auth';

export function getUserIdFromRequest(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      return payload.userId;
    } catch {
      return null;
    }
  }

  const tokenFromQuery = req.query?.token || req.query?.auth_token;
  if (tokenFromQuery && typeof tokenFromQuery === 'string') {
    try {
      const payload = verifyToken(tokenFromQuery);
      return payload.userId;
    } catch {
      return null;
    }
  }

  return null;
}
