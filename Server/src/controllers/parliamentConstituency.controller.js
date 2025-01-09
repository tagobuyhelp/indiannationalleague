import ParliamentConstituency from '../models/parliamentConstituency.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

// Create a Parliament Constituency
export const createParliamentConstituency = asyncHandler(async (req, res, next) => {
    const { name, districtId } = req.body;

    // Check if the constituency already exists in the district
    const existingConstituency = await ParliamentConstituency.findOne({ name, district: districtId });
    if (existingConstituency) {
        return next(new ApiError(400, 'Parliament Constituency already exists in this district.'));
    }

    // Create and save the constituency
    const constituency = await ParliamentConstituency.create({ name, district: districtId });
    res.status(201).json(new ApiResponse(201, constituency, 'Parliament Constituency created successfully.'));
});

// Bulk Create Parliament Constituencies
export const bulkCreateParliamentConstituencies = asyncHandler(async (req, res, next) => {
    const { constituencies } = req.body;

    if (!Array.isArray(constituencies) || constituencies.length === 0) {
        return next(new ApiError(400, 'Invalid input. Expected an array of constituencies.'));
    }

    const createdConstituencies = [];
    const errors = [];

    for (const constituency of constituencies) {
        const { name, districtId } = constituency;

        // Validate input
        if (!name || !districtId) {
            errors.push(`Invalid input for constituency: name and districtId are required.`);
            continue;
        }

        // Check if the constituency already exists in the district
        const existingConstituency = await ParliamentConstituency.findOne({ name, district: districtId });
        if (existingConstituency) {
            errors.push(`Parliament Constituency '${name}' already exists in this district.`);
            continue;
        }

        // Create and save the constituency
        try {
            const newConstituency = await ParliamentConstituency.create({ name, district: districtId });
            createdConstituencies.push(newConstituency);
        } catch (error) {
            if (error.name === 'ValidationError') {
                Object.values(error.errors).forEach((err) => {
                    errors.push(`Validation error for '${name}': ${err.message}`);
                });
            } else {
                errors.push(`Failed to create Parliament Constituency '${name}': ${error.message}`);
            }
        }
    }

    const responseData = {
        createdConstituencies,
        errors,
    };

    if (createdConstituencies.length > 0) {
        res.status(201).json(new ApiResponse(201, responseData, 'Bulk Parliament Constituency creation completed.'));
    } else {
        res.status(400).json(new ApiResponse(400, responseData, 'No Parliament Constituencies were created.'));
    }
});

// Get All Parliament Constituencies for a District
export const getAllParliamentConstituencies = asyncHandler(async (req, res, next) => {
    const { districtId } = req.params;
    const constituencies = await ParliamentConstituency.find({ district: districtId });

    res.status(200).json(new ApiResponse(200, constituencies, 'Parliament Constituencies retrieved successfully.'));
});

// Get a Parliament Constituency by ID
export const getParliamentConstituencyById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const constituency = await ParliamentConstituency.findById(id);

    if (!constituency) {
        return next(new ApiError(404, 'Parliament Constituency not found.'));
    }

    res.status(200).json(new ApiResponse(200, constituency, 'Parliament Constituency retrieved successfully.'));
});

// Update a Parliament Constituency
export const updateParliamentConstituency = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    const updatedConstituency = await ParliamentConstituency.findByIdAndUpdate(
        id,
        { name },
        { new: true }
    );

    if (!updatedConstituency) {
        return next(new ApiError(404, 'Parliament Constituency not found.'));
    }

    res.status(200).json(new ApiResponse(200, updatedConstituency, 'Parliament Constituency updated successfully.'));
});

// Delete a Parliament Constituency
export const deleteParliamentConstituency = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const deletedConstituency = await ParliamentConstituency.findByIdAndDelete(id);

    if (!deletedConstituency) {
        return next(new ApiError(404, 'Parliament Constituency not found.'));
    }

    res.status(200).json(new ApiResponse(200, {}, 'Parliament Constituency deleted successfully.'));
});
