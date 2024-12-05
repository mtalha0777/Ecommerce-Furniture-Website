import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Grid,
  Box,
  Container,
  Avatar,
  Divider,
  Modal,
  Backdrop,
  Fade,
  IconButton,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Edit, AddAPhoto } from "@mui/icons-material";

const UserProfile = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: '',
    phoneNumber: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const authToken = sessionStorage.getItem('authToken');
  const userID = localStorage.getItem('userID');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/user/${userID}`,
          {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }
        );
        setEditedUser({
          name: response.data.name || '',
          phoneNumber: response.data.phoneNumber || '',
          profilePicture: response.data.profilePicture || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUpdateMessage({ type: 'error', text: 'Failed to load user data' });
      }
    };

    if (userID && authToken) {
      fetchUserData();
    }
  }, [userID, authToken]);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3001/favorites/${userID}`,
          {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }
        );
        setFavorites(response.data);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        setError(err.response?.data?.error || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    if (userID && authToken) {
      fetchFavorites();
    }
  }, [userID, authToken]);

  const handleEditSave = async () => {
    try {
      setIsUploading(true);
      const response = await axios.put(
        `http://localhost:3001/user/${userID}`,
        {
          name: editedUser.name,
          phoneNumber: editedUser.phoneNumber,
        },
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      
      setIsEditing(false);
      setUpdateMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setUpdateMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setIsUploading(false);
    }
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
      
      const response = await axios.put(
        `http://localhost:3001/user/${userID}/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      setUpdateMessage({ type: 'success', text: 'Profile picture updated successfully' });
    } catch (error) {
      setUpdateMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile picture' 
      });
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <>
      <Typography variant="h4" component="h2" align="center" gutterBottom
        sx={{ color: "#5D4037", fontWeight: "bold", padding: "20px" }}>
        User Profile
      </Typography>
      <Container sx={{ backgroundColor: "#FFF3E0", padding: "20px", borderRadius: "12px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
        {/* User Profile Section */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, position: 'relative' }}>
          {/* Profile Picture Section */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              alt={editedUser.name}
              src={`http://localhost:3001/${editedUser.profilePicture}`}
              sx={{ width: 80, height: 80, mr: 2 }}
            />
            {isEditing && (
              <IconButton onClick={() => fileInputRef.current.click()}
                sx={{ position: 'absolute', bottom: -10, right: 10, backgroundColor: '#FFB300' }}>
                <AddAPhoto sx={{ fontSize: 20, color: 'white' }} />
              </IconButton>
            )}
            <input type="file" ref={fileInputRef} onChange={handleProfilePictureChange}
              style={{ display: 'none' }} accept="image/*" />
          </Box>

          {/* User Details Section */}
          {!isEditing ? (
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ color: "#5D4037", fontWeight: "500" }}>
                {editedUser.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#5D4037" }}>
                {editedUser.phoneNumber}
              </Typography>
              <IconButton onClick={() => setIsEditing(true)} sx={{ color: "#FFB300", mt: 1 }}>
                <Edit />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ flex: 1, ml: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                sx={{ mb: 2, backgroundColor: "#FFE0B2" }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={editedUser.phoneNumber}
                onChange={(e) => setEditedUser({ ...editedUser, phoneNumber: e.target.value })}
                sx={{ mb: 2, backgroundColor: "#FFE0B2" }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleEditSave}
                  disabled={isUploading}
                  sx={{ backgroundColor: "#FFB300", '&:hover': { backgroundColor: "#FFA000" } }}
                >
                  {isUploading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  sx={{ color: "#5D4037", borderColor: "#5D4037" }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Favorites Section */}
        <Divider sx={{ mb: 4, borderColor: "#FFB300" }} />
        <Typography variant="h5" component="h3" align="center" gutterBottom
          sx={{ color: "#5D4037", fontWeight: "500" }}>
          Your Favorites
        </Typography>
        
        {/* Favorites Grid */}
        <Grid container spacing={3}>
          {favorites?.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ width: "100%", color: "#5D4037", padding: "120px" }}>
              No favorites added yet.
            </Typography>
          ) : (
            favorites?.map((favorite) => (
              <Grid item xs={12} sm={6} md={4} key={favorite._id}>
                <Card sx={{ 
                  maxWidth: 345, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 3
                  }
                }}>
                  <CardActionArea sx={{ flexGrow: 1 }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={favorite.product?.images?.[0] 
                        ? `http://localhost:3001/uploads/${favorite.product.images[0]}`
                        : '/placeholder-image.jpg'} // Add a placeholder image to your public folder
                      alt={favorite.product?.productName || favorite.productName}
                      sx={{
                        objectFit: 'cover',
                        backgroundColor: '#f5f5f5'
                      }}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div" sx={{ 
                        color: '#5D4037',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {favorite.product?.productName || favorite.productName}
                      </Typography>
                      {favorite.product?.price && (
                        <Typography variant="body2" sx={{ color: '#FF8F00', fontWeight: 500 }}>
                          ${favorite.product.price.toLocaleString()}
                        </Typography>
                      )}
                      {favorite.product?.category && (
                        <Typography variant="body2" color="text.secondary">
                          Category: {favorite.product.category}
                        </Typography>
                      )}
                      {favorite.product?.shopName && (
                        <Typography variant="body2" color="text.secondary">
                          Shop: {favorite.product.shopName}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Modal, Loading, and Message components similar to ShopsPage */}
        {updateMessage.text && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: updateMessage.type === 'success' ? '#E8F5E9' : '#FFEBEE',
            borderRadius: '4px'
          }}>
            <Typography color={updateMessage.type === 'success' ? 'success' : 'error'}>
              {updateMessage.text}
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default UserProfile; 