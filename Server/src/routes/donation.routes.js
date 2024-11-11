import { Router } from 'express';


import {
    handleDonationRequest,
    getDonations
} from '../controllers/donation.controller.js';


const router = Router();
router.route('/pay').post(handleDonationRequest);
router.route('/donations').get(getDonations);



export default router;