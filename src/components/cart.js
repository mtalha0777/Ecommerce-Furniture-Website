import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './cart.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
console.log('pkey',process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Create a new CheckoutForm component
function CheckoutForm({ totalAmount, handleSubmit }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        postalCode: '',
        phoneNumber: '',
        paymentMethod: 'card'
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        // Validate form data
        if (!formData.name || !formData.address || !formData.postalCode || !formData.phoneNumber) {
            setError('Please fill in all required fields');
            setProcessing(false);
            return;
        }

        try {
            if (formData.paymentMethod === 'card') {
                if (!stripe || !elements) {
                    setProcessing(false);
                    return;
                }

                const response = await fetch('http://localhost:3001/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ 
                        amount: totalAmount
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to create payment intent');
                }

                const data = await response.json();
                
                if (!data.clientSecret) {
                    throw new Error('No client secret received');
                }

                const result = await stripe.confirmCardPayment(data.clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement),
                    }
                });

                if (result.error) {
                    throw new Error(result.error.message);
                }

                // Include payment intent ID and form data in order submission
                await handleSubmit({
                    ...formData,
                    paymentIntentID: result.paymentIntent.id,
                    paymentStatus: 'paid',
                    paymentDate: new Date().toISOString()
                });
            } else {
                // Handle cash on delivery
                await handleSubmit({
                    ...formData,
                    paymentStatus: 'pending',
                    paymentDate: null
                });
            }
            setSuccess(true);
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="alert alert-success">
                {formData.paymentMethod === 'card' 
                    ? 'Payment successful! Your order has been placed.'
                    : 'Order placed successfully! Please pay on delivery.'}
            </div>
        );
    }

    return (
        <form onSubmit={handlePaymentSubmit}>
            <div className="mb-3">
                <label className="form-label">Name*</label>
                <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Address*</label>
                <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Postal Code*</label>
                <input
                    type="text"
                    className="form-control"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleFormChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Number*</label>
                <input
                    type="tel"
                    className="form-control"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label"><strong>Payment Method*</strong></label>
                <div className="d-flex gap-3">
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === 'card'}
                            onChange={handleFormChange}
                            id="cardPayment"
                        />
                        <label className="form-check-label" htmlFor="cardPayment">
                            Credit/Debit Card
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === 'cod'}
                            onChange={handleFormChange}
                            id="codPayment"
                        />
                        <label className="form-check-label" htmlFor="codPayment">
                            Cash on Delivery
                        </label>
                    </div>
                </div>
            </div>

            {formData.paymentMethod === 'card' && (
                <div className="mb-3">
                    <label className="form-label"><strong>Card Details*</strong></label>
                    <div className="form-control p-3">
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}/>
                    </div>
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}
            <button 
                type="submit" 
                className="btn btn-primary"
                disabled={formData.paymentMethod === 'card' ? (!stripe || processing) : processing}
            >
                {processing ? 'Processing...' : formData.paymentMethod === 'card' 
                    ? `Pay $${totalAmount}`
                    : 'Place Order'}
            </button>
        </form>
    );
}

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [refreshPage, setRefreshPage] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        postalCode: '',
        paymentMethod: 'easypaisa',
        phoneNumber: '',
    });
    const [error, setError] = useState('');
    const authToken = sessionStorage.getItem('authToken');
    useEffect(() => {
        const userID = localStorage.getItem('userID'); // Assuming userID is stored in localStorage

        const fetchCartItems = async () => {
            try {
                const response = await fetch(`http://localhost:3001/cart/${userID}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                const data = await response.json();
                setCartItems(data.products); // Assuming 'products' contains the array of cart items
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        };

        fetchCartItems();
    }, [refreshPage]);

    const removeFromCart = async (productID) => {
        try {
            console.log('productID: ', productID);
            const userID = localStorage.getItem('userID');
            const response = await fetch(`http://localhost:3001/cart/${userID}/remove/${productID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                const updatedCart = cartItems.filter(cartItem => cartItem.productID !== productID);
                setCartItems(updatedCart);
                setRefreshPage(prev => !prev);
            } else {
                console.error('Failed to remove item from cart');
            }
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };
    

    const calculateTotalAmount = () => {
        return cartItems?.reduce((total, item) => total + parseFloat(item.price), 0);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (formDetails) => {
        const userID = localStorage.getItem('userID');
        const orderDetails = {
            ...formDetails,
            paymentMethod: 'card',
            products: cartItems?.map(item => ({
                name: item.productName,
                price: item.price,
            })),
            totalAmount: calculateTotalAmount(),
            shippingCharges: 200,
            grandTotal: calculateTotalAmount() + 200,
        };
    
        try {
            const response = await fetch('http://localhost:3001/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify(orderDetails),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create order');
            }
    
            // Clear the cart
            await fetch('http://localhost:3001/clearcart', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ userID }),
            });
    
            // Update local state
            setCartItems([]);
            setRefreshPage(prev => !prev);
        } catch (error) {
            console.error('Error creating order:', error);
            throw new Error('Failed to complete order');
        }
    };

    const shippingCharges = 200;

    return (
        <div className="container mt-5 cart-container">
            <h2 className="mb-4 cart-title">Your Cart</h2>
            <div className="row">
                <div className="col-md-8">
                    {!cartItems || cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <p>Your cart is empty.</p>
                        </div>
                    ) : (
                        cartItems?.map((item, index) => (
                            <div key={index} className="card cart-item-card mb-3">
                                <div className="row g-0">
                                    <div className="col-3"> {/* Reduced the image column size */}
                                        <img src={`http://localhost:3001/uploads/${item.images[0]}`} className="img-fluid rounded-start cart-item-image" alt={item.productName} />
                                    </div>
                                    <div className="col-9"> {/* Adjusted this column to 9 */}
                                        <div className="card-body p-2"> {/* Reduced padding */}
                                            <h5 className="card-title cart-item-title">{item.productName}</h5>
                                            <p className="card-text"><strong>Price:</strong> Rs {item.price}</p>
                                            <p className="card-text"><strong>Shop:</strong> {item.shopName}</p>
                                            <p className="card-text"><strong>Address:</strong> {item.address}</p>
                                            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item?.productID)}>Remove</button> {/* Reduced button size */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="col-md-4">
                    <div className="card p-3">
                        <h4 className="mb-3"><strong>Cart Summary</strong></h4>
                        <div className="mb-3">
                            <p><strong>Total Amount:</strong> Rs {calculateTotalAmount()}</p>
                            {cartItems?.length > 0 && <p><strong>Shipping Charges:</strong> Rs {shippingCharges}</p>}
                            <hr />
                            <p><strong>Grand Total:</strong> Rs {calculateTotalAmount()?  calculateTotalAmount()+ shippingCharges: 0}</p>
                        </div>

                        <h5><strong>Shipping Details</strong></h5>
                        <Elements stripe={stripePromise}>
                            <CheckoutForm 
                                totalAmount={calculateTotalAmount() + shippingCharges}
                                handleSubmit={handleSubmit}
                            />
                        </Elements>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
