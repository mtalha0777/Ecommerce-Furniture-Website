import React from 'react';

import { Banner1, Banner2, Banner3 } from '../Product-banner'






const ProductsPage = () => {
    return (
        <div className='d-flex list-inline  ' style={{marginBottom:'50px'}} >
             <Banner1/>
           

           <Banner2/>
           
           <Banner3/>
            </div>
        
    );
};

export default ProductsPage;
