import React from 'react';
import { BrowserRouter as  Router,Route,Routes } from 'react-router-dom'; 
import Bed from './components/bedpage/bed';
import Sofa from './components/bedpage/sofa';
import Table from './components/bedpage/table';
import Login from './login-signup/login';
import Signup from './login-signup/signup';
import Del from './login-signup/delete';
import Home from './home/home';
import Cart from './components/cart';
import AboutPage from './components/footer/AboutPage';

function App() {
  return (
   
 
<Routes>
<Route exact path="/" element={<Login/>}/>
<Route path="/home" element={<Home/>}/>
<Route path="/signup" element={<Signup/>}/>
<Route path="/bed" element={<Bed/>}/>
<Route path="/sofa" element={<Sofa/>}/>
<Route path="/table" element={<Table/>}/>
<Route path="/delete" element={<Del/>}/>
<Route path="/cart" element={<Cart />} />
<Route path="/AboutPage" element={<AboutPage />} />

</Routes>

   
  );
}

export default App;
