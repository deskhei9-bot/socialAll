import express from 'express';
import { pool } from '../lib/database';
import bcrypt from 'bcrypt';

const router = express.Router();

// Admin only - Get all users
router.get('/', async (req: any, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const result = await pool.query(
      `SELECT id, email, full_name, role, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update current user profile
router.put('/me', async (req: any, res) => {
  try {
    const { full_name, email } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, full_name, role, created_at, updated_at`,
      [full_name, email, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.put('/me/password', async (req: any, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Verify current password
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const isValid = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin only - Update user role
router.put('/:id/role', async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const result = await pool.query(
      `UPDATE users 
       SET role = $1, updated_at = NOW() 
       WHERE id = $2
       RETURNING id, email, full_name, role, created_at, updated_at`,
      [role, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin only - Delete user
router.delete('/:id', async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { id } = req.params;
    
    // Prevent deleting own account
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics
router.get('/stats', async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const [totalUsers, totalPosts, totalChannels] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM posts'),
      pool.query('SELECT COUNT(*) as count FROM connected_channels')
    ]);
    
    res.json({
      total_users: parseInt(totalUsers.rows[0].count),
      total_posts: parseInt(totalPosts.rows[0].count),
      total_channels: parseInt(totalChannels.rows[0].count)
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
