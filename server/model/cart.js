// model/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  products: [
    {
      productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      category: { type: String, required: true },
      price: { type: Number, required: true },
      images: [String], // Array of image URLs
      shopName: { type: String, required: true },
      address: { type: String, required: true }
    }
  ]
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
