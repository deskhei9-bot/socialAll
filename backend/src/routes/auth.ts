import { Router } from 'express';
import { createUser, validateLogin, generateToken, findUserByEmail, createSession, logActivity } from '../lib/auth';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create user
    const user = await createUser(email, password, fullName);
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: 'user'
    });
    
    // Create session
    await createSession(user.id, token, req.ip, req.get('user-agent'));
    
    // Log activity
    await logActivity(user.id, 'user_registered', { email }, req.ip, req.get('user-agent'));
    
    res.status(201).json({
      user,
      token,
      expiresIn: '30d'
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Validate credentials
    const user = await validateLogin(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Create session
    await createSession(user.id, token, req.ip, req.get('user-agent'));
    
    // Log activity
    await logActivity(user.id, 'user_login', { email }, req.ip, req.get('user-agent'));
    
    res.json({
      user,
      token,
      expiresIn: '30d'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.post('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const token = authHeader.substring(7);
    const { verifyToken, findUserById } = await import('../lib/auth');
    const payload = verifyToken(token);
    const user = await findUserById(payload.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const token = authHeader.substring(7);
    const { verifyToken, findUserById } = await import('../lib/auth');
    const payload = verifyToken(token);
    const user = await findUserById(payload.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
