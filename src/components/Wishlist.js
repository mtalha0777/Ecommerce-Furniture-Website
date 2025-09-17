import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient'; 
import toast from 'react-hot-toast';
import { 
    Box, Typography, Container, Grid, Card, CardContent, 
    CardMedia, IconButton, CircularProgress 
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom'; 

const useWindowSize = () => {
    const [size, setSize] = useState({ width: window.innerWidth });
    useEffect(() => {
        const handleResize = () => setSize({ width: window.innerWidth });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const { width } = useWindowSize();
    const isMobile = width < 768;
    const theme = {
        background: '#F5EFE6', 
        containerBackground: '#FFFFFF', 
        primaryText: '#5D4037',
        secondaryText: '#8D6E63', 
        accent: '#8D6E63', 
        lightBorder: '#D7CCC8',
    };
    
    const styles = {
        page: { 
            backgroundColor: theme.background, 
            minHeight: '100vh', 
            padding: isMobile ? '15px' : '30px' 
        },
        card: { 
            backgroundColor: theme.containerBackground, 
            borderRadius: '15px', 
            padding: isMobile ? '20px' : '30px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
        },
        productCard: {
            position: 'relative',
            borderRadius: '10px',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
                transform: 'scale(1.03)'
            }
        },
        title: { 
            color: theme.primaryText, 
            textAlign: 'center', 
            mb: 4, 
            fontWeight: 'bold' 
        },
        emptyWishlistContainer: {
            textAlign: 'center',
            padding: '50px 20px'
        }
    };

  const fetchWishlist = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to view your wishlist.");

            const { data, error } = await supabase
                .from('wishlist_items')
                .select('id, products(*)') 
                .eq('user_id', user.id);

            if (error) throw error;

            setWishlistItems(data || []);

        } catch (error) {
            toast.error(error.message);
            console.error("Error fetching wishlist:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const handleRemoveFromWishlist = async (wishlistItemId) => {
        const toastId = toast.loading('Removing item...');
        try {
            const { error } = await supabase
                .from('wishlist_items')
                .delete()
                .eq('id', wishlistItemId);
            
            if (error) throw error;
            

            setWishlistItems(prevItems => prevItems.filter(item => item.id !== wishlistItemId));
            toast.success('Removed from wishlist', { id: toastId });

        } catch (error) {
            toast.error('Failed to remove item.', { id: toastId });
            console.error("Error removing from wishlist:", error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ ...styles.page, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress sx={{ color: theme.accent }} />
            </Box>
        );
    }

    return (
        <Box sx={styles.page}>
            <Container maxWidth="lg">
                <Typography variant={isMobile ? "h4" : "h3"} sx={styles.title}>
                    My Wishlist
                </Typography>

                {wishlistItems.length === 0 ? (
                    <Card sx={styles.card}>
                        <Box sx={styles.emptyWishlistContainer}>
                            <Typography variant="h6" sx={{ color: theme.primaryText, mb: 2 }}>
                                Your wishlist is empty.
                            </Typography>
                            <Typography sx={{ color: theme.secondaryText }}>
                                Looks like you haven’t added anything to your wishlist yet.
                            </Typography>
                        </Box>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {wishlistItems.map(item => (
                            item.products && (
                                <Grid item xs={12} sm={6} md={4} key={item.id}>
                                    <Card sx={styles.productCard}>
                                        <IconButton
                                            onClick={() => handleRemoveFromWishlist(item.id)}
                                            sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                                        >
                                            <Delete color="error" />
                                        </IconButton>
                                        <Link to={`/product/${item.products.id}`} style={{ textDecoration: 'none' }}>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={item.products.image_urls ? item.products.image_urls[0] : 'https://via.placeholder.com/200'}
                                                alt={item.products.name}
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h6" component="div" sx={{ color: theme.primaryText }}>
                                                    {item.products.name}
                                                </Typography>
                                                <Typography variant="body1" color={theme.secondaryText}>
                                                    Rs {item.products.price}
                                                </Typography>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                </Grid>
                            )
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Wishlist;