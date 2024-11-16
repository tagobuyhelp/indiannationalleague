import District from '../models/district.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

// Create a District
export const createDistrict = asyncHandler(async (req, res, next) => {
    const { name, stateId } = req.body;

    // Check for existing district with the same name within the specified state
    const existingDistrict = await District.findOne({ name, state: stateId });
    if (existingDistrict) {
        return next(new ApiError(400, 'District already exists in this state.'));
    }

    // Create and save the district
    const district = await District.create({ name, state: stateId});
    res.status(201).json(new ApiResponse(201, district, 'District created successfully.'));
});

// Get All Districts for a State
export const getAllDistricts = asyncHandler(async (req, res, next) => {
    const { stateId } = req.params;
    const districts = await District.find({ state: stateId });

    res.status(200).json(new ApiResponse(200, districts, 'Districts retrieved successfully.'));
});

// Get a District by ID
export const getDistrictById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const district = await District.findById(id).populate('parliamentConstituencies');

    if (!district) {
        return next(new ApiError(404, 'District not found.'));
    }

    res.status(200).json(new ApiResponse(200, district, 'District retrieved successfully.'));
});

// Update a District
export const updateDistrict = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    const updatedDistrict = await District.findByIdAndUpdate(
        id,
        { name },
        { new: true }
    );

    if (!updatedDistrict) {
        return next(new ApiError(404, 'District not found.'));
    }

    res.status(200).json(new ApiResponse(200, updatedDistrict, 'District updated successfully.'));
});

// Delete a District
export const deleteDistrict = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const deletedDistrict = await District.findByIdAndDelete(id);

    if (!deletedDistrict) {
        return next(new ApiError(404, 'District not found.'));
    }

    res.status(200).json(new ApiResponse(200, {}, 'District deleted successfully.'));
});
