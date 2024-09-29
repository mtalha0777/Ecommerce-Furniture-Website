const mongoose = require('mongoose');

const sofaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },  // Store the image URL
    description: { type: String, default: '' }    // Optional field for description
});

const Sofa = mongoose.model('Sofa', sofaSchema);

module.exports = Sofa;
