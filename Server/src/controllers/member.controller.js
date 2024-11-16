import { Member } from "../models/member.model.js";
import { OtpCode } from "../models/otp.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { sendMail } from "../utils/sendMail.js";
import { Membership } from "../models/membership.model.js";
import { generateIdCard } from "../utils/generateIdCard.js";

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
    const { email, ...memberData } = req.body;

    // Check if a member with the same Aadhaar and phone number already exists
    const existingMember = await Member.findOne({ aadhaar: memberData.aadhaar, phone: memberData.phone });
    if (existingMember) {
        throw new ApiError(409, "Member already exists. Use the update option.");
    }

    // Check if a photo was uploaded and set the photoPath
    const photoPath = req.file ? `/images/photos/${req.file.filename}` : null;

    // Create the new member with the photo path if available
    const member = await Member.create({ email, ...memberData, photo: photoPath });
    
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


// 10. Member Id Card Generator
const memberIdCardGenerator = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch member by ID
        const member = await Member.findById(id);
        if (!member) {
            throw new ApiError(404, "Member not found");
        }

        // Fetch membership by email and phone
        const membership = await Membership.findOne({ email: member.email, phone: member.phone });
        if (!membership) {
            throw new ApiError(404, "Membership not found");
        }

        if (!member.photo) {
            throw new ApiError(404, "Member Photo not found");
        }

        

        // Extract details
        const memberName = member.fullname;
        const memberId = membership.memberId;
        const memberDob = new Intl.DateTimeFormat('en-GB').format(new Date(member.dob));
        const memberType = membership.type.toUpperCase();
        
        const membershipValidUpto = new Date(membership.createdAt);
        membershipValidUpto.setFullYear(membershipValidUpto.getFullYear() + membership.validity);
        const formattedMembershipValidUpto = new Intl.DateTimeFormat('en-GB').format(membershipValidUpto);
        const memberPhoto = member.photo;

        // Generate the ID card if it doesn't exist
        if (!member.idCard) {
            const generated = await generateIdCard(
                memberName,
                memberId,
                memberDob,
                memberType,
                formattedMembershipValidUpto,
                memberPhoto
            );

            if (!generated) {
                throw new ApiError(500, "ID Card Generation Failed");
            }

            // Update the member record with the new ID card path
            member.idCard = `/images/idcards/inl_member_id_card_${memberId}.png`;
            await member.save();
        }

        // Send response
        res.status(200).json({
            success: true,
            message: "ID card generated & sent successfully",
            idCardPath: member.idCard,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "An error occurred while generating the ID card",
        });
    }
});


export {
    verifyMember,
    registerMember,
    getMemberById,
    updateMember,
    deleteMember,
    getAllMembers,
    verifyOtp,
    checkMembership,
    memberIdCardGenerator,
};
