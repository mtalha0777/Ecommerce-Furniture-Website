import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import toast from "react-hot-toast";
import { FaTimes, FaTrash, FaUpload } from "react-icons/fa";

const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onProductUpdated,
  theme,
  isMobile,
}) => {
  // Component State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [currentImages, setCurrentImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
      });
      setCurrentImages(product.image_urls || []);
      setNewImages([]);
      setImagesToDelete([]);
    }
  }, [product]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  // Marks an existing image for deletion
  const handleDeleteCurrentImage = (imageUrl) => {
    setCurrentImages(currentImages.filter((img) => img !== imageUrl));
    setImagesToDelete((prev) => [...prev, imageUrl]);
  };


  const handleDeleteNewImage = (imageName) => {
    setNewImages(newImages.filter((img) => img.name !== imageName));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);

    let finalImageUrls = [...currentImages];

    try {
      //  Delete images from Storage
      if (imagesToDelete.length > 0) {
        const filePaths = imagesToDelete.map((url) => {
          const parts = url.split("/");
          return parts.slice(parts.indexOf("product_images")).join("/");
        });
        await supabase.storage.from("product_images").remove(filePaths);
      }

      //  Upload new images to Storage
      if (newImages.length > 0) {
        const uploadPromises = newImages.map((file) => {
          const filePath = `public/${product.shop_id}/${Date.now()}-${
            file.name
          }`;
          return supabase.storage.from("product_images").upload(filePath, file);
        });
        const uploadResults = await Promise.all(uploadPromises);

        for (const result of uploadResults) {
          if (result.error)
            throw new Error(`Upload failed: ${result.error.message}`);
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("product_images")
            .getPublicUrl(result.data.path);
          finalImageUrls.push(publicUrl);
        }
      }

      // Update the product record in the database
      const { data: updatedProduct, error: updateDbError } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_urls: finalImageUrls,
        })
        .eq("id", product.id)
        .select()
        .single();

      if (updateDbError) throw updateDbError;

      toast.success("Product updated successfully!");
      onProductUpdated(updatedProduct);
      onClose();
    } catch (error) {
      toast.error(`Update failed: ${error.message}`);
      console.error("Error updating product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;


  const styles = {
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: theme.containerBackground,
      padding: isMobile ? "20px" : "30px",
      borderRadius: "15px",
      width: isMobile ? "90%" : "50%",
      maxWidth: "700px",
      maxHeight: "90vh",
      overflowY: "auto",
      position: "relative",
    },
    closeButton: {
      position: "absolute",
      top: "15px",
      right: "15px",
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: theme.secondaryText,
    },
    form: { display: "flex", flexDirection: "column", gap: "20px" },
    input: {
      padding: "12px",
      borderRadius: "8px",
      border: `1px solid ${theme.lightBorder}`,
      fontSize: "1rem",
      color: theme.primaryText,
    },
    button: {
      padding: "15px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: theme.accent,
      color: "white",
      fontSize: "1rem",
      fontWeight: "bold",
      cursor: "pointer",
      opacity: loading ? 0.7 : 1,
    },
    imagePreviewContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
      gap: "10px",
      marginTop: "10px",
      padding: "10px",
      border: `1px solid ${theme.lightBorder}`,
      borderRadius: "8px",
    },
    imageWrapper: { position: "relative", width: "100px", height: "100px" },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "8px",
    },
    deleteImageButton: {
      position: "absolute",
      top: "-5px",
      right: "-5px",
      background: theme.danger,
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.8rem",
    },
     fileInputLabel: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px', 
      border: `2px dashed ${theme.lightBorder}`,
      borderRadius: '8px',
      padding: '20px',
      minHeight: '120px',
      cursor: 'pointer',
      color: theme.secondaryText,
      backgroundColor: '#fdfdfd', 
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    },
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <style>{`
        .file-upload-label:hover {
          background-color: #f5f5f5;
          border-color: ${theme.accent};
        }
      `}</style>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <h2 style={{ color: theme.primaryText, marginBottom: "20px" }}>
          Edit Product
        </h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Text Inputs */}
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            style={{ ...styles.input, height: "120px" }}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* Image Management Section */}
          <div>
            <h3 style={{ color: theme.primaryText, marginBottom: "10px" }}>
              Manage Images
            </h3>

            {(currentImages.length > 0 || newImages.length > 0) && (
              <div style={styles.imagePreviewContainer}>
                {/* Current Images */}
                {currentImages.map((url, index) => (
                  <div key={`current-${index}`} style={styles.imageWrapper}>
                    <img
                      src={url}
                      alt={`${product.name} preview ${index + 1}`}
                      style={styles.previewImage}
                    />
                    <button
                      type="button"
                      style={styles.deleteImageButton}
                      onClick={() => handleDeleteCurrentImage(url)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                {/* New Images to be Uploaded */}
                {newImages.map((file, index) => (
                  <div key={`new-${index}`} style={styles.imageWrapper}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New upload: ${file.name}`}
                      style={styles.previewImage}
                    />
                    <button
                      type="button"
                      style={styles.deleteImageButton}
                      onClick={() => handleDeleteNewImage(file.name)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File Upload Input */}
            <label
              style={styles.fileInputLabel}
              htmlFor="imageUpload"
              className="file-upload-label"
            >
              <FaUpload size={24} />
              <span>Click or drag to upload new images</span>
              <input
                id="imageUpload"
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
