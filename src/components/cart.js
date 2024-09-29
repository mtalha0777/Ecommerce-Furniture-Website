import React, { useState, useEffect } from 'react';
import UserCartComponent from './UserCartComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import './cart.css';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        postalCode: '',
        paymentMethod: 'easypaisa',
        phoneNumber: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart);
    }, []);

    const removeFromCart = (item) => {
        const updatedCart = cartItems.filter(cartItem => cartItem.product._id !== item.product._id);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const calculateTotalAmount = () => {
        return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handlePaymentMethodChange = (e) => {
        const paymentMethod = e.target.value;
        setFormData(prevData => ({
            ...prevData,
            paymentMethod,
            phoneNumber: '', // Clear phone number when changing payment method
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.address || !formData.postalCode || !formData.phoneNumber) {
            setError('Please fill in all required fields.');
            return;
        }

        const orderDetails = {
            name: formData.name,
            address: formData.address,
            postalCode: formData.postalCode,
            phoneNumber: formData.phoneNumber,
            paymentMethod: formData.paymentMethod,
            products: cartItems.map(item => ({
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
            })),
            totalAmount: calculateTotalAmount(),
            shippingCharges: 5, // Fixed shipping charge
            grandTotal: calculateTotalAmount() + 5 // Total amount + shipping charges
        };

        try {
            const response = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
            });

            if (response.ok) {
                console.log('Order successfully stored in the database');
                setCartItems([]);
                localStorage.removeItem('cart');
                setFormData({
                    name: '',
                    address: '',
                    postalCode: '',
                    paymentMethod: 'easypaisa',
                    phoneNumber: '',
                });
                setError('');
                redirectToPayment();
            } else {
                setError('Failed to store the order.');
            }
        } catch (error) {
            setError('Error submitting the order.');
            console.error('Error:', error);
        }
    };

    const redirectToPayment = () => {
        if (formData.paymentMethod === 'easypaisa') {
            window.location.href = 'https://www.easypaisa.com.pk/';
        } else if (formData.paymentMethod === 'jazzcash') {
            window.location.href = 'https://www.jazzcash.com.pk/';
        }
    };

    const shippingCharges = 5;

    return (
        <div className="container mt-5">
            <h2 className="mb-4" style={{ WebkitTextDecorationLine: 'underline' }}><strong>Your Cart</strong></h2>
            <div className="row">
                <div className="col-md-8">
                    <UserCartComponent
                        cartCourses={cartItems}
                        deleteCourseFromCartFunction={removeFromCart}
                        totalAmountCalculationFunction={calculateTotalAmount}
                        setCartCourses={setCartItems}
                    />
                </div>
                <div className="col-md-4">
                    <div className="card p-3">
                        <h4 className="mb-3"><strong>Cart Summary</strong></h4>
                        <div className="mb-3">
                            <p><strong>Total Amount:</strong> Rs {calculateTotalAmount()}</p>
                            <p><strong>Shipping Charges:</strong> Rs {shippingCharges}</p>
                            <hr />
                            <p><strong>Grand Total:</strong> Rs {calculateTotalAmount() + shippingCharges}</p>
                        </div>

                        <h5><strong>Shipping Details</strong></h5>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label"><strong>Name</strong></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="address" className="form-label"><strong>Address</strong></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="postalCode" className="form-label"><strong>Postal Code</strong></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="postalCode"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><strong>Payment Method</strong></label>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        id="easypaisa"
                                        name="paymentMethod"
                                        value="easypaisa"
                                        checked={formData.paymentMethod === 'easypaisa'}
                                        onChange={handlePaymentMethodChange}
                                    />
                                    <label className="form-check-label" htmlFor="easypaisa">
                                        <strong>Easypaisa</strong>
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        id="jazzcash"
                                        name="paymentMethod"
                                        value="jazzcash"
                                        checked={formData.paymentMethod === 'jazzcash'}
                                        onChange={handlePaymentMethodChange}
                                    />
                                    <label className="form-check-label" htmlFor="jazzcash">
                                        <strong>Jazz Cash</strong>
                                    </label>
                                </div>
                            </div>

                            {formData.paymentMethod && (
                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">
                                        <strong>{formData.paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Phone Number</strong>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                            )}

                            {error && <div className="alert alert-danger">{error}</div>}

                            <button type="submit" className="btn btn-primary">Place Order</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
