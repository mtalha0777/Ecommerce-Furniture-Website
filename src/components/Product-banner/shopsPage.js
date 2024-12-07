import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Typography, Container, Box, CircularProgress, Divider } from "@mui/material";
import ShopDetails from './ShopDetails';
import ShopsProductList from './ShopsProductList';
import ProductModal from './ProductModal';

const ShopsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedShop, setEditedShop] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const authToken = sessionStorage.getItem('authToken');
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);
  const productFileInputRef = useRef(null);

  const location = useLocation();
  const { shop } = location.state;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `http://localhost:3001/productsByShop`,
          {
            shopID: shop._id,
          }
        );
        setProducts(response.data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err.response?.data?.error || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    if (shop) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [shop, selectedProduct]);

  const handleCardClick = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduct(null);
  };

  const deleteProduct = async () => {
    try {
      const response = await axios.delete('http://localhost:3001/deleteProduct', {
        data: { id: selectedProduct._id },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log(response.data.message);
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting product:', error.response.data.message);
    }
  };

  const handleNextImage = () => {
    if (selectedProduct) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === selectedProduct.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedProduct) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? selectedProduct.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedShop({ ...shop });
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setUpdateMessage({ type: 'error', text: 'Please upload a valid image file (JPEG, PNG)' });
      return;
    }

    if (file.size > maxSize) {
      setUpdateMessage({ type: 'error', text: 'File size should be less than 5MB' });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', file);
      formData.append('shopID', shop._id);
      formData.append('shopName', editedShop.shopName);
      formData.append('street', editedShop.street);
      formData.append('city', editedShop.city);
      formData.append('productCategories', editedShop.productCategories);
      const response = await axios.put('http://localhost:3001/updateShop', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`
        }
      });

      location.state.shop = response.data.shop;
      setUpdateMessage({ type: 'success', text: 'Profile picture updated successfully' });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile picture' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditSave = async () => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('shopID', shop._id);
      formData.append('shopName', editedShop.shopName);
      formData.append('street', editedShop.street);
      formData.append('city', editedShop.city);
      formData.append('productCategories', editedShop.productCategories);

      const response = await axios.put('http://localhost:3001/updateShop', formData, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      location.state.shop = response.data.shop;
      setIsEditing(false);
      setUpdateMessage({ type: 'success', text: 'Shop updated successfully' });
    } catch (error) {
      console.error('Error updating shop:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update shop' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (index) => {
    if (editedProduct) {
      const newImages = [...editedProduct.images];
      newImages.splice(index, 1);
      setEditedProduct({ ...editedProduct, images: newImages });
    }
  };

  const handleProductImageUpload = async (event) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    formData.append('productID', editedProduct._id);
    
    editedProduct.images.forEach((image, index) => {
      formData.append('existingImages', image);
    });
    
    for (let i = 0; i < files.length; i++) {
      formData.append('productImages', files[i]);
    }

    try {
      setIsUploading(true);
      const response = await axios.put(
        'http://localhost:3001/updateProduct',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      setSelectedProduct(response.data.product);
      setEditedProduct(response.data.product);
      setUpdateMessage({ type: 'success', text: 'Product updated successfully' });
    } catch (error) {
      setUpdateMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update product' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProduct = () => {
    setIsEditingProduct(true);
    setEditedProduct({ ...selectedProduct });
  };

  const handleSaveProduct = async () => {
    try {
      setIsUploading(true);
      const response = await axios.put(
        'http://localhost:3001/updateProduct',
        editedProduct,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      setSelectedProduct(response.data.product);
      setIsEditingProduct(false);
      setUpdateMessage({ type: 'success', text: 'Product updated successfully' });
    } catch (error) {
      setUpdateMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update product' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <Typography
        variant="h4"
        component="h2"
        align="center"
        gutterBottom
        sx={{
          color: "#5D4037",
          fontWeight: "bold",
          padding: "20px"
        }}
      >
        Shop Detail
      </Typography>
      <Container
        sx={{
          backgroundColor: "#FFF3E0",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <ShopDetails
          shop={shop}
          isEditing={isEditing}
          editedShop={editedShop}
          setEditedShop={setEditedShop}
          handleEditClick={handleEditClick}
          handleEditSave={handleEditSave}
          fileInputRef={fileInputRef}
          handleProfilePictureChange={handleProfilePictureChange}
          setIsEditing={setIsEditing}
        />
        <Divider sx={{ mb: 4, borderColor: "#FFB300" }} />
        <Typography
          variant="h5"
          component="h3"
          align="center"
          gutterBottom
          sx={{ color: "#5D4037", fontWeight: "500" }}
        >
          Your added Products
        </Typography>
        <ShopsProductList
          products={products}
          handleCardClick={handleCardClick}
        />
        {selectedProduct && (
          <ProductModal
            openModal={openModal}
            handleCloseModal={handleCloseModal}
            selectedProduct={selectedProduct}
            currentImageIndex={currentImageIndex}
            handlePrevImage={handlePrevImage}
            handleNextImage={handleNextImage}
            handleEditProduct={handleEditProduct}
            deleteProduct={deleteProduct}
            isEditingProduct={isEditingProduct}
            editedProduct={editedProduct}
            setEditedProduct={setEditedProduct}
            handleDeleteImage={handleDeleteImage}
            productFileInputRef={productFileInputRef}
            handleProductImageUpload={handleProductImageUpload}
            handleSaveProduct={handleSaveProduct}
            setIsEditingProduct={setIsEditingProduct}
          />
        )}
        {updateMessage.text && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: '8px',
              backgroundColor: updateMessage.type === 'success' ? '#E8F5E9' : '#FFEBEE',
              color: updateMessage.type === 'success' ? '#2E7D32' : '#C62828',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography>{updateMessage.text}</Typography>
          </Box>
        )}
        {isUploading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress sx={{ color: '#FFB300' }} />
          </Box>
        )}
      </Container>
    </>
  );
};

export default ShopsPage;
