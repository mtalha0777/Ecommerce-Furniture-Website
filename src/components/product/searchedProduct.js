import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Container,
  Chip,
  Modal,
  Backdrop,
  Fade,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos,
  FavoriteBorder,
  Favorite,
  AddShoppingCart,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

const SearchResults = () => {
  const location = useLocation();
  const { searchResults } = location.state || {};
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shopDetails, setShopDetails] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const handleCardClick = async (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setOpenModal(true);
    
    const userID = localStorage.getItem('userID');

    try {
      const shopResponse = await axios.post(`http://localhost:3001/shop`, {
        shopID: product.shopID,
      });
      setShopDetails(shopResponse.data.shop);

      const favoriteResponse = await axios.post(`http://localhost:3001/checkFavorite`, {
        userID,
        productID: product._id,
      });

      setIsFavorite(favoriteResponse.data.isFavorite);
      const cartResponse = await axios.post(`http://localhost:3001/checkInCart`, {
        userID,
        productID: product._id,
      });

      setIsInCart(cartResponse.data.isInCart);

    } catch (err) {
      console.error("Error occurred while fetching data:", err);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setShopDetails(null);
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

  const handleToggleFavorite = async () => {
    const userID = localStorage.getItem('userID');
    const productID = selectedProduct?._id;
    
    if (!userID || !productID) {
      console.error('User ID or Product ID is missing.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/favorite', {
        userID,
        productID,
        productName: selectedProduct?.productName,
      });

      if (response.status === 200 || response.status === 201) {
        setIsFavorite((prev) => !prev);
        console.log(response.data.message);
      } else {
        console.error('Failed to toggle favorite product:', response.data.error);
      }
    } catch (error) {
      console.error('Error toggling favorite product:', error);
    }
  };

  const handleAddToCart = async () => {
    const userID = localStorage.getItem('userID');
    const productID = selectedProduct?._id;
    console.log('selectedProduct:', selectedProduct)

    if (!userID || !productID) {
      console.error('User ID or Product ID is missing.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/addToCart', {
        userID,
        productID,
        // Send all other necessary data from the modal
        productName: selectedProduct.productName,
        category: selectedProduct.category,
        price: selectedProduct.price,
        images: selectedProduct.images,
        shopName: shopDetails.shopName,
        address: shopDetails.city
        // Add any other necessary fields
      });

      if (response.status === 200 || response.status === 201) {
        // Set state to indicate the product has been added to the cart
        setIsInCart(true);
        console.log('Product added to cart:', response.data.message);
      } else {
        console.error('Failed to add product to cart:', response.data.error);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <Container sx={{ padding: '20px', backgroundColor: '#F9EBA8' }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        Search Results
      </Typography>
      {searchResults && searchResults.length > 0 ? (
        <Grid container spacing={2}>
          {searchResults.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card
                sx={{
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                  transition: "transform 0.3s ease",
                  borderRadius: "10px",
                }}
                onClick={() => handleCardClick(product)} // Trigger modal on click
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:3001/uploads/${product.images[0]}`}
                  alt={product.productName}
                />
                <CardContent style={{ backgroundColor: '#ffc107' }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: ${product.price}
                  </Typography>
                  <Chip
                    label={product.category}
                    sx={{
                      mt: 1,
                      backgroundColor: "#5C3A2A",
                      color: "#FFFFFF",
                      "&:hover": { backgroundColor: "#B86B14" },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" align="center" sx={{ width: "100%" }}>
          No results found
        </Typography>
      )}

      {/* Modal for product details */}
      {selectedProduct && (
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            },
          }}
        >
          <Fade in={openModal}>
            <Box
              sx={{
                bgcolor: "#F9EBA8",
                boxShadow: 24,
                p: 4,
                maxWidth: 600,
                mx: "auto",
                my: "10%",
                outline: "none",
                borderRadius: "10px",
                position: "relative",
                border: "2px solid #5C3A2A",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    color: "#5C3A2A",
                    fontWeight: "bold",
                  }}
                >
                  {selectedProduct.productName}
                </Typography>
                <IconButton onClick={handleToggleFavorite}>
                  {isFavorite ? (
                    <Favorite sx={{ color: "red" }} />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
                <IconButton onClick={handleAddToCart}>
                  {isInCart ? (
                    <CheckCircle sx={{ color: "green" }} />
                  ) : (
                    <AddShoppingCart />
                  )}
                </IconButton>
              </Box>
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                  width: "100%",
                  overflow: "hidden",
                  mb: 2,
                }}
              >
                <IconButton
                  onClick={handlePrevImage}
                  sx={{
                    position: "absolute",
                    left: 0,
                    zIndex: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  <ArrowBackIos />
                </IconButton>
                <img
                  src={`http://localhost:3001/uploads/${selectedProduct.images[currentImageIndex]}`}
                  alt={selectedProduct.productName}
                  style={{
                    height: "100%",
                    width: "auto",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: "absolute",
                    right: 0,
                    zIndex: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  <ArrowForwardIos />
                </IconButton>
              </Box>
              <Typography variant="h6">Shop Details</Typography>
              {shopDetails ? (
                <Box>
                  <Typography variant="body1">
                    <strong>Name:</strong> {shopDetails.shopName}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Address:</strong> {shopDetails.city}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1">Loading shop details...</Typography>
              )}
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Price:</strong> ${selectedProduct.price}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Category:</strong> {selectedProduct.category}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseModal}
                sx={{ mt: 3 }}
              >
                Close
              </Button>
            </Box>
          </Fade>
        </Modal>
      )}
    </Container>
  );
};

export default SearchResults;
