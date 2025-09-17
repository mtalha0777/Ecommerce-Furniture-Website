import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import toast from "react-hot-toast";

import { FaStore, FaMapMarkerAlt, FaShapes } from "react-icons/fa";

const ShopRegistration = () => {
  const [shopName, setShopName] = useState("");
  const [city, setCity] = useState("");
  const [categories, setCategories] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (PNG, JPG).');
        return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; 
    if (file.size > maxSizeInBytes) {
        toast.error('Image size must be less than 5MB.');
        return;
    }

    setProfilePicture(file);
    setProfilePicturePreview(URL.createObjectURL(file));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!shopName.trim() || !city.trim()) {
    toast.error("Shop name and city are required.");
    return;
  }
  setLoading(true);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    console.log("Current User Object:", user);
    
    if (!user) {
      toast.error("Authentication Error: No user is logged in.");
      setLoading(false);
      return;
    }

    let uploadedFileUrl = null;

    if (profilePicture) {
      const fileExt = profilePicture.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `shop-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product_images")
        .upload(filePath, profilePicture);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product_images").getPublicUrl(filePath);

      uploadedFileUrl = publicUrl;
    }

    // Prepare shop data
    const shopData = {
      shopName: shopName.trim(),
      owner_id: user.id,
      city: city.trim(),
      product_categories_text: categories.trim(),
      profilePicture_url: uploadedFileUrl,
    };


    // Insert shop data
    const { data: newShop, error: shopError } = await supabase
      .from("shops")
      .insert(shopData)
      .select()
      .single();

    if (shopError) {
      console.error("Shop insertion error details:", shopError);
      throw new Error(`Shop creation failed: ${shopError.message}`);
    }

    toast.success("Shop created successfully!");
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ shopID: parseInt(newShop.id) }) 
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      throw new Error(`Profile update failed: ${profileError.message}`);
    }

    toast.success("Your shop has been created successfully!");
    navigate("/sellerdashboard");
    
  } catch (error) {
    toast.error("Shop Creation Error Details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    if (error.message.includes('row-level security')) {
      toast.error("Permission denied. Please check your authentication status.");
    } else {
      toast.error(error.message || "An unexpected error occurred.");
    }
  } finally {
    setLoading(false);
  }
};
  // --- Styling ---
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
      maxWidth: "550px",
      backgroundColor: "white",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      padding: "40px",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      color: "#5D4037",
      fontSize: "2.5rem",
      textAlign: "center",
      marginBottom: "15px",
    },
    subtitle: {
      color: "#8D6E63",
      fontSize: "1.1rem",
      textAlign: "center",
      marginBottom: "40px",
    },
    formGroup: { marginBottom: "25px" },
    label: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "#5D4037",
      marginBottom: "8px",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #D7CCC8",
      borderRadius: "8px",
      fontSize: "1rem",
    },
    fileInputContainer: {
      border: "2px dashed #D7CCC8",
      borderRadius: "8px",
      padding: "20px",
      textAlign: "center",
      cursor: "pointer",
    },
    previewImage: {
      maxWidth: "150px",
      maxHeight: "150px",
      borderRadius: "50%",
      objectFit: "cover",
      marginTop: "20px",
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
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.title}>Become a Seller</h1>
        <p style={styles.subtitle}>Fill in your shop details to get started.</p>
        <form onSubmit={handleSubmit}>
          {/* Shop Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FaStore /> Shop Name
            </label>
            <input
              type="text"
              style={styles.input}
              placeholder="e.g., Talha's Fine Furniture"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
          </div>

          {/* City */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FaMapMarkerAlt /> City
            </label>
            <input
              type="text"
              style={styles.input}
              placeholder="e.g., Chiniot"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          {/* Product Categories */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FaShapes /> Product Categories
            </label>
            <input
              type="text"
              style={styles.input}
              placeholder="e.g., Beds, Sofas, Tables"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Shop Profile Picture (Optional)</label>
            <div
              style={styles.fileInputContainer}
              onClick={() => document.getElementById("file-input").click()}
            >
              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Preview"
                  style={styles.previewImage}
                />
              ) : (
                <p>Click to upload an image</p>
              )}
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Setting up your shop..." : "Create Shop"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShopRegistration;
