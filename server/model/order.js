const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    products: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: false }
        }
    ],
    totalAmount: { type: Number, required: true },
    shippingCharges: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('order', OrderSchema);
