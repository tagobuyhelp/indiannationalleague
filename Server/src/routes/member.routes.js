import express from 'express';
import { uploadPhoto } from '../middleware/photoUpload.middleware.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

import {
    verifyMember,
    registerMember,
    getMemberById,
    updateMember,
    deleteMember,
    getAllMembers,
    verifyOtp,
    checkMembership,
    memberIdCardGenerator,
    checkMembership2,
    getMemberByPhoneEmail
} from '../controllers/member.controller.js';


const router = express.Router();



// Route for verifying if a member exists and sending OTP for verification
router.post('/verify', verifyMember); // Verifies member and sends OTP

// Route for OTP verification
router.post('/verify-otp', verifyOtp); // Verifies OTP for registration or updates

// Route for checking if a member's membership is active
router.get('/check-memberships', checkMembership); // Check membership status

// Route for registering a new member (requires OTP verification)
router.post('/register', uploadPhoto, registerMember); // Registers a new member after OTP verification

// Route for retrieving all members with pagination
router.get('/',verifyJWT, getAllMembers); // Retrieves all members with pagination

// Route to get a specific member by ID
router.get('/:id', getMemberById); // Retrieves a member's data by ID

// Route for updating member information (requires OTP verification)
router.put('/:id',verifyJWT, uploadPhoto, updateMember); // Updates member info after OTP verification

// Route for deleting a member (requires OTP verification)
router.delete('/:id',verifyJWT , deleteMember); // Deletes a member after OTP verification

// Member id card generator by member id 
router.post('/generate-id-card/:id', memberIdCardGenerator)

//Check membership 2
router.post('/check-membership', checkMembership2);


//Get member by email phone number

router.post('/member-by-email-phone', getMemberByPhoneEmail);




export default router;
