import React, { useState } from "react";
import "./shopDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faRoad,
  faCity,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";

function ShopRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const userID = location.state?.userID;
  const [formData, setFormData] = useState({
    shopName: "",
    street: "",
    city: "",
    productCategories: "",
    profilePicture: null,
    profilePicturePreview: null,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]; // Example cities

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      const isSizeValid = file.size <= 5 * 1024 * 1024; // 5MB in bytes

      if (!isImage) {
        setErrorMessage("Please upload an image file (JPEG, PNG).");
        setFormData({
          ...formData,
          profilePicture: null,
          profilePicturePreview: null,
        });
        return;
      }

      if (!isSizeValid) {
        setErrorMessage("Image size should be less than 5MB.");
        setFormData({
          ...formData,
          profilePicture: null,
          profilePicturePreview: null,
        });
        return;
      }

      setErrorMessage("");
      setFormData({
        ...formData,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("shopName", formData.shopName);
    data.append("street", formData.street);
    data.append("city", formData.city);
    data.append("productCategories", formData.productCategories);
    
    if (userID) {
      data.append("userID", userID);
    }

    if (formData.profilePicture) {
      data.append("profilePicture", formData.profilePicture);
    }

    fetch("http://localhost:3001/createshop", {
      method: "POST",
      body: data,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Reset the form if needed
        setFormData({
          shopName: "",
          street: "",
          city: "",
          productCategories: "",
          profilePicture: null,
          profilePicturePreview: null,
        });
        navigate('/home');
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("An error occurred while submitting the form.");
      });
  };

  return (
    <div className="shop-registration" style={{ marginTop: "5%" }}>
      <h2>Register Your Shop</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Shop Name:</label>
          <FontAwesomeIcon icon={faStore} className="icon" />
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Street Address:</label>
          <FontAwesomeIcon icon={faRoad} className="icon" />
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>City:</label>
          <FontAwesomeIcon icon={faCity} className="icon" />
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select your city
            </option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Product Categories:</label>
          <FontAwesomeIcon icon={faTag} className="icon" />
          <input
            type="text"
            name="productCategories"
            value={formData.productCategories}
            onChange={handleChange}
            placeholder="e.g., Electronics, Fashion, Groceries"
            required
          />
        </div>

        <div>
          <label>Profile Picture:</label>
          <input
            type="file"
            accept="image/*"
            name="profilePicture"
            onChange={handleFileChange}
          />
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>

        {formData.profilePicturePreview && (
          <div className="profile-picture-preview">
            <img src={formData.profilePicturePreview} alt="Profile Preview" />
          </div>
        )}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default ShopRegistration;
