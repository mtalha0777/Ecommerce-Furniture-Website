import React from "react";
import { Route, Routes, useLocation } from "react-router-dom"; 
import Bed from "./components/bedpage/bed";
import Sofa from "./components/bedpage/sofa";
import Table from "./components/bedpage/table";
import Login from "./login-signup/login";
import Signup from "./login-signup/signup";
import Del from "./login-signup/delete";
import Home from "./home/home";
import Cart from "./components/cart";
import AboutPage from "./components/footer/AboutPage";
import ShopRegistration from "./login-signup/shopDetails/shopDetails";
import ShopsPage from "./components/Product-banner/shopsPage";
import ProductList from "./components/Product-banner/productList";
import Header from "./components/header/header";
import SearchResults from "./components/product/searchedProduct";
import PaymentMethods from './components/PaymentMethod/PaymentMethod';

function App() {
  const location = useLocation(); // Get the current location

  // Check if the current path is either login or signup
  const showHeader = !['/', '/signup'].includes(location.pathname);

  return (
    <>
      {showHeader && <Header />} {/* Conditionally render the Header */}
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/bed" element={<Bed />} />
        <Route path="/sofa" element={<Sofa />} />
        <Route path="/table" element={<Table />} />
        <Route path="/delete" element={<Del />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/AboutPage" element={<AboutPage />} />
        <Route path="/shopdetails" element={<ShopRegistration />} />
        <Route path="/shopPage" element={<ShopsPage />} />
        <Route path="/productList" element={<ProductList />} />
        <Route path="/searchResult" element={<SearchResults />} />
      <Route path="/paymentMethod" element={<PaymentMethods amount={10} />} />
      </Routes>
    </>
  );
}

export default App;
