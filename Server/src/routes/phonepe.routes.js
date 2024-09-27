import { Router } from 'express';


import {
    status,
} from '../utils/phonepePayment.js';


const router = Router();


router.route('/status/:merchantTransactionId').post(status);




export default router;