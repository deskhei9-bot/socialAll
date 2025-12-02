import express from 'express';
import multer from 'multer';
import path from 'path';
import { pool } from '../lib/database';
import crypto from 'crypto';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = file.mimetype.startsWith('video/') 
      ? '/opt/social-symphony/uploads/videos'
      : '/opt/social-symphony/uploads/images';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg'];
  
  const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, AVI, WebM) are allowed.`));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  }
});

// Single file upload
router.post('/single', upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const { file } = req;
    
    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    const filePath = `/uploads/${mediaType}s/${file.filename}`;
    
    // Save to database
    const result = await pool.query(
      `INSERT INTO media_uploads 
        (user_id, filename, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, file.originalname, filePath, file.size, file.mimetype]
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: result.rows[0].id,
        name: file.originalname,
        path: filePath,
        url: `${process.env.FRONTEND_URL}${filePath}`,
        size: file.size,
        type: mediaType,
        mimeType: file.mimetype,
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Multiple files upload
router.post('/multiple', upload.array('files', 10), async (req: any, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const userId = req.user.id;
    const files = req.files as Express.Multer.File[];
    
    const uploadedFiles = [];
    
    for (const file of files) {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const filePath = `/uploads/${mediaType}s/${file.filename}`;
      
      const result = await pool.query(
        `INSERT INTO media_uploads 
          (user_id, filename, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, file.originalname, filePath, file.size, file.mimetype]
      );

      uploadedFiles.push({
        id: result.rows[0].id,
        name: file.originalname,
        path: filePath,
        url: `${process.env.FRONTEND_URL}${filePath}`,
        size: file.size,
        type: mediaType,
        mimeType: file.mimetype,
      });
    }

    res.status(201).json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's uploaded media
router.get('/media', async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT * FROM media_uploads 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    const media = result.rows.map(row => ({
      id: row.id,
      name: row.filename,
      path: row.file_path,
      url: `${process.env.FRONTEND_URL}${row.file_path}`,
      size: row.file_size,
      mimeType: row.mime_type,
      createdAt: row.created_at,
    }));

    res.json(media);
  } catch (error: any) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete uploaded media
router.delete('/media/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `DELETE FROM media_uploads 
       WHERE id = $1 AND user_id = $2 
       RETURNING file_path`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // TODO: Delete physical file from disk
    const fs = require('fs');
    const filePath = path.join('/opt/social-symphony', result.rows[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Media deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
