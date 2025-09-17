import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/resetpassword",
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link has been sent to your email.");
      setMessageSent(true);
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
    backLink: {
      color: "#8D6E63",
      textDecoration: "none",
      marginTop: "20px",
      display: "inline-block",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.title}>Forgot Password?</h1>

        {messageSent ? (
          <p style={styles.subtitle}>
            If an account exists for {email}, you will receive an email with
            instructions to reset your password.
          </p>
        ) : (
          <>
            <p style={styles.subtitle}>
              No worries! Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <Link to="/" style={styles.backLink}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
