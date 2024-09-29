import React, { useState } from 'react';

const ProductSlider = ({ products }) => {
    const [currentProductIndex, setCurrentProductIndex] = useState(0);

    const goToNextProduct = () => {
        setCurrentProductIndex((prevIndex) => (prevIndex + 1) % products.length);
    };

    return (
       
            <div className='productSlider' style={{ marginLeft: '0px', marginBottom: '10px' }}>
                <div className='box'>
                    <img src={products[currentProductIndex].image} alt={products[currentProductIndex].name} className='productImage' style={{ width: '380px', height: '200px' }} />
                    <h3 style={{ marginLeft: '115px' }}>{products[currentProductIndex].name}</h3>
                    <p style={{ marginLeft: '160px' }}> {products[currentProductIndex].price} Rs</p>
                    <button onClick={goToNextProduct} style={{ backgroundColor: 'lightgoldenrodyellow', marginLeft: '150px' }}>Next</button>
                </div>
            </div>
       
    );
};

export default ProductSlider;
