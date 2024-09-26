import { Router } from 'express';


import {
    handleDonationRequest,
} from '../controllers/donation.controller.js';


const router = Router();
router.route('/pay').post(handleDonationRequest)



export default router;