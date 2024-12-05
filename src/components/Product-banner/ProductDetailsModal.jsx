// ProductDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, CardMedia, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

const ProductDetailsModal = ({ open, onClose, product }) => {
    const [shopDetails, setShopDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && product) {
            const fetchShopDetails = async () => {
                setLoading(true);
                try {
                    const response = await axios.post('http://localhost:3001/shop', { shopID: product.shop });
                    setShopDetails(response.data);
                } catch (err) {
                    setError(err.response?.data?.error || 'Failed to fetch shop details');
                } finally {
                    setLoading(false);
                }
            };

            fetchShopDetails();
        }
    }, [open, product]);

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" gutterBottom>
                    {product.productName}
                </Typography>

                <Box>
                    {product.images.map((image, index) => (
                        <CardMedia
                            key={index}
                            component="img"
                            height="140"
                            image={`http://localhost:3001/uploads/${image}`}
                            alt={product.productName}
                            sx={{ marginBottom: 2 }}
                        />
                    ))}
                </Box>

                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    shopDetails && (
                        <Box mt={2}>
                            <Typography variant="body1">Shop Name: {shopDetails.name}</Typography>
                            <Typography variant="body2">Shop Address: {shopDetails.address}</Typography>
                        </Box>
                    )
                )}

                <Button onClick={onClose} sx={{ marginTop: 2 }} variant="contained" color="primary">
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default ProductDetailsModal;
