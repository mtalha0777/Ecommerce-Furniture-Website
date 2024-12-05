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
  Modal,
  Backdrop,
  Fade,
  Button,
  IconButton,
} from "@mui/material";
import {
  ArrowBackIos,
  ArrowForwardIos,
  FavoriteBorder,
  Favorite,
  AddShoppingCart,
  CheckCircle,
} from "@mui/icons-material";

const ProductList = () => {
  const [products, setProdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shopDetails, setShopDetails] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const location = useLocation();
  const category = location.state?.category;
  const authToken = sessionStorage.getItem('authToken');

  useEffect(() => {
    if (category) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await axios.post(
            `http://localhost:3001/searchedProduct`,
            { searchTerm: category },
            {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            }
          );
          setProdList(response.data.products);
        } catch (err) {
          setError(err.response?.data?.error || "Failed to load products");
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [category]);

  const handleCardClick = async (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setOpenModal(true);

    const userID = localStorage.getItem("userID");

    try {
      const shopResponse = await axios.post(`http://localhost:3001/shop`, {
        shopID: product.shopID,
      },
    
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      setShopDetails(shopResponse.data.shop);

      const favoriteResponse = await axios.post(`http://localhost:3001/checkFavorite`, {
        userID,
        productID: product._id,
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      setIsFavorite(favoriteResponse.data.isFavorite);

      const cartResponse = await axios.post(`http://localhost:3001/checkInCart`, {
        userID,
        productID: product._id,
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
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
    const userID = localStorage.getItem("userID");
    const productID = selectedProduct?._id;

    if (!userID || !productID) {
        console.error("User ID or Product ID is missing.");
        return;
    }

    try {
        const response = await axios.post("http://localhost:3001/favorite", {
            userID,
            productID,
            productName: selectedProduct.productName,
            category: selectedProduct.category,
            price: selectedProduct.price,
            images: selectedProduct.images,
            shopName: shopDetails.shopName,
            address: shopDetails.city
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.status === 200 || response.status === 201) {
            setIsFavorite((prev) => !prev);
        } else {
            console.error("Failed to toggle favorite product:", response.data.error);
        }
    } catch (error) {
        console.error("Error toggling favorite product:", error);
    }
  };

  const handleAddToCart = async () => {
    const userID = localStorage.getItem("userID");
    const productID = selectedProduct?._id;

    if (!userID || !productID) {
      console.error("User ID or Product ID is missing.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/addToCart", {
        userID,
        productID,
        productName: selectedProduct.productName,
        category: selectedProduct.category,
        price: selectedProduct.price,
        images: selectedProduct.images,
        shopName: shopDetails.shopName,
        address: shopDetails.city,
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

      if (response.status === 200 || response.status === 201) {
        setIsInCart(true);
      } else {
        console.error("Failed to add product to cart:", response.data.error);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <Typography
    variant="h4"
    component="h2"
    align="center"
    gutterBottom
    sx={{ color: "#5D4037", padding: "20px" }}
  >
    Products Selling {category}
  </Typography>
    <Container 
      maxWidth="xl"
      boxShadow={3}
      sx={{ 
        background: 'linear-gradient(to right, #FFF3E0, #FFE0B2)',
        padding: "20px",
        minHeight: '100vh'
      }}
    >
      <Grid container spacing={3}>
        {products.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ width: "100%", color: "#5D4037" }}>
            No products found for this category.
          </Typography>
        ) : (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <HoverCard
                product={product}
                onClick={() => handleCardClick(product)}
              />
            </Grid>
          ))
        )}
      </Grid>

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
                bgcolor: "#FFF3E0",
                boxShadow: 24,
                p: 4,
                maxWidth: 600,
                mx: "auto",
                my: "10%",
                outline: "none",
                borderRadius: "10px",
                position: "relative",
                border: "2px solid #5D4037",
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
                    color: "#5D4037",
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
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                  }}
                >
                  <ArrowBackIos />
                </IconButton>
                <CardMedia
                  component="img"
                  sx={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                    border: "1px solid #FFB300",
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
                  <ArrowForwardIos />
                </IconButton>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: "#5D4037",
                  mb: 1,
                  border: "1px solid #FFB300",
                  borderRadius: "5px",
                  padding: "10px",
                }}
              >
                {selectedProduct.description}
              </Typography>
              <Typography variant="h6" component="p" sx={{ color: "#5D4037" }}>
                Price: ${selectedProduct.price.toFixed(2)}
              </Typography>
              <Box
                sx={{
                  borderTop: "2px solid #FFB300",
                  marginTop: "16px",
                  paddingTop: "8px",
                }}
              >
                <Typography variant="subtitle1" sx={{ color: "#5D4037", fontWeight: "bold" }}>
                  Shop Details
                </Typography>
                {shopDetails && (
                  <Typography variant="body2" sx={{ color: "#5D4037" }}>
                    {shopDetails.shopName} | {shopDetails.city}
                  </Typography>
                )}
              </Box>
            </Box>
          </Fade>
        </Modal>
      )}
    </Container>
    </>
  );
};

const HoverCard = ({ product, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: "12px",
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        transition: "transform 0.3s, box-shadow 0.3s",
        backgroundColor: '#FFFFFF',
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: "0 8px 20px rgba(93, 64, 55, 0.2)",
        },
      }}
    >
      <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          height: '250px',
          width: '100%',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <CardMedia
            component="img"
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
            image={`http://localhost:3001/uploads/${product.images[0]}`}
            alt='No Image for this Product'
          />
        </Box>
        <CardContent sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'linear-gradient(to right, #FFF3E0, #FFE0B2)',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          width: '100%',
          alignItems: 'center'
        }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              color: "#5D4037",
              fontSize: '1.1rem',
              fontWeight: 600,
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.productName}
          </Typography>
          <Box>
            <Typography 
              variant="body1" 
              sx={{ 
                color: "#5D4037",
                fontWeight: 500,
                mb: 1
              }}
            >
              ${product.price.toFixed(2)}
            </Typography>
            <Chip
              label={product.category}
              sx={{
                backgroundColor: "#FFB300",
                color: "#fff",
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: "#FFA000"
                }
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductList;
