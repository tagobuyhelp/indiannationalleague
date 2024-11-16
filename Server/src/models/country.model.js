import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});

const Country = mongoose.model('Country', countrySchema);
export default Country;
