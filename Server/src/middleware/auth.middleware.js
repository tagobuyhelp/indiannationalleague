import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const tokenFromHeader = req.header("Authorization")?.replace("Bearer ", "");
        const tokenFromCookie = req.cookies?.accessToken;

        const token = tokenFromHeader || tokenFromCookie;

        if (!token) {
            throw new ApiError(401, "Unauthorized request - Missing token");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401, "Unauthorized request - Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized request - Invalid access token");
    }
});
