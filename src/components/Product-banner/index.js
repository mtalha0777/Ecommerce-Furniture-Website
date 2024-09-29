import React, { useState, useEffect } from 'react';

import bed2 from '../../assets/images/bed2.jpeg';
import bed3 from '../../assets/images/bed3.jpeg';
import bed from '../../assets/images/bed.webp';
import bed4 from '../../assets/images/bed4.jpeg';
import bed5 from '../../assets/images/bed5.jpeg';

import sofa1 from '../../assets/images/sofa1.jpeg';
import sofa2 from '../../assets/images/sofa2.jpeg';
import sofa3 from '../../assets/images/sofa3.jpeg';

import table1 from '../../assets/images/table1.jpeg';
import table2 from '../../assets/images/table2.jpeg';
import table3 from '../../assets/images/table3.jpeg';
import { Link } from 'react-router-dom';

import './style1.css';

const Banner1 = () => {
    const images = [bed, bed2, bed3, bed4, bed5];
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
                        <h3 style={{textAlign:'center'}}>Beds</h3>
                            <img src={images[currentImageIndex]} className='w-100 transition' />
                            <Link to='/bed' className='btn btn-default border w-100 bg-info rounded-0 text-decoration-none'style={{boxShadow:' 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'}}>Vist Page</Link>
           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Banner2 = () => {
    const images = [sofa1, sofa2, sofa3];
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
                            <h3 style={{textAlign:'center'}}>Sofas</h3>
                            <img src={images[currentImageIndex]} className='w-100 transition' />
                            <Link to='/sofa' className='btn btn-default border w-100 bg-info rounded-0 text-decoration-none'style={{boxShadow:' 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'}}>Vist Page</Link>
           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Banner3 = () => {
    const images = [table1, table2, table3];
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
                        <h3 style={{textAlign:'center'}}>Chairs & Tables</h3>
                            <img src={images[currentImageIndex]} className='w-100 transition' />

                            <Link to='/table' className='btn btn-default border w-100 bg-info rounded-0 text-decoration-none'style={{boxShadow:' 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'}}>Vist Page</Link>
           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { Banner1, Banner2, Banner3 };
