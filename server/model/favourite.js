const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userID: { type: String, ref: 'User', required: true },
    product: {
        productID: { type: String, required: true },
        productName: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        images: [{ type: String }],
        shopName: { type: String, required: true },
        address: { type: String, required: true }
    }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
