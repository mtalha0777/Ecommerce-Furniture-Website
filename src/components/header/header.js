import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { useWindowSize } from "../../utils/useWindowSize"; 

import {
  SearchOutlined,
  ShoppingBagOutlined,
  FavoriteBorderOutlined,
  AdminPanelSettingsOutlined,
  HomeOutlined,
  PersonOutline,
  LogoutOutlined,
  Menu as MenuIcon, 
  Close as CloseIcon, 
} from "@mui/icons-material";
import logo from "../../assets/images/logo.png";

const Header = () => {
  // --- States ---
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { width } = useWindowSize(); 
  const isMobile = width < 768;

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAllUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/", { replace: true });
        return;
      }
      const user = session.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) setUserData(profile);

      const { count: cart } = await supabase
        .from("cart_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setCartCount(cart || 0);

      const { count: favs } = await supabase
        .from("wishlist_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setFavoritesCount(favs || 0);
    };

    fetchAllUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // --- Handlers ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate("/searchResult", { state: { query: searchQuery } });
  };

  // --- Styling Objects (CSS-in-JS) ---
  const styles = {
    header: {
      backgroundColor: "#FFF8E1", // Creamy background
      padding: "15px 30px",
      borderBottom: "2px solid #EFEBE9",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      fontFamily: "'Lato', sans-serif",
    },
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
    },
    logo: {
      height: "45px",
      marginRight: "10px",
    },
    brandName: {
      fontSize: "1.5rem",
      color: "#5D4037", // Dark Brown
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
    },
    searchContainer: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #D7CCC8",
      borderRadius: "50px",
      backgroundColor: "#fff",
      padding: "5px 5px 5px 20px",
      width: "400px",
    },
    searchInput: {
      border: "none",
      outline: "none",
      width: "100%",
      backgroundColor: "transparent",
    },
    searchButton: {
      backgroundColor: "#8D6E63", // Lighter Brown
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "35px",
      height: "35px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    navIcons: {
      display: "flex",
      alignItems: "center",
      gap: "25px",
    },
    iconLink: {
      color: "#5D4037",
      textDecoration: "none",
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    badge: {
      position: "absolute",
      top: "-8px",
      right: "-10px",
      backgroundColor: "#D84315",
      color: "white",
      borderRadius: "50%",
      fontSize: "0.7rem",
      padding: "2px 6px",
    },
    profileImage: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      objectFit: "cover",
      cursor: "pointer",
      border: "2px solid #8D6E63",
    },
    // Mobile Menu Styles
    mobileMenu: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
    mobileMenuContent: {
      backgroundColor: "#FFF8E1",
      height: "100%",
      width: "280px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
    },
    mobileLink: {
      color: "#5D4037",
      textDecoration: "none",
      fontSize: "1.2rem",
      padding: "15px 0",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      borderBottom: "1px solid #EFEBE9",
    },
  };

  // --- Render Logic ---
  if (isMobile) {
    // --- MOBILE VIEW ---
    return (
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.logoContainer} onClick={() => navigate("/home")}>
            <img src={logo} style={styles.logo} alt="Logo" />
          </div>
          <MenuIcon
            style={{ color: "#5D4037", fontSize: "30px", cursor: "pointer" }}
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>

        {isMobileMenuOpen && (
          <div style={styles.mobileMenu}>
            <div style={styles.mobileMenuContent}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "20px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#5D4037",
                  }}
                >
                  Menu
                </span>
                <CloseIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
              <nav
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <Link
                  to="/profile"
                  style={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PersonOutline /> {userData?.name || "Profile"}
                </Link>
                <Link
                  to="/home"
                  style={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HomeOutlined /> Home
                </Link>
                <Link
                  to="/wishlist"
                  style={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FavoriteBorderOutlined /> Wishlist
                </Link>
                <Link
                  to="/cart"
                  style={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBagOutlined /> Cart
                </Link>
                {userData?.role === 3 && (
                  <Link
                    to="/admin-dashboard"
                    style={styles.mobileLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <AdminPanelSettingsOutlined /> Admin Panel
                  </Link>
                )}
              </nav>
              <button
                onClick={handleLogout}
                style={{
                  ...styles.mobileLink,
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
              >
                <LogoutOutlined /> Logout
              </button>
            </div>
          </div>
        )}
      </header>
    );
  }

  // --- DESKTOP VIEW ---
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Left Side: Logo */}
        <div style={styles.logoContainer} onClick={() => navigate("/home")}>
          <img src={logo} style={styles.logo} alt="Logo" />
          <h1 style={styles.brandName}>AR Furniture</h1>
        </div>

        {/* Middle: Search Bar */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Find your perfect furniture..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button style={styles.searchButton} onClick={handleSearch}>
            <SearchOutlined />
          </button>
        </div>

        {/* Right Side: Icons & Profile */}
        <nav style={styles.navIcons}>
          <Link to="/wishlist" style={styles.iconLink}>
            {favoritesCount > 0 && (
              <span style={styles.badge}>{favoritesCount}</span>
            )}
            <FavoriteBorderOutlined />
            <span>Wishlist</span>
          </Link>
          <Link to="/cart" style={styles.iconLink}>
            {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
            <ShoppingBagOutlined />
            <span>Cart</span>
          </Link>
          <div
            style={{ height: "30px", width: "1px", backgroundColor: "#D7CCC8" }}
          ></div>
          <Link to="/profile" style={styles.iconLink}>
            <img
              src={
                userData?.avatar_url || "https://www.gravatar.com/avatar/?d=mp"
              }
              alt="Profile"
              style={styles.profileImage}
            />
            <span>{userData?.name || "Account"}</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#5D4037",
            }}
          >
            <LogoutOutlined />
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
