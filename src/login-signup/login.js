import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useWindowSize } from "../utils/useWindowSize";

const AnimatedLogo = () => {
  const styles = {
    svg: {
      width: "100px",
      height: "100px",
      stroke: "#5D4037",
      strokeWidth: 3,
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    "@keyframes draw": {
      to: { strokeDashoffset: 0 },
    },
    path: {
      strokeDasharray: 1000,
      strokeDashoffset: 1000,
      animation: "draw 2s ease-in-out forwards",
    },
  };

  return (
    <div>
      <style>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
      <svg viewBox="0 0 100 100" style={styles.svg}>
        <path
          d="M20 30 L 80 30 L 80 50 L 20 50 Z"
          style={{ ...styles.path, animationDelay: "0s" }}
        />
        <path
          d="M25 50 L 25 80"
          style={{ ...styles.path, animationDelay: "0.5s" }}
        />
        <path
          d="M75 50 L 75 80"
          style={{ ...styles.path, animationDelay: "0.7s" }}
        />
        <path
          d="M20 30 L 30 10 L 70 10 L 80 30"
          style={{ ...styles.path, animationDelay: "1s" }}
        />
      </svg>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const [rememberMe, setRememberMe] = useState(false);
  const isMobile = width < 768;
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        toast.error(error.message);
        setLoading(false); 
        return;
    }


    if (data.user) {
  
        if (rememberMe) {
            localStorage.setItem("rememberedEmail", email);
        } else {
            localStorage.removeItem("rememberedEmail");
        }


        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("role, shopID")
            .eq("id", data.user.id)
            .single();

        if (profileError) {
            toast.error("Could not fetch user profile. Please try again.");
            await supabase.auth.signOut(); 
            setLoading(false);
            return;
        }

        toast.success("Logged in successfully!");
        
        const userRole = profileData.role;
        const userShopID = profileData.shopID;

        if (userRole === 3) {
            navigate('/admindashboard');
        } else if (userRole === 2) {
         
            if (userShopID) {
              
                navigate('/sellerdashboard');
            } else {
              
                navigate('/shopdetails');
            }
        } else {
           
            navigate('/home');
        }
    }

    setLoading(false);
};

  const styles = {
    page: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#F5EFE6",
      fontFamily: "'Lato', sans-serif",
      padding: "20px",
    },
    loginBox: {
      display: "flex",
      width: "100%",
      maxWidth: "900px",
      minHeight: "600px",
      backgroundColor: "white",
      borderRadius: "20px",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
      overflow: "hidden",
      flexDirection: isMobile ? "column" : "row",
    },
    leftPanel: {
      flex: 1,
      backgroundColor: "#FFF8E1",
      padding: isMobile ? "40px 20px" : "50px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    },
    rightPanel: {
      flex: 1,
      padding: isMobile ? "40px 20px" : "50px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      color: "#5D4037",
      fontSize: isMobile ? "2rem" : "2.5rem",
      marginBottom: "10px",
    },
    subtitle: {
      color: "#8D6E63",
      fontSize: "1.1rem",
      marginBottom: "40px",
    },
    inputGroup: {
      position: "relative",
      marginBottom: "25px",
    },
    input: {
      width: "100%",
      padding: "15px 45px 15px 15px",
      border: "1px solid #D7CCC8",
      borderRadius: "10px",
      outline: "none",
      fontSize: "1rem",
      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    },
    inputIcon: {
      position: "absolute",
      top: "50%",
      right: "15px",
      transform: "translateY(-50%)",
      color: "#8D6E63",
      cursor: "pointer",
    },
    button: {
      width: "100%",
      padding: "15px",
      backgroundColor: "#8D6E63",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "1.1rem",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
    },
    secondaryButton: {
      width: "100%",
      padding: "15px",
      backgroundColor: "transparent",
      color: "#8D6E63",
      border: "1px solid #8D6E63",
      borderRadius: "10px",
      fontSize: "1.1rem",
      cursor: "pointer",
      transition: "background-color 0.3s ease, color 0.3s ease",
    },
    divider: {
      textAlign: "center",
      margin: "20px 0",
      color: "#BDBDBD",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.loginBox}>
        {/* Left Panel for Branding and Animation */}
        <div style={styles.leftPanel}>
          <AnimatedLogo />
          <h1 style={styles.title}>AR Furniture</h1>
          <p style={styles.subtitle}>Crafting spaces, creating memories.</p>
        </div>

        {/* Right Panel for the Form */}
        <div style={styles.rightPanel}>
          <h2
            style={{
              ...styles.title,
              fontSize: "2rem",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            Welcome Back
          </h2>
          <p
            style={{
              ...styles.subtitle,
              marginBottom: "30px",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            Sign in to continue.
          </p>
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <input
                type="email"
                placeholder="Enter your email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                onFocus={(e) => {
                  e.target.style.borderColor = "#8D6E63";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(141, 110, 99, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D7CCC8";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                onFocus={(e) => {
                  e.target.style.borderColor = "#8D6E63";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(141, 110, 99, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D7CCC8";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                style={styles.inputIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "#5D4037",
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                Remember Me
              </label>
              <Link
                to="/forgotpassword"
                style={{ color: "#8D6E63", textDecoration: "none" }}
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              style={styles.button}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#5D4037")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#8D6E63")
              }
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <p style={styles.divider}>or</p>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <button
              style={styles.secondaryButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#8D6E63";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#8D6E63";
              }}
            >
              Create an Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
