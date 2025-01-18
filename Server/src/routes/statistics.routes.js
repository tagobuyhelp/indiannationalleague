import express from 'express';
import { getDashboardStatistics } from '../controllers/statistics.controller.js';

const router = express.Router();

// Route to get dashboard statistics
router.get('/dashboard', getDashboardStatistics);

export default router;