import React from 'react';
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import toast from 'react-hot-toast';

import { LogoutOutlined, SettingsOutlined, HomeOutlined } from "@mui/icons-material";
// import logo from "../../assets/images/logo.png";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed: " + error.message);
    } else {
      toast.success("Logged out successfully");
      navigate("/"); 
    }
  };
  
  const styles = {
    header: {
      backgroundColor: "#FFF8E1",
      padding: "15px 30px",
      borderBottom: "2px solid #EFEBE9",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      fontFamily: "'Lato', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px'
    },
    // logoContainer: {
    //   flexShrink: 0,
    // },
    // logo: {
    //   height: "50px",
    // },

    navIcons: {
      display: "flex",
      alignItems: "center",
      gap: "25px",
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
   
      {/* <div style={styles.logoContainer}>
        <img src={logo} style={styles.logo} alt="AR Furniture Logo" />
      </div> */}

      <nav style={styles.navIcons}>

        <Link to="/admindashboard" style={styles.iconLink} title="Dashboard">
          <HomeOutlined />
          <span>Dashboard</span>
        </Link>

        <Link to="/adminsettings" style={styles.iconLink} title="Settings">
          <SettingsOutlined />
          <span>Settings</span>
        </Link>

        <div style={{ height: "30px", width: "1px", backgroundColor: "#D7CCC8" }}></div>
        

        <button onClick={handleLogout} title="Logout" style={styles.logoutButton}>
          <LogoutOutlined />
          <span style={{marginLeft: '5px'}}>Logout</span>
        </button>
      </nav>
    </header>
  );
};

export default AdminHeader;