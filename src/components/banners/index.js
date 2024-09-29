import React, { useState, useEffect } from 'react';
import Banner01 from '../../assets/images/banner01.jpeg';
import Banner02 from '../../assets/images/banner02.jpeg';
import Banner03 from '../../assets/images/banner03.jpeg';

import './style.css';

const Banners = () => {
    const images = [Banner01, Banner02, Banner03];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='bannerSection'>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col'>
                        <div className='box'>
                            <img 
                                src={images[currentImageIndex]} 
                                className='transition' 
                                alt={`Banner ${currentImageIndex + 1}`} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banners;
