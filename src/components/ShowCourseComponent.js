import React from 'react';

function ShowCourseComponent({ courses, filterCourseFunction = [], addCourseToCartFunction, deleteCourseByName }) {
    return (
        <div className="product-list">
            {filterCourseFunction.length === 0 ? (
                <p className="no-results">
                    Sorry, no matching products found.
                </p>
            ) : (
                filterCourseFunction.map((product) => (
                    <div className="product" key={product._id}>
                        <img src={product.imageUrl} alt={product.name} />
                        <h2>{product.name}</h2>
                        <p>Price: {product.price} Rs</p>
                        <button
                            className="add-to-cart-button"
                            onClick={() => addCourseToCartFunction(product)} // Use the function prop
                        >
                            Add to Shopping Cart
                        </button>
                        <button
                            className="delete-button"
                            onClick={() => deleteCourseByName(product.name)} // Use the function prop
                        >
                            Delete
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default ShowCourseComponent;
