import React from 'react';
import { Box, Typography, Avatar, IconButton, TextField, Button, Chip } from '@mui/material';
import { AddAPhoto, Edit } from '@mui/icons-material';

const ShopDetails = ({ shop, isEditing, editedShop, setEditedShop, handleEditClick, handleEditSave, fileInputRef, handleProfilePictureChange, setIsEditing }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 4, position: 'relative' }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar
          alt={shop.shopName}
          src={`http://localhost:3001/${shop.profilePicture}`}
          sx={{
            width: 80,
            height: 80,
            mr: 2,
            borderRadius: "50%",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        />
        {isEditing && (
          <IconButton
            onClick={() => fileInputRef.current.click()}
            sx={{
              position: 'absolute',
              bottom: -10,
              right: 10,
              backgroundColor: '#FFB300',
              padding: '8px',
              '&:hover': {
                backgroundColor: '#FF9B00',
              },
            }}
          >
            <AddAPhoto sx={{ fontSize: 20, color: 'white' }} />
          </IconButton>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfilePictureChange}
          style={{ display: 'none' }}
          accept="image/*"
        />
      </Box>
      {!isEditing ? (
        <>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{ color: "#5D4037", fontWeight: "500" }}
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
                backgroundColor: "#FFB300",
                color: "#FFF",
                mt: 1,
              }}
            />
          </Box>
          <IconButton 
            onClick={handleEditClick}
            sx={{
              backgroundColor: "#FFB300",
              color: "white",
              "&:hover": { backgroundColor: "#FF9B00" },
              ml: 2
            }}
          >
            <Edit />
          </IconButton>
        </>
      ) : (
        <Box sx={{ flex: 1, ml: 2 }}>
          <TextField
            fullWidth
            label="Shop Name"
            value={editedShop.shopName}
            onChange={(e) => setEditedShop({ ...editedShop, shopName: e.target.value })}
            sx={{ mb: 2, backgroundColor: "#FFE0B2" }}
          />
          <TextField
            fullWidth
            label="City"
            value={editedShop.city}
            onChange={(e) => setEditedShop({ ...editedShop, city: e.target.value })}
            sx={{ mb: 2, backgroundColor: "#FFE0B2" }}
          />
          <TextField
            fullWidth
            label="Street"
            value={editedShop.street}
            onChange={(e) => setEditedShop({ ...editedShop, street: e.target.value })}
            sx={{ mb: 2, backgroundColor: "#FFE0B2" }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outlined"
              sx={{
                color: "#5D4037",
                borderColor: "#5D4037",
                "&:hover": { borderColor: "#FFB300", color: "#FFB300" }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              variant="contained"
              sx={{
                backgroundColor: "#FFB300",
                color: "white",
                "&:hover": { backgroundColor: "#FF9B00" }
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ShopDetails; 