import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bed2 from '../../assets/images/bed2.jpeg';
import bed3 from '../../assets/images/bed.webp';
import bed4 from '../../assets/images/bed4.jpeg';
import bed5 from '../../assets/images/bed5.jpeg';
import sofa1 from '../../assets/images/sofa1.jpeg';
import sofa2 from '../../assets/images/sofa2.jpeg';
import sofa3 from '../../assets/images/sofa3.jpeg';
import table1 from '../../assets/images/table1.jpeg';
import table2 from '../../assets/images/table2.jpeg';
import table3 from '../../assets/images/table3.jpeg';
import './style1.css';

const Banner = ({ title, images, category }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleNavigate = () => {
    navigate('/productList', { state: { category } });
  };

  return (
    <div className="col-md-4 col-sm-12 mb-4 d-flex justify-content-center">
      <div className="card product-card shadow-sm">
        <h3>{title}</h3>
        <img src={images[currentImageIndex]} alt={title} className="product-image" />
        <button 
          onClick={handleNavigate}
          className="btn btn-golden mt-3"
        >
          Visit Page
        </button>
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="container-fluid home-page" style={{ backgroundColor: '#FFF3E0' }}>
      <div className="container py-5">
        <h1 className="text-center mb-5 text-brown">Welcome to Our Furniture Store</h1>
        <div className="row justify-content-center">
          <Banner
            title="Beds"
            images={[bed2, bed3, bed4, bed5]}
            category="bed"
          />
          <Banner
            title="Sofas"
            images={[sofa1, sofa2, sofa3]}
            category="sofa"
          />
          <Banner
            title="Chairs & Tables"
            images={[table1, table2, table3]}
            category="table"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
