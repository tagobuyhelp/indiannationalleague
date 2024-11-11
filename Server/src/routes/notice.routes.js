import { Router } from 'express';
import { createNotice, getNotices } from '../controllers/notice.controller.js';

const router = Router();

// POST route to create a new notice
router.route('/notice').post(createNotice);
router.route('/notices').get(getNotices);

export default router;
