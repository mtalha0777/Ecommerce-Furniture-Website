import React from 'react';
import { Modal, Backdrop, Fade, Box, Typography, IconButton, Button, TextField, CardMedia } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, AddAPhoto, Delete } from '@mui/icons-material';

const ProductModal = ({ openModal, handleCloseModal, selectedProduct, currentImageIndex, handlePrevImage, handleNextImage, handleEditProduct, deleteProduct, isEditingProduct, editedProduct, setEditedProduct, handleDeleteImage, productFileInputRef, handleProductImageUpload, handleSaveProduct, setIsEditingProduct }) => {
  return (
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
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 600,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            overflow: 'auto'
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
              {selectedProduct.images.length > 1 && <ArrowForwardIos />}
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: "#5D4037" }}>
            Price: {selectedProduct.price}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#5D4037" }}>
            Category: {selectedProduct.category}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              onClick={handleCloseModal}
              sx={{
                backgroundColor: "#FFB300",
                color: "white",
                "&:hover": { backgroundColor: "#FF9B00" }
              }}
              variant="contained"
            >
              Close
            </Button>
            <Box>
              <Button
                onClick={handleEditProduct}
                sx={{
                  mx: 1,
                  backgroundColor: "#4CAF50",
                  color: "white",
                  "&:hover": { backgroundColor: "#45a049" }
                }}
                variant="contained"
              >
                Edit
              </Button>
              <Button
                onClick={deleteProduct}
                sx={{
                  backgroundColor: "#f44336",
                  color: "white",
                  "&:hover": { backgroundColor: "#d32f2f" }
                }}
                variant="contained"
              >
                Delete
              </Button>
            </Box>
          </Box>
          {isEditingProduct ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={editedProduct.productName}
                onChange={(e) => setEditedProduct({ ...editedProduct, productName: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={editedProduct.price}
                onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Category"
                value={editedProduct.category}
                onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {editedProduct.images.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img
                      src={`http://localhost:3001/uploads/${image}`}
                      alt={`Product ${index + 1}`}
                      style={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                    <IconButton
                      onClick={() => handleDeleteImage(index)}
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        backgroundColor: '#f44336',
                        color: 'white',
                        '&:hover': { backgroundColor: '#d32f2f' }
                      }}
                    >
                      <Delete sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              
              <Button
                onClick={() => productFileInputRef.current.click()}
                variant="contained"
                startIcon={<AddAPhoto />}
                sx={{ mb: 2 }}
              >
                Add Images
              </Button>
              <input
                type="file"
                multiple
                ref={productFileInputRef}
                onChange={handleProductImageUpload}
                style={{ display: 'none' }}
                accept="image/*"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={() => setIsEditingProduct(false)}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProduct}
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Fade>
    </Modal>
  );
};

export default ProductModal; 