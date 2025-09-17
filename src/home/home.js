import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import AdminHeader from "../components/admin/AdminHeader";
import SellerHeader from "../components/seller/SellerHeader";
import ProductsPage from "../components/product/products";
import Footer from "../components/footer/footer";

function Home() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
        } else {
          setUserProfile(profile);
        }
      }
      setLoading(false);
    };

    fetchUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      fetchUserData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const renderHeader = () => {
    if (!userProfile) {
      return;
    }

    switch (userProfile.role) {
      case 3:
        return <AdminHeader />;
      case 2:
        return <SellerHeader />;
      case 1:
      default:
        return;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {renderHeader()}

      <main>
        <div className="d-flex justify-content-center my-4"></div>
        <ProductsPage />
      </main>

      <Footer />
    </div>
  );
}

export default Home;
