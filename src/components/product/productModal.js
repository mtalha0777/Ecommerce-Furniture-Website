import React, { useState } from "react";
import axios from "axios";
import "./modal.css";

const AddProductModal = ({ isOpen, onClose }) => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files.slice(0, 4)); // limit to 4 images
  };
  const categories = [
    "Furniture",
    "Chairs",
    "Tables",
    "Sofas",
    "Beds",
    "Storage",
  ];
  const authToken = sessionStorage.getItem('authToken');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get shopID from local storage
    const shopID = localStorage.getItem('shopID');
    // Check required fields
    if (!productName || !category || !price || images.length === 0) {
      setError("All fields are required, including images");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("shopID", shopID);

    images.forEach((image) => {
      formData.append("productImages", image);
    });

    try {
      const response = await axios.post("http://localhost:3001/createproduct", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          'Authorization': `Bearer ${authToken}`
        },
      });
      alert(response.data.message);
      onClose(); // close modal after success
    } catch (err) {
      setError("Failed to create product. Please try again.");
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay" style={{zIndex:10000}}>
        <div className="modal-content">
          <h2>Add New Product</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Product Images (up to 4)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                required
              />
            </div>
            <button type="submit" className="create-button">
              Create Product
            </button>
          </form>
          <button onClick={onClose} className="" style={{backgroundColor:'red', color:'white', borderRadius:10, marginTop:15, padding:10}}>
            Close
          </button>
        </div>
      </div>
    )
  );
};

export default AddProductModal;
