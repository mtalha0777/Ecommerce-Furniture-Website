// model/shop.js
const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    productCategories: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String, // Store the URL/path of the image
        required: false, // If you want to allow shops without a profile picture
    },
    userID:{
        type: String,
    }
});

const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;
