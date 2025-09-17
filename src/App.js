import React, { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./utils/supabaseClient";
import Login from "./login-signup/login";
import Signup from "./login-signup/signup";
import ForgotPassword from "./login-signup/ForgotPassword";
import ResetPassword from "./login-signup/ResetPassword";
import Home from "./home/home";
import Cart from "./components/cart";
import Wishlist from "./components/Wishlist";
import AboutPage from "./components/footer/AboutPage";
import SellerDashboard from "./components/seller/SellerDashboard";
import SellerHeader from "./components/seller/SellerHeader";
import SellerSettings from "./components/seller/SellerSettings";
import ShopRegistration from "./login-signup/shopDetails/shopDetails";
import ProductDetail from "./components/Product-banner/ProductDetail";
import ProductList from "./components/Product-banner/productList";
import Header from "./components/header/header";
import PaymentMethods from "./components/PaymentMethod/PaymentMethod";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./components/users/userProfile";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminHeader from "./components/admin/AdminHeader";
import AdminSettings from "./components/admin/AdminSettings";
import { Toaster } from "react-hot-toast";
function App() {
  const location = useLocation(); // Get the current location
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/resetpassword");
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const showHeader = ![
    "/",
    "/signup",
    "/forgotpassword",
    "/resetpassword",
    "/shopdetails",
    "/404page",
    "/sellerdashboard",
    "/sellersettings",
    "/admindashboard",
    "/adminsettings",
  ].includes(location.pathname);

  return (
    <>
      <Toaster position="top-center" />
      {showHeader && <Header />} {/* Conditionally render the Header */}
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AboutPage"
          element={
            <ProtectedRoute>
              <AboutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sellerdashboard"
          element={
            <ProtectedRoute>
              <SellerHeader />
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sellersettings"
          element={
            <ProtectedRoute>
              <SellerHeader />
              <SellerSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shopdetails"
          element={
            <ProtectedRoute>
              <ShopRegistration />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/productList"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route path="/product/:id"
           element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paymentMethod"
          element={
            <ProtectedRoute>
              <PaymentMethods amount={10} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute>
              <AdminHeader />
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/adminsettings"
          element={
            <ProtectedRoute>
              <AdminHeader />
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/404page" replace />} />
      </Routes>
    </>
  );
}

export default App;
