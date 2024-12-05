const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    category: { type: String, required: true },
    shopID: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    images: { type: [String], required: true },
    price: { type: Number, required: true } // Add the price field here
});
productSchema.index({ productName: 'text' });
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
