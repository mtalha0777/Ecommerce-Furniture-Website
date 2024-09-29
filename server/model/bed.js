// model/bed.js
const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },  // Store the image URL
});

const Bed = mongoose.model('Bed', bedSchema);

module.exports = Bed;
