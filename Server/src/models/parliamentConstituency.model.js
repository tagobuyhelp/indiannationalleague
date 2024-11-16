import mongoose from 'mongoose';

const parliamentConstituencySchema = new mongoose.Schema({
    name: { type: String, required: true },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
});

const ParliamentConstituency = mongoose.model('ParliamentConstituency', parliamentConstituencySchema);
export default ParliamentConstituency;
