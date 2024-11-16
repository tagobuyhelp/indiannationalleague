import express from 'express';
import {
    createCountry,
    getAllCountries,
    getCountryById,
    updateCountry,
    deleteCountry
} from '../controllers/country.controller.js';

const router = express.Router();

router.post('/countries', createCountry);
router.get('/countries', getAllCountries);
router.get('/countries/:id', getCountryById);
router.put('/countries/:id', updateCountry);
router.delete('/countries/:id', deleteCountry);

export default router;
