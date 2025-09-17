import React, { useState, useEffect } from 'react';
import { FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ProductImageSlider = ({ images, isMobile, height = '200px' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        setCurrentIndex(0);
    }, [images]);

    const goToPrevious = (e) => {
        e.stopPropagation(); 
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = (e) => {
        e.stopPropagation();
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const sliderStyles = {
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#EFEBE9',
        borderRadius: '10px'
    };

    const slideStyles = {
        width: '100%',
        height: '100%',
        backgroundImage: `url(${images && images.length > 0 ? images[currentIndex] : ''})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.4s ease-in-out',
    };
    
    const arrowStyles = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: isMobile ? '1.5rem' : '2rem',
        color: 'rgba(255, 255, 255, 0.9)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '50%',
        padding: '5px',
        cursor: 'pointer',
        zIndex: 1,
    };

    const dotsContainerStyles = {
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '5px',
        zIndex: 1
    };

    const dotStyle = {
        height: '8px',
        width: '8px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        cursor: 'pointer',
    };

    if (!images || images.length === 0) {
        return (
            <div style={{ ...sliderStyles, height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaImage size="3rem" color="#BDBDBD"/>
            </div>
        );
    }

    return (
        <div style={{...sliderStyles, height}} className="slider-container">
            {images.length > 1 && (
                <>
                    <div style={{...arrowStyles, left: '10px'}} className="slider-arrow" onClick={goToPrevious}><FaChevronLeft /></div>
                    <div style={{...arrowStyles, right: '10px'}} className="slider-arrow" onClick={goToNext}><FaChevronRight /></div>
                </>
            )}
            <div style={slideStyles}></div>
            {images.length > 1 && (
                 <div style={dotsContainerStyles}>
                    {images.map((_, slideIndex) => (
                        <div 
                            key={slideIndex} 
                            style={{...dotStyle, backgroundColor: currentIndex === slideIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'}} 
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(slideIndex); }}>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageSlider;