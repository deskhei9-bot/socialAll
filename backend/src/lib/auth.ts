import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const SALT_ROUNDS = 10;

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload, expiresIn: string | number = '30d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function createUser(email: string, password: string, fullName?: string): Promise<User> {
  const passwordHash = await hashPassword(password);
  
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, email_confirmed)
     VALUES ($1, $2, $3, TRUE)
     RETURNING id, email, full_name, avatar_url`,
    [email, passwordHash, fullName]
  );
  
  const user = result.rows[0];
  
  // Create profile
  await query(
    `INSERT INTO profiles (id, full_name, role)
     VALUES ($1, $2, 'user')`,
    [user.id, fullName]
  );
  
  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    `SELECT u.id, u.email, u.full_name, u.avatar_url, p.role
     FROM users u
     LEFT JOIN profiles p ON u.id = p.id
     WHERE u.email = $1`,
    [email]
  );
  
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query(
    `SELECT u.id, u.email, u.full_name, u.avatar_url, p.role
     FROM users u
     LEFT JOIN profiles p ON u.id = p.id
     WHERE u.id = $1`,
    [id]
  );
  
  return result.rows[0] || null;
}

export async function validateLogin(email: string, password: string): Promise<User | null> {
  const result = await query(
    `SELECT u.id, u.email, u.password_hash, u.full_name, u.avatar_url, p.role
     FROM users u
     LEFT JOIN profiles p ON u.id = p.id
     WHERE u.email = $1`,
    [email]
  );
  
  const user = result.rows[0];
  if (!user) return null;
  
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) return null;
  
  // Update last sign in
  await query(
    `UPDATE users SET last_sign_in_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [user.id]
  );
  
  delete user.password_hash;
  return user;
}

export async function createSession(userId: string, token: string, ipAddress?: string, userAgent?: string) {
  const tokenHash = await hashPassword(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
  
  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, expiresAt, ipAddress, userAgent]
  );
}

export async function logActivity(
  userId: string | null,
  action: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) {
  await query(
    `INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, action, JSON.stringify(details || {}), ipAddress, userAgent]
  );
}
