import { Member } from "../models/member.model.js";
import { OtpCode } from "../models/otp.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { sendMail } from "../utils/sendMail.js";
import { Membership } from "../models/membership.model.js";

// 1. Generate OTP and Send to Email
const generateAndSendOtp = asyncHandler(async (email) => {
    const otp = generateOTP();
    await OtpCode.create({ email, otp });
    await sendMail({
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    });
});

// 2. Verify OTP
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const otpRecord = await OtpCode.findOne({ email, otp });
    
    if (!otpRecord) {
        throw new ApiError(400, "Invalid or expired OTP.");
    }

    // OTP is valid; remove it from the database
    await OtpCode.deleteOne({ email, otp });

    return res.status(200).json(new ApiResponse(200, "OTP verified successfully"));
});

// 3. Verify if Member Exists
const verifyMember = asyncHandler(async (req, res) => {
    const { aadhaar, phone, email } = req.body;
    await generateAndSendOtp(email); // Generate OTP when verifying a member

    const member = await Member.findOne({ aadhaar, phone });
    if (member) {
        const message = "Member found. OTP has been sent to your email to resume registration.";
        return res.status(200).json(new ApiResponse(200, message, { member: member }));
    } else {
        const message = "Member not found. Proceed with full registration after OTP verification.";
        return res.status(404).json(new ApiResponse(404, message));
    }
});

// 4. Register a New Member
const registerMember = asyncHandler(async (req, res) => {
    const { email,  ...memberData } = req.body;
    
    

    const existingMember = await Member.findOne({ aadhaar: memberData.aadhaar, phone: memberData.phone });
    if (existingMember) {
        throw new ApiError(409, "Member already exists. Use the update option.");
    }

    const member = await Member.create({ email, ...memberData });
    return res.status(201).json(new ApiResponse(201, "Member registered successfully.", member));
});

// 5. Update Member Information
const updateMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {updates } = req.body;

    const updatedMember = await Member.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedMember) throw new ApiError(404, "Member not found.");
    
    return res.status(200).json(new ApiResponse(200, "Member updated successfully", updatedMember));
});

// 6. Delete Member
const deleteMember = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedMember = await Member.findByIdAndDelete(id);
    if (!deletedMember) throw new ApiError(404, "Member not found.");
    
    return res.status(200).json(new ApiResponse(200, "Member deleted successfully"));
});

// 7. Get Member by ID
const getMemberById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const member = await Member.findById(id);
    if (!member) throw new ApiError(404, "Member not found.");
    return res.status(200).json(new ApiResponse(200, "Member found", member));
});

// 8. Get All Members with Pagination
const getAllMembers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const members = await Member.find()
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    const totalMembers = await Member.countDocuments();
    
    return res.status(200).json(new ApiResponse(200, "Members retrieved successfully", {
        total: totalMembers,
        page: parseInt(page),
        limit: parseInt(limit),
        data: members
    }));
});


// 9. Check Member Membership Buying Status
const checkMembership = asyncHandler(async (req, res) => {
    const { email, phone } = req.body;

    // Check if a membership record exists for the provided email and phone
    const membership = await Membership.findOne({ email, phone });

    if (!membership) {
        throw new ApiError(404, "Member has not purchased a membership.");
    }

    // Verify if the membership status is active
    if (membership.status === "active") {
        const member = await Member.findOne({ email, phone });

        if (!member) {
            throw new ApiError(404, "Member not found in the database.");
        }

        // Update membershipStatus to active
        member.membershipStatus = "active";
        

        // Store Member ID In member Model
        member.memberId = membership.memberId;

        await member.save();

        // Respond with success message
        return res.status(200).json(new ApiResponse(200, "Membership status updated to active.", member));
    }

    // If membership exists but is not active
    return res.status(200).json(new ApiResponse(200, "Membership is not active.", membership));
});


export {
    verifyMember,
    registerMember,
    getMemberById,
    updateMember,
    deleteMember,
    getAllMembers,
    verifyOtp,
    checkMembership
};
