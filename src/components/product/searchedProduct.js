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
    <Container sx={{ 
      padding: '20px', 
      backgroundColor: '#FFF3E0',  // Changed to warm cream background
      minHeight: '100vh'
    }}>
      <Typography 
        variant="h4" 
        component="h2" 
        align="center" 
        gutterBottom
        sx={{
          color: '#5D4037',  // Warm brown color
          fontFamily: '"Playfair Display", serif',  // More elegant, warm font
          marginBottom: '2rem'
        }}
      >
        Search Results
      </Typography>
      {searchResults && searchResults.length > 0 ? (
        <Grid container spacing={2}>
          {searchResults.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card
                sx={{
                  backgroundColor: '#FFFFFF',
                  "&:hover": {
                    transform: "scale(1.02)",  // Reduced scale for subtlety
                    boxShadow: '0 8px 16px rgba(93, 64, 55, 0.15)',  // Warmer shadow
                  },
                  transition: "transform 0.3s ease",
                  borderRadius: "15px",  // Increased border radius
                  border: '1px solid rgba(93, 64, 55, 0.1)',  // Subtle warm border
                  overflow: 'hidden'
                }}
                onClick={() => handleCardClick(product)} // Trigger modal on click
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images && product.images.length > 0 
                    ? `http://localhost:3001/uploads/${product.images[0]}`
                    : '/path/to/default-image.jpg'
                  }
                  alt={product.productName}
                  sx={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '200px', // Fixed height
                    backgroundColor: '#f5f5f5',
                    aspectRatio: '1', // Forces a square aspect ratio
                  }}
                />
                <CardContent style={{ 
                  backgroundColor: '#FFFFFF',  // Clean white background
                  padding: '1.5rem'
                }}>
                  <Typography 
                    gutterBottom 
                    variant="h5" 
                    component="div"
                    sx={{
                      color: '#3E2723',  // Deep warm brown
                      fontFamily: '"Playfair Display", serif'
                    }}
                  >
                    {product.productName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: '#5D4037' }}  // Warm brown text
                  >
                    Price: ${product.price}
                  </Typography>
                  <Chip
                    label={product.category}
                    sx={{
                      mt: 1,
                      backgroundColor: '#8D6E63',  // Lighter warm brown
                      color: '#FFF3E0',
                      "&:hover": { backgroundColor: '#6D4C41' },
                      borderRadius: '25px',  // More rounded
                      fontFamily: '"Source Sans Pro", sans-serif'
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
                bgcolor: '#FFF3E0',  // Warm background
                boxShadow: '0 8px 32px rgba(93, 64, 55, 0.2)',
                p: 4,
                maxWidth: 600,
                mx: "auto",
                my: "10%",
                outline: "none",
                borderRadius: "20px",  // More rounded corners
                position: "relative",
                border: '1px solid rgba(93, 64, 55, 0.2)',  // Subtle warm border
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
                    color: '#3E2723',  // Deep warm brown
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: "600"
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
                sx={{
                  mt: 3,
                  backgroundColor: '#8D6E63',
                  '&:hover': {
                    backgroundColor: '#6D4C41'
                  },
                  borderRadius: '25px',
                  textTransform: 'none',
                  padding: '8px 24px',
                  fontFamily: '"Source Sans Pro", sans-serif'
                }}
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
