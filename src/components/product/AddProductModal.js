import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

const AddProductModal = ({ isOpen, onClose, theme, isMobile, onProductAdded })  => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [shopId, setShopId] = useState(null);
   const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
     let isMounted = true; 
    const fetchDataForModal = async () => {
      try {
        const { data: categoriesData, error: catError } = await supabase.from("categories").select("id, name");
        if (catError) throw catError;
       
        if (isMounted && categoriesData) setCategories(categoriesData); 

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from("profiles").select("shopID").eq("id", user.id).single();
          if (error) throw error;
          if (profile && profile.shopID) {
            setShopId(profile.shopID);
          } else {
            toast.error("Could not find your shop.");
            onClose();
          }
        }
      } catch (error) {
        toast.error("Failed to load necessary data.");
        console.error("Error fetching modal data:", error);
      }
    };

    if (isOpen) {
      fetchDataForModal();
    }
   return () => {
      isMounted = false; 
    };
  }, [isOpen, onClose]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files.slice(0, 4));
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !price || !selectedCategoryId || images.length === 0 || !shopId) {
      toast.error("Please fill all fields, upload at least one image, and ensure your shop is set up.");
      return;
    }
    setLoading(true);
    try {
      const imageUrls = [];
      for (const imageFile of images) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${shopId}-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product_images")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${imageFile.name}`);
        }

        const { data } = supabase.storage
          .from("product_images")
          .getPublicUrl(filePath);
        imageUrls.push(data.publicUrl);
      }

      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          name: productName,
          description: description,
          price: parseFloat(price),
          category_id: selectedCategoryId, 
          image_urls: imageUrls, 
          shop_id: shopId,
        })
        .select() 
        .single();  

      if (insertError) {
        toast.error("Supabase insert error:", insertError);
        throw insertError;
      }

      toast.success("Product added successfully!");
      onProductAdded(newProduct);
      
      setProductName("");
      setDescription("");
      setSelectedCategoryId("");
      setPrice("");
      setImages([]);

      onClose(); 
      
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

   
  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    modal: {
      backgroundColor: theme.containerBackground,
      borderRadius: "15px",
      padding: isMobile ? "20px" : "30px",
      width: "90%",
      maxWidth: "500px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
      maxHeight: "90vh",
      overflowY: "auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: { color: theme.primaryText, fontSize: "1.5rem", margin: 0 },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: theme.secondaryText,
    },
    formGroup: { marginBottom: "20px" },
    label: {
      display: "block",
      color: theme.primaryText,
      marginBottom: "8px",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: `1px solid ${theme.lightBorder}`,
      borderRadius: "8px",
      fontSize: "1rem",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      border: `1px solid ${theme.lightBorder}`,
      borderRadius: "8px",
      fontSize: "1rem",
      minHeight: "100px",
    },
    submitButton: {
      width: "100%",
      padding: "15px",
      backgroundColor: theme.accent,
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "1.1rem",
      cursor: "pointer",
    },
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Product</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              style={styles.input}
            />
          </div>

            <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <select
              value={selectedCategoryId} 
              onChange={(e) => setSelectedCategoryId(e.target.value)} 
              required
              style={styles.input}
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option> 
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={styles.textarea}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Price (Rs.)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Product Images (up to 4)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
