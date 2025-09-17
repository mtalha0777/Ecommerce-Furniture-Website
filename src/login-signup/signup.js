import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";
import { useWindowSize } from "../utils/useWindowSize";

import { FaEye, FaEyeSlash } from "react-icons/fa";

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
    path: {
      strokeDasharray: 1000,
      strokeDashoffset: 1000,
      animation: "draw 2s ease-in-out forwards",
    },
  };
  return (
    <div>
      {" "}
      <style> {`@keyframes draw { to { stroke-dashoffset: 0; } }`} </style>{" "}
      <svg viewBox="0 0 100 100" style={styles.svg}>
        {" "}
        <path
          d="M20 30 L 80 30 L 80 50 L 20 50 Z"
          style={{ ...styles.path, animationDelay: "0s" }}
        />{" "}
        <path
          d="M25 50 L 25 80"
          style={{ ...styles.path, animationDelay: "0.5s" }}
        />{" "}
        <path
          d="M75 50 L 75 80"
          style={{ ...styles.path, animationDelay: "0.7s" }}
        />{" "}
        <path
          d="M20 30 L 30 10 L 70 10 L 80 30"
          style={{ ...styles.path, animationDelay: "1s" }}
        />{" "}
      </svg>{" "}
    </div>
  );
};

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    color: "transparent",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.name = "Name must contain only letters";
    }
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email address is invalid";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    return errors;
  };
  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length > 7) strength++;
    if (pass.match(/[a-z]/)) strength++;
    if (pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^a-zA-Z0-9]/)) strength++;
    switch (strength) {
      case 0:
      case 1:
      case 2:
        return { label: "Weak", color: "#dc3545" };
      case 3:
        return { label: "Good", color: "#ffc107" };
      case 4:
      case 5:
        return { label: "Strong", color: "#28a745" };
      default:
        return { label: "", color: "transparent" };
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const roleValue = role === "User" ? 1 : 2;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: roleValue } },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        "Registration successful! Please check your email to verify."
      );
      navigate("/");
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
    signupBox: {
      display: "flex",
      width: "100%",
      maxWidth: "900px",
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
    subtitle: { color: "#8D6E63", fontSize: "1.1rem", marginBottom: "30px" },
    inputGroup: { position: "relative", marginBottom: "20px" },
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
    select: {
      width: "100%",
      padding: "15px",
      border: "1px solid #D7CCC8",
      borderRadius: "10px",
      outline: "none",
      fontSize: "1rem",
      backgroundColor: "white",
      appearance: "none",
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
      transition: "background-color 0.3s ease",
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
    divider: { textAlign: "center", margin: "20px 0", color: "#BDBDBD" },
    errorText: { color: "#dc3545", fontSize: "0.875rem", marginTop: "5px" },
    strengthBarContainer: {
      display: "flex",
      alignItems: "center",
      marginTop: "8px",
      gap: "10px",
    },
    strengthBar: {
      width: "100%",
      height: "6px",
      backgroundColor: "#e0e0e0",
      borderRadius: "6px",
      overflow: "hidden",
    },
    strengthText: { fontSize: "0.8rem", whiteSpace: "nowrap" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.signupBox}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <AnimatedLogo />
          <h1 style={styles.title}>AR Furniture</h1>
          <p style={styles.subtitle}>Begin your journey with us.</p>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <h2
            style={{ ...styles.title, textAlign: isMobile ? "center" : "left" }}
          >
            Create Your Account
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Full Name"
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p style={styles.errorText}>{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div style={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email Address"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p style={styles.errorText}>{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div style={styles.inputGroup}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 8 characters)"
                style={styles.input}
                value={password}
                onChange={handlePasswordChange}
              />
              <span
                style={styles.inputIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.password && (
                <p style={styles.errorText}>{errors.password}</p>
              )}
              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div style={styles.strengthBarContainer}>
                  <div style={styles.strengthBar}>
                    <div
                      style={{
                        width: `${
                          passwordStrength.label === "Weak"
                            ? 33
                            : passwordStrength.label === "Good"
                            ? 66
                            : 100
                        }%`,
                        height: "100%",
                        backgroundColor: passwordStrength.color,
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>
                  <span
                    style={{
                      ...styles.strengthText,
                      color: passwordStrength.color,
                    }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div style={styles.inputGroup}>
              <select
                style={styles.select}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="User">I am a Customer</option>
                <option value="Seller">I am a Seller</option>
              </select>
            </div>

            {/* Submit Button */}
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p style={styles.divider}>or</p>

          {/* Login Link */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <button style={styles.secondaryButton}>
              Already have an account? Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
