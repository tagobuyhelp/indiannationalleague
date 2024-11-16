import Country from '../models/country.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

// Create a Country
export const createCountry = asyncHandler(async (req, res, next) => {
    const { name } = req.body;

    // Check if country already exists
    const existingCountry = await Country.findOne({ name });
    if (existingCountry) {
        return next(new ApiError(400, 'Country already exists.'));
    }

    // Create and save country
    const country = await Country.create({ name });
    res.status(201).json(new ApiResponse(201, country, 'Country created successfully.'));
});

// Get All Countries
export const getAllCountries = asyncHandler(async (req, res, next) => {
    const countries = await Country.find();
    res.status(200).json(new ApiResponse(200, countries, 'Countries retrieved successfully.'));
});

// Get a Country by ID
export const getCountryById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const country = await Country.findById(id);

    if (!country) {
        return next(new ApiError(404, 'Country not found.'));
    }

    res.status(200).json(new ApiResponse(200, country, 'Country retrieved successfully.'));
});

// Update a Country
export const updateCountry = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    const updatedCountry = await Country.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedCountry) {
        return next(new ApiError(404, 'Country not found.'));
    }

    res.status(200).json(new ApiResponse(200, updatedCountry, 'Country updated successfully.'));
});

// Delete a Country
export const deleteCountry = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const deletedCountry = await Country.findByIdAndDelete(id);

    if (!deletedCountry) {
        return next(new ApiError(404, 'Country not found.'));
    }

    res.status(200).json(new ApiResponse(200, {}, 'Country deleted successfully.'));
});
