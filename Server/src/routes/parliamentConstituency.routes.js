import express from 'express';
import {
    createParliamentConstituency,
    bulkCreateParliamentConstituencies,
    getAllParliamentConstituencies,
    getParliamentConstituencyById,
    updateParliamentConstituency,
    deleteParliamentConstituency
} from '../controllers/parliamentConstituency.controller.js';

const router = express.Router();

router.post('/parliamentConstituencies', createParliamentConstituency);  // Create a new parliament constituency
router.post('/parliamentConstituencies/bulk', bulkCreateParliamentConstituencies);  // Bulk create parliament constituencies
router.get('/parliamentConstituencies/:districtId', getAllParliamentConstituencies);  // Get all constituencies in a specific district
router.get('/parliamentConstituency/:id', getParliamentConstituencyById);  // Get a specific constituency by ID
router.put('/parliamentConstituency/:id', updateParliamentConstituency);  // Update a constituency by ID
router.delete('/parliamentConstituency/:id', deleteParliamentConstituency);  // Delete a constituency by ID

export default router;
