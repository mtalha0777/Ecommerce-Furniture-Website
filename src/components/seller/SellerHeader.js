import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import toast from "react-hot-toast";

import {
  SearchOutlined,
  LogoutOutlined,
  SettingsOutlined,
  HomeOutlined, 
} from "@mui/icons-material";
import logo from "../../assets/images/logo.png";

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const SellerHeader = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed: " + error.message);
    } else {
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    toast.info(`Searching for: ${searchQuery}`);
    // Future implementation: navigate("/seller-search", { state: { query: searchQuery } });
  };

  const styles = {
    header: {
      backgroundColor: "#FFF8E1",
      padding: isMobile ? "10px 15px" : "15px 30px",
      borderBottom: "2px solid #EFEBE9",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      fontFamily: "'Lato', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '20px'
    },
    logoContainer: {
      flexShrink: 0,
    },
    logo: {
      height: "50px",
    },
    searchContainer: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #D7CCC8",
      borderRadius: "50px",
      backgroundColor: "#fff",
      padding: "5px 5px 5px 20px",
      flex: '1',
      minWidth: '250px',
      maxWidth: '500px',
      order: isMobile ? 3 : 2, 
      width: isMobile ? '100%' : 'auto'
    },
    searchInput: {
      border: "none",
      outline: "none",
      width: "100%",
      backgroundColor: "transparent",
      fontSize: '1rem'
    },
    searchButton: {
      backgroundColor: "#8D6E63",
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
      order: isMobile ? 2 : 3
    },
    iconLink: {
      color: "#5D4037",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: '1rem'
    },
    logoutButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#5D4037",
      display: 'flex',
      alignItems: 'center'
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <img src={logo} style={styles.logo} alt="AR Furniture Logo" />
      </div>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search your products..."
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button style={styles.searchButton} onClick={handleSearch}>
          <SearchOutlined />
        </button>
      </div>

      <nav style={styles.navIcons}>
        <Link to="/sellerdashboard" style={styles.iconLink} title="Dashboard">
          <HomeOutlined />
          {!isMobile && <span>Dashboard</span>}
        </Link>
        
        <Link to="/sellersettings" style={styles.iconLink} title="Settings">
          <SettingsOutlined />
          {!isMobile && <span>Settings</span>}
        </Link>

        <div style={{ height: "30px", width: "1px", backgroundColor: "#D7CCC8" }}></div>

        <button onClick={handleLogout} title="Logout" style={styles.logoutButton}>
          <LogoutOutlined />
        </button>
      </nav>
    </header>
  );
};

export default SellerHeader;