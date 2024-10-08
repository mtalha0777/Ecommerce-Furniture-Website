import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Grid,
  Box,
  Chip,
  Container,
  Avatar,
  Divider,
  Modal,
  Backdrop,
  Fade,
  IconButton,
  Button,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const ShopsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
  }, [shop,selectedProduct]);

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
        data: { id: selectedProduct._id } // Pass the ID in the request body
      });
      console.log(response.data.message); // Handle success message
      
      // Close the modal after deletion
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
  console.log("selectedProduct", selectedProduct);
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container
      sx={{
        backgroundColor: "#FFF3E0", // Soft yellow for the overall background
        padding: "20px",
        borderRadius: "12px", // Rounded corners for containers
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        align="center"
        gutterBottom
        sx={{
          color: "#5D4037", // Rich brown for the heading
          fontWeight: "bold",
        }}
      >
        Shop Details
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Avatar
          alt={shop.shopName}
          src={`http://localhost:3001/${shop.profilePicture}`}
          sx={{
            width: 80,
            height: 80,
            mr: 2,
            borderRadius: "50%",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Soft shadow for depth on Avatar
          }}
        />
        <Box>
          <Typography
            variant="h5"
            sx={{ color: "#5D4037", fontWeight: "500" }} // Rich brown for subheading
          >
            {shop.shopName}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#5D4037", fontWeight: "lighter" }}
          >
            {shop.city}, {shop.street}
          </Typography>
          <Chip
            label={shop.productCategories}
            sx={{
              backgroundColor: "#FFB300", // Golden yellow accent for chip
              color: "#FFF", // White text for contrast
              mt: 1,
            }}
          />
        </Box>
      </Box>
      <Divider sx={{ mb: 4, borderColor: "#FFB300" }} /> {/* Golden divider */}
      <Typography
        variant="h5"
        component="h3"
        align="center"
        gutterBottom
        sx={{ color: "#5D4037", fontWeight: "500" }}
      >
        Your added Products
      </Typography>
      <Grid container spacing={3}>
        {products.length === 0 ? (
          <Typography
            variant="body1"
            align="center"
            sx={{ width: "100%", color: "#5D4037" }} // Brown for empty state
          >
            No products found for this shop.
          </Typography>
        ) : (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card
                sx={{
                  backgroundColor: "#FFE0B2", // Light yellow for product card background
                  borderRadius: "12px", // Rounded corners
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
                  "&:hover": {
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)", // Slightly stronger shadow on hover
                  },
                }}
                onClick={() => handleCardClick(product)}
              >
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`http://localhost:3001/uploads/${product.images[0]}`}
                    alt={product.productName}
                    sx={{
                      borderRadius: "12px 12px 0 0", // Rounded top corners for image
                      objectFit: "cover",
                    }}
                  />
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{ color: "#5D4037", fontWeight: "bold" }}
                    >
                      {product.productName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#5D4037", fontWeight: "lighter" }}
                    >
                      Price: ${product.price}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#5D4037" }}>
                      Category: {product.category}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      {/* Modal for displaying product details */}
      {selectedProduct && (
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
          }}
        >
          <Fade in={openModal}>
            <Box
              sx={{
                bgcolor: "#FFF3E0", // Soft yellow for modal background
                boxShadow: 24,
                p: 4,
                maxWidth: 600,
                mx: "auto",
                my: "10%",
                outline: "none",
                borderRadius: "12px",
                position: "relative",
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 2,
                  color: "#5D4037",
                  fontWeight: "bold",
                }}
              >
                {selectedProduct.productName}
              </Typography>
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
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                  }}
                >
                  {selectedProduct.images.length > 1 && <ArrowBackIos />}
                </IconButton>
                <CardMedia
                  component="img"
                  sx={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                    border: "1px solid #FFB300", // Accent border around image
                    borderRadius: "8px",
                  }}
                  image={`http://localhost:3001/uploads/${selectedProduct.images[currentImageIndex]}`}
                  alt={`Product Image ${currentImageIndex + 1}`}
                />
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: "absolute",
                    right: 0,
                    zIndex: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                  }}
                >
                  {selectedProduct.images.length > 1 && <ArrowForwardIos />}
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, color: "#5D4037" }}>
                Price: {selectedProduct.price}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "#5D4037" }}>
                Category: {selectedProduct.category}
              </Typography>
              <Button
                onClick={handleCloseModal}
                sx={{
                  mt: 2,
                  backgroundColor: "#FFB300", // Golden yellow for button
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: "#FF9B00", // Slightly darker on hover
                  },
                  borderRadius: "12px", // Rounded corners for buttons
                }}
                variant="contained"
              >
                Close
              </Button>
              <Button
                onClick={deleteProduct}
                sx={{
                  mt: 2,
                  ml: 2,
                  backgroundColor: "red", // Golden yellow for button
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: "gray", // Slightly darker on hover
                  },
                  borderRadius: "12px", // Rounded corners for buttons
                }}
                variant="contained"
              >
                Delete
              </Button>
            </Box>
          </Fade>
        </Modal>
      )}
    </Container>
  );
};

export default ShopsPage;
