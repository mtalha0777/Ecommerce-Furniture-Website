import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css';


import Banners from '../components/banners';
import  ProductsPage from '../components/product/products'
import Header from '../components/header/header';
import Footer from '../components/footer/footer';







function Home() {

  return (
    
    <div>
      
      <Header />
       
       <ProductsPage/>
     
      <Footer />
    </div>
      
  );
}

export default Home;

