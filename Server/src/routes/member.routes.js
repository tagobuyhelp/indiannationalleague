import express from 'express';
import {
    verifyMember,
    registerMember,
    getMemberById,
    updateMember,
    deleteMember,
    getAllMembers,
    verifyOtp,
    checkMembership
} from '../controllers/member.controller.js';

const router = express.Router();

// Route for verifying if a member exists and sending OTP for verification
router.post('/verify', verifyMember); // Verifies member and sends OTP

// Route for OTP verification
router.post('/verify-otp', verifyOtp); // Verifies OTP for registration or updates

// Route for checking if a member's membership is active
router.get('/check-memberships', checkMembership); // Check membership status

// Route for registering a new member (requires OTP verification)
router.post('/register', registerMember); // Registers a new member after OTP verification

// Route for retrieving all members with pagination
router.get('/', getAllMembers); // Retrieves all members with pagination

// Route to get a specific member by ID
router.get('/:id', getMemberById); // Retrieves a member's data by ID

// Route for updating member information (requires OTP verification)
router.put('/:id', updateMember); // Updates member info after OTP verification

// Route for deleting a member (requires OTP verification)
router.delete('/:id', deleteMember); // Deletes a member after OTP verification

export default router;
