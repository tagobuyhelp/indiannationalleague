import { Router } from 'express';


import {
    redirectUrl,
} from '../utils/phonepePayment.js';


const router = Router();


router.route('/redirect-url:merchantTransactionId').get(redirectUrl);



export default router;