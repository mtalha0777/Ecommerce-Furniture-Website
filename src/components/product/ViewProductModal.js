import React from "react";
import { FaTimes } from "react-icons/fa";
import ProductImageSlider from "./ProductImageSlider";

const ViewProductModal = ({ isOpen, onClose, product, theme, isMobile }) => {
  if (!isOpen || !product) return null;

  const styles = {
    modalOverlay: {
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 1000,
    },
    modalContent: {
      backgroundColor: theme.containerBackground, padding: isMobile ? "20px" : "30px",
      borderRadius: "15px", width: isMobile ? "90%" : "60%",
      maxWidth: "700px", maxHeight: "90vh", overflowY: "auto",
      position: "relative", boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    },
    closeButton: {
      position: "absolute", top: "15px", right: "15px", background: "none",
      border: "none", fontSize: "1.5rem", cursor: "pointer", color: theme.secondaryText,
    },
    sliderContainer: {
        width: "100%",
        height: "350px", 
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "20px",
    },
    productName: {
      fontSize: isMobile ? "1.5rem" : "2rem",
      fontWeight: "bold",
      color: theme.primaryText,
      marginBottom: "10px",
    },
    productPrice: {
      fontSize: isMobile ? "1.2rem" : "1.5rem",
      fontWeight: "bold",
      color: theme.success,
      marginBottom: "20px",
    },
    productDescription: {
      color: theme.secondaryText,
      fontSize: "1rem",
      lineHeight: "1.6",
      whiteSpace: "pre-wrap",
    },
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        
        <div style={styles.sliderContainer}>
            <ProductImageSlider
                images={product.image_urls}
                isMobile={isMobile}
                height="100%"
            />
        </div>

        <h2 style={styles.productName}>{product.name}</h2>
        <p style={styles.productPrice}>Rs. {product.price}</p>
        <p style={styles.productDescription}>{product.description}</p>
      </div>
    </div>
  );
};

export default ViewProductModal;