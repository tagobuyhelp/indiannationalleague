import { Router } from 'express';

import {
    createFees,
    checkPaymentStatus,
    renewMembership,
    cancelMembership,
    getMembershipDetails,
    listAllMemberships
} from '../controllers/membership.controller.js';

const router = Router();

// Route to create membership fees
router.route('/membership').post(createFees);

// Route to check payment status
router.route('/membership/payment/status/:merchantTransactionId').post(checkPaymentStatus);

// Route to renew membership
router.route('/membership/renew').post(renewMembership);

// Route to cancel membership
router.route('/membership/cancel').post(cancelMembership);

// Route to get membership details
router.route('/membership/:memberId').get(getMembershipDetails);

// Admin route to list all memberships
router.route('/admin/memberships').get(listAllMemberships);

export default router;
