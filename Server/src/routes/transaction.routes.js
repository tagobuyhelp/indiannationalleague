import { Router } from 'express';
import getTransactions from '../controllers/transaction.controller.js';

const router = Router();

// Route to get all transactions with advanced filtering, sorting, and pagination
router.route('/transaction').get(getTransactions);

export default router;
