import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate import karein
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

// --- MUI & ICONS ---
import { Box, Typography, Container, Grid, Button, IconButton, Chip, CircularProgress, Card, CardMedia } from '@mui/material';
import { Favorite, FavoriteBorder, AddShoppingCart, Storefront } from '@mui/icons-material'; // RemoveShoppingCart import karein

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // useNavigate hook
    const [product, setProduct] = useState(null);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isFavorite, setIsFavorite] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    // --- THEME ---
    const theme = {
        background: '#F5EFE6',
        cardBackground: '#FFFFFF',
        primaryText: '#5D4037',
        secondaryText: '#8D6E63',
        accent: '#8D6E63',
        lightBorder: '#D7CCC8' // lightBorder add karein
    };
    
    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            try {
                // 1. Fetch the product itself
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .eq('id', id)
                    .single();
                
                if (productError || !productData) throw new Error("Product not found.");
                setProduct(productData);
                setSelectedImage(productData.image_urls?.[0] || '');

                // 2. Fetch the shop details
                const { data: shopData, error: shopError } = await supabase
                    .from('shops')
                    .select('shopName') // Sirf shopName select karein
                    .eq('id', productData.shop_id)
                    .single();

                if (shopError) throw new Error("Could not find shop information.");
                setShop(shopData);
                
                // 3. Check user's status
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const [wishlistRes, cartRes] = await Promise.all([
                        supabase.from('wishlist_items').select('id').match({ user_id: user.id, product_id: id }).single(),
                        supabase.from('cart_items').select('id').match({ user_id: user.id, product_id: id }).single()
                    ]);
                    setIsFavorite(!!wishlistRes.data);
                    setIsInCart(!!cartRes.data);
                }

            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    // --- MUKAMMAL ACTION HANDLERS ---
    const handleToggleWishlist = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error("Please login to manage your wishlist.");

        try {
            if (isFavorite) {
                const { error } = await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: id });
                if (error) throw error;
                setIsFavorite(false);
                toast.success("Removed from wishlist");
            } else {
                const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: id });
                if (error) throw error;
                setIsFavorite(true);
                toast.success("Added to wishlist");
            }
        } catch (err) {
            toast.error("Could not update wishlist.");
        }
    };

    const handleToggleCart = async () => {
        if (isInCart) {
            navigate('/cart'); // Agar pehle se cart mein hai, toh cart page par le jao
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error("Please login to add items to your cart.");
        
        const toastId = toast.loading("Adding to cart...");
        try {
            const { error } = await supabase.from('cart_items').insert({ user_id: user.id, product_id: id });
            if (error) throw error;
            setIsInCart(true);
            toast.success("Added to cart", { id: toastId });
        } catch (err) {
            toast.error("Could not add to cart.", { id: toastId });
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: theme.background }}><CircularProgress sx={{color: theme.accent}} /></Box>;
    if (error) return <Typography sx={{ textAlign: 'center', mt: 5, color: 'red' }}>{error}</Typography>;
    if (!product) return <Typography>Product not found.</Typography>;

    return (
        <Box sx={{ backgroundColor: theme.background, minHeight: '100vh', py: 5 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Image Gallery */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: '15px', overflow: 'hidden' }}>
                            <CardMedia
                                component="img"
                                image={selectedImage || 'https://placehold.co/600x450/F5EFE6/5D4037?text=No+Image'}
                                sx={{ height: 450, objectFit: 'cover' }}
                            />
                        </Card>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            {product.image_urls?.map((img, index) => (
                                <Card key={index} sx={{ cursor: 'pointer', border: selectedImage === img ? `3px solid ${theme.accent}` : `3px solid transparent`, borderRadius: '8px', overflow: 'hidden' }} onClick={() => setSelectedImage(img)}>
                                    <CardMedia component="img" image={img} sx={{ width: 80, height: 80, objectFit: 'cover' }} />
                                </Card>
                            ))}
                        </Box>
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Chip label={product.categories?.name || 'Uncategorized'} sx={{ backgroundColor: theme.accent, color: 'white', alignSelf: 'flex-start', mb: 2, fontWeight: 'bold' }} />
                            <Typography variant="h3" component="h1" gutterBottom sx={{ color: theme.primaryText, fontFamily: "'Playfair Display', serif" }}>
                                {product.name}
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme.secondaryText, mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                                {product.description}
                            </Typography>
                            <Typography variant="h4" sx={{ color: theme.primaryText, fontWeight: 'bold', mb: 3 }}>
                                Rs {product.price}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                                <Button 
                                    variant="contained" 
                                    startIcon={isInCart ? null : <AddShoppingCart />} 
                                    onClick={handleToggleCart} 
                                    sx={{ 
                                        backgroundColor: theme.accent, 
                                        flexGrow: 1, py: 1.5, 
                                        fontSize: '1.1rem', 
                                        '&:hover': { backgroundColor: theme.primaryText }
                                    }}
                                >
                                    {isInCart ? "Go to Cart" : "Add to Cart"}
                                </Button>
                                <IconButton onClick={handleToggleWishlist} sx={{ border: `1px solid ${theme.primaryText}` }}>
                                    {isFavorite ? <Favorite sx={{ color: 'red' }} /> : <FavoriteBorder sx={{ color: theme.primaryText }}/>}
                                </IconButton>
                            </Box>
                            
                            {shop && (
                                <Card variant="outlined" sx={{ mt: 'auto', p: 2, borderRadius: '10px', backgroundColor: theme.cardBackground }}>
                                    <Typography sx={{ color: theme.secondaryText, mb: 1 }}>Shop Name:</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Storefront sx={{ color: theme.accent }}/>
                                        <Typography variant="h6" sx={{ color: theme.primaryText }}>{shop.shopName}</Typography>
                                    </Box>
                                </Card>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ProductDetail;