import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './cart.css';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.name || !formData.address || !formData.postalCode || !formData.phoneNumber) {
            setError('Please fill in all required fields.');
            return;
        }
    
        const userID = localStorage.getItem('userID'); // Ensure userID is retrieved correctly
        const orderDetails = {
            name: formData.name,
            address: formData.address,
            postalCode: formData.postalCode,
            phoneNumber: formData.phoneNumber,
            paymentMethod: formData.paymentMethod,
            products: cartItems?.map(item => ({
                name: item.productName,
                price: item.price,
            })),
            totalAmount: calculateTotalAmount(),
            shippingCharges: 5,
            grandTotal: calculateTotalAmount() + 5,
        };
    
        try {
            // Sending the order details to the API
            const response = await fetch('http://localhost:3001/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
            });
    
            if (response.ok) {
                console.log('Order successfully stored in the database');
                
                // Clear the user's cart after the order has been successfully placed
                const clearCartResponse = await fetch('http://localhost:3001/clearcart', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ userID }), // Sending userID in the request body
                });
    
                if (clearCartResponse.ok) {
                    console.log('Cart cleared successfully.');
                } else {
                    console.error('Failed to clear the cart.');
                }
    
                // Resetting the cart and form data
                setCartItems([]);
                setFormData({
                    name: '',
                    address: '',
                    postalCode: '',
                    paymentMethod: 'easypaisa',
                    phoneNumber: '',
                });
                setError('');
            } else {
                setError('Failed to store the order.');
            }
        } catch (error) {
            setError('Error submitting the order.');
            console.error('Error:', error);
        }
    
        setRefreshPage(!refreshPage);
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
                        <form onSubmit={handleSubmit}>
                            {/* Name */}
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

                            {/* Address */}
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

                            {/* Postal Code */}
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

                            {/* Payment Method */}
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
                                        onChange={handleFormChange}
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
                                        onChange={handleFormChange}
                                    />
                                    <label className="form-check-label" htmlFor="jazzcash">
                                        <strong>JazzCash</strong>
                                    </label>
                                </div>
                            </div>

                            {/* Phone Number */}
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

                            {/* Error Alert */}
                            {error && <div className="alert alert-danger">{error}</div>}

                            {/* Submit Button */}
                            <button type="submit" className="btn btn-primary">Place Order</button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
