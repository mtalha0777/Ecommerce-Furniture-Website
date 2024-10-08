const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
