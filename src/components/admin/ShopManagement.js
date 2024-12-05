import React, { useState } from 'react';
import { 
    Box, Card, CardContent, Avatar, Typography, Grid, Chip, 
    Dialog, DialogTitle, DialogContent, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function ShopManagement({ shops }) {
    const [selectedShop, setSelectedShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const authToken = sessionStorage.getItem('authToken');

    const handleShopClick = async (shop) => {
        try {
            const response = await axios.post('http://localhost:3001/productsByShop', 
                { shopID: shop._id },
                { headers: { 'Authorization': `Bearer ${authToken}` }}
            );
            setProducts(response.data.products);
            setSelectedShop(shop);
            setOpen(true);
        } catch (error) {
            console.error('Error fetching shop products:', error);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedShop(null);
        setProducts([]);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete('http://localhost:3001/deleteProduct', {
                headers: { 'Authorization': `Bearer ${authToken}` },
                data: { id: productId }
            });
            // Update products list after deletion
            setProducts(products.filter(product => product._id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
                {shops?.map((shop) => (
                    <Grid item xs={12} md={6} key={shop._id}>
                        <Card 
                            sx={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                                    cursor: 'pointer'
                                },
                            }}
                            onClick={() => handleShopClick(shop)}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar
                                        src={shop.profilePicture ? `http://localhost:3001/${shop.profilePicture}` : null}
                                        sx={{ width: 60, height: 60 }}
                                    >
                                        <StorefrontIcon />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600 }}>
                                        {shop.shopName}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocationOnIcon sx={{ color: '#8D6E63' }} />
                                    <Typography sx={{ color: '#8D6E63' }}>
                                        {shop.street}, {shop.city}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CategoryIcon sx={{ color: '#8D6E63' }} />
                                    <Chip
                                        label={shop.productCategories}
                                        sx={{
                                            backgroundColor: '#FFF3E0',
                                            color: '#5D4037',
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Products Dialog */}
            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, bgcolor: '#FFF3E0' }}>
                    <Typography variant="h6" sx={{ color: '#5D4037' }}>
                        {selectedShop?.shopName} - Products
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: '#5D4037',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#FFF3E0' }}>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell>
                                            <Avatar
                                                src={product.images?.[0] ? `http://localhost:3001/uploads/${product.images[0]}` : null}
                                                variant="square"
                                                sx={{ width: 50, height: 50 }}
                                            />
                                        </TableCell>
                                        <TableCell>{product.productName}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>${product.price}</TableCell>
                                        <TableCell>
                                            <IconButton 
                                                onClick={() => handleDeleteProduct(product._id)}
                                                sx={{ color: '#d32f2f' }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default ShopManagement; 