import express from 'express';
import {
    createDistrict,
    getAllDistricts,
    getDistrictById,
    updateDistrict,
    deleteDistrict
} from '../controllers/district.controller.js';

const router = express.Router();

router.post('/districts', createDistrict);  // Create a district
router.get('/districts/:stateId', getAllDistricts);  // Get all districts in a specific state
router.get('/districts/:id', getDistrictById);  // Get a specific district by ID
router.put('/districts/:id', updateDistrict);  // Update a specific district by ID
router.delete('/districts/:id', deleteDistrict);  // Delete a specific district by ID

export default router;
