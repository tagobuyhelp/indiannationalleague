import State from '../models/state.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

// Create a State
export const createState = asyncHandler(async (req, res, next) => {
    const { name, countryId } = req.body;

    // Ensure that the state name is unique within the same country
    const existingState = await State.findOne({ name, country: countryId });
    if (existingState) {
        return next(new ApiError(400, 'State already exists in this country.'));
    }

    // Create and save the state
    const state = await State.create({ name, country: countryId });
    res.status(201).json(new ApiResponse(201, state, 'State created successfully.'));
});

// Get All States for a Country
export const getAllStates = asyncHandler(async (req, res, next) => {
    const { countryId } = req.params;
    const states = await State.find({ country: countryId });

    res.status(200).json(new ApiResponse(200, states, 'States retrieved successfully.'));
});

// Get a State by ID
export const getStateById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const state = await State.findById(id);

    if (!state) {
        return next(new ApiError(404, 'State not found.'));
    }

    res.status(200).json(new ApiResponse(200, state, 'State retrieved successfully.'));
});

// Update a State
export const updateState = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    const updatedState = await State.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedState) {
        return next(new ApiError(404, 'State not found.'));
    }

    res.status(200).json(new ApiResponse(200, updatedState, 'State updated successfully.'));
});

// Delete a State
export const deleteState = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const deletedState = await State.findByIdAndDelete(id);

    if (!deletedState) {
        return next(new ApiError(404, 'State not found.'));
    }

    res.status(200).json(new ApiResponse(200, {}, 'State deleted successfully.'));
});
