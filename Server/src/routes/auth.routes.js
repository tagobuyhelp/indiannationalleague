import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/check-auth', verifyJWT, (req, res) => {
  res.json({ isAuthenticated: true });
});

export default router;