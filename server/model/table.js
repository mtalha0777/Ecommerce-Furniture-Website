const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },  // Store the image URL
    description: { type: String, default: '' }    // Optional field for description
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
