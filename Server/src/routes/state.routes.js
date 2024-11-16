import express from 'express';
import {
    createState,
    getAllStates,
    getStateById,
    updateState,
    deleteState
} from '../controllers/state.controller.js';

const router = express.Router();

router.post('/states', createState);  // Create a state
router.get('/states/:countryId', getAllStates);  // Get all states in a specific country
router.get('/states/:id', getStateById);  // Get a specific state by ID
router.put('/states/:id', updateState);  // Update a specific state by ID
router.delete('/states/:id', deleteState);  // Delete a specific state by ID

export default router;
