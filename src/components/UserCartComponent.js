import React from 'react';

function UserCartComponent({
    cartCourses,
    deleteCourseFromCartFunction,
    totalAmountCalculationFunction,
    setCartCourses,
}) {
    // Handler to increase quantity
    const handleIncreaseQuantity = (productId) => {
        setCartCourses((prevCartCourses) => 
            prevCartCourses.map((item) =>
                item.product._id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    // Handler to decrease quantity
    const handleDecreaseQuantity = (productId) => {
        setCartCourses((prevCartCourses) => 
            prevCartCourses.map((item) =>
                item.product._id === productId && item.quantity > 0
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    return (
        <div className={`cart ${cartCourses.length > 0 ? 'active' : ''}`}>
            
            {cartCourses.length === 0 ? (
                <p className="empty-cart">Geek, your cart is empty.</p>
            ) : (
                <div>
                    <ul>
                        {cartCourses.map((item) => (
                            <li key={item.product?._id} className="cart-item">
                                <div>
                                    <div className="item-info">
                                        <div className="item-image">
                                            <img 
                                                src={item.product?.imageUrl} 
                                                alt={item.product?.name} 
                                            />
                                        </div>
                                        <div className="item-details">
                                            <h3>{item.product?.name}</h3>
                                            <p style={{paddingLeft:'50px'}}>Price: {item.product?.price} Rs</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="item-actions">
                                            <button
                                                className="remove-button"
                                                onClick={() => deleteCourseFromCartFunction(item)}
                                            >
                                                Remove Product
                                            </button>
                                            <div className="quantity">
                                                <button
                                                    style={{ margin: "1%" }}
                                                    onClick={() => handleIncreaseQuantity(item.product?._id)}
                                                >
                                                    +
                                                </button>
                                                <p className='quant' >{item.quantity}</p>
                                                <button 
                                                    onClick={() => handleDecreaseQuantity(item.product?._id)}
                                                >
                                                    -
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="checkout-section">
                        <div className="checkout-total">
                            <p className="total">
                                Total Amount: Rs {totalAmountCalculationFunction()}
                            </p>
                        </div>
                       
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserCartComponent;
