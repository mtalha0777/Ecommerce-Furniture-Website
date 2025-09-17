import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Your password has been updated successfully!");
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
    box: {
      width: "100%",
      maxWidth: "450px",
      backgroundColor: "white",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      padding: "40px",
      textAlign: "center",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      color: "#5D4037",
      fontSize: "2.2rem",
      marginBottom: "15px",
    },
    subtitle: { color: "#8D6E63", fontSize: "1.1rem", marginBottom: "30px" },
    input: {
      width: "100%",
      padding: "15px",
      border: "1px solid #D7CCC8",
      borderRadius: "10px",
      outline: "none",
      fontSize: "1rem",
      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      marginBottom: "20px",
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
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.title}>Create New Password</h1>
        <p style={styles.subtitle}>Please enter your new password below.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            style={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
