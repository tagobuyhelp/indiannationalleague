import { Router } from 'express';


import {
    createFees,
    checkPaymentStatus,
} from '../controllers/membership.controller.js';


const router = Router();
router.route('/membership').post(createFees)
router.route('/membership/payment/status/:merchantTransactionId').post(checkPaymentStatus);



export default router;