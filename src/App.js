import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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
import PaymentMethods from "./components/PaymentMethod/PaymentMethod";
import NotFound from "./login-signup/404page";
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from "./components/users/userProfile";
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const location = useLocation(); // Get the current location

  // Check if the current path is either login or signup
  const showHeader = !["/", "/signup", "/404page"].includes(location.pathname);

  return (
    <>
      {showHeader && <Header />} {/* Conditionally render the Header */}
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/404page" element={<NotFound />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/bed" element={
          <ProtectedRoute>
            <Bed />
          </ProtectedRoute>
        } />
        <Route path="/sofa" element={
          <ProtectedRoute>
            <Sofa />
          </ProtectedRoute>
        } />
        <Route path="/table" element={
          <ProtectedRoute>
            <Table />
          </ProtectedRoute>
        } />
        <Route path="/delete" element={
          <ProtectedRoute>
            <Del />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/AboutPage" element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        } />
        <Route path="/shopdetails" element={
          <ProtectedRoute>
            <ShopRegistration />
          </ProtectedRoute>
        } />
        <Route path="/shopPage" element={
          <ProtectedRoute>
            <ShopsPage />
          </ProtectedRoute>
        } />
        <Route path="/productList" element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        } />
        <Route path="/searchResult" element={
          <ProtectedRoute>
            <SearchResults />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/paymentMethod" element={
          <ProtectedRoute>
            <PaymentMethods amount={10} />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/404page" replace />} />
      </Routes>
    </>
  );
}

export default App;
