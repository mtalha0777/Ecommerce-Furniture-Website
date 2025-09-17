import React, { useState, useEffect} from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import toast from "react-hot-toast";
import {
  Card, CardContent, CardMedia, Typography, Grid, Box, Container, IconButton, CircularProgress
} from "@mui/material";
import { FavoriteBorder, Favorite, AddShoppingCart, RemoveShoppingCart } from "@mui/icons-material";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State to track user's actions for instant UI feedback
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());
  const [cartProductIds, setCartProductIds] = useState(new Set());
  
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.state?.category;

  const theme = {
      background: '#F5EFE6',
      cardBackground: '#FFFFFF',
      primaryText: '#5D4037',
      secondaryText: '#8D6E63',
      accent: '#8D6E63'
  };

  useEffect(() => {
    if (!category) {
      toast.error("No category selected.");
      navigate("/"); 
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, categories!inner(category_slug)')
          .eq('categories.category_slug', category);

        if (productsError) throw productsError;
        setProducts(productsData || []);

        if (user) {
    
          const [wishlistRes, cartRes] = await Promise.all([
            supabase.from('wishlist_items').select('product_id').eq('user_id', user.id),
            supabase.from('cart_items').select('product_id').eq('user_id', user.id)
          ]);

          if (wishlistRes.error) throw wishlistRes.error;
          if (cartRes.error) throw cartRes.error;
          
          setWishlistProductIds(new Set(wishlistRes.data.map(item => item.product_id)));
          setCartProductIds(new Set(cartRes.data.map(item => item.product_id)));
        }
      } catch (err) {
        setError("Failed to load products. Please try again.");
        toast.error(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, navigate]);



  const handleToggleWishlist = async (e, product) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Please login to add to wishlist.");
    
    const isFavorite = wishlistProductIds.has(product.id);
    const optimisticProductIds = new Set(wishlistProductIds);

    try {
        if (isFavorite) {
            optimisticProductIds.delete(product.id);
            setWishlistProductIds(optimisticProductIds);
            const { error } = await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: product.id });
            if (error) throw error;
            toast.success("Removed from wishlist");
        } else {
            optimisticProductIds.add(product.id);
            setWishlistProductIds(optimisticProductIds);
            const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
            if (error) throw error;
            toast.success("Added to wishlist");
        }
    } catch (err) {
        setWishlistProductIds(new Set(wishlistProductIds)); 
        toast.error("Could not update wishlist.");
    }
  };

  const handleToggleCart = async (e, product) => {
    e.stopPropagation(); 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Please login to add to cart.");

    const inCart = cartProductIds.has(product.id);
    const optimisticCartIds = new Set(cartProductIds);
    
    try {
        if (inCart) {
            optimisticCartIds.delete(product.id);
            setCartProductIds(optimisticCartIds);
            const { error } = await supabase.from('cart_items').delete().match({ user_id: user.id, product_id: product.id });
            if (error) throw error;
            toast.success("Removed from cart");
        } else {
            optimisticCartIds.add(product.id);
            setCartProductIds(optimisticCartIds);
            const { error } = await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id });
            if (error) throw error;
            toast.success("Added to cart");
        }
    } catch (err) {
        setCartProductIds(new Set(cartProductIds)); 
        toast.error("Could not update cart.");
    }
  };

  if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: theme.background }}><CircularProgress sx={{color: theme.accent}} /></Box>;
  }
  if (error) {
      return <Typography sx={{textAlign: 'center', mt: 5, color: 'red'}}>{error}</Typography>;
  }

  return (
    <Box sx={{ backgroundColor: theme.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ color: theme.primaryText, fontFamily: "'Playfair Display', serif" }}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Typography>

        <Grid container spacing={3}>
          {products.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ width: "100%", color: theme.secondaryText, mt: 5 }}>
              No products found for this category.
            </Typography>
          ) : (
            products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  isFavorite={wishlistProductIds.has(product.id)}
                  isInCart={cartProductIds.has(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onToggleCart={handleToggleCart}
                  theme={theme}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
};


const ProductCard = ({ product, isFavorite, isInCart, onToggleWishlist, onToggleCart, theme }) => {
  return (
    <Card sx={{
        height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '15px',
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": { transform: "translateY(-5px)", boxShadow: "0 8px 20px rgba(93, 64, 55, 0.15)" }
    }}>
      <Box sx={{ position: 'relative' }}>
          <IconButton onClick={(e) => onToggleWishlist(e, product)} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.7)' }}>
              {isFavorite ? <Favorite sx={{ color: "red" }} /> : <FavoriteBorder />}
          </IconButton>
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
              <CardMedia
                  component="img"
                  height="250"
                  image={product.image_urls?.[0] || 'https://placehold.co/400x400/F5EFE6/5D4037?text=No+Image'}
                  alt={product.name}
              />
          </Link>
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ color: theme.primaryText, flexGrow: 1 }}>
              {product.name}
          </Typography>
        </Link>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2 }}>
            <Typography variant="h6" sx={{ color: theme.accent, fontWeight: 'bold' }}>
              Rs {product.price}
            </Typography>
            <IconButton onClick={(e) => onToggleCart(e, product)} sx={{ border: `1px solid ${isInCart ? '#4CAF50' : theme.lightBorder}` }}>
                {isInCart ? <RemoveShoppingCart sx={{color: theme.secondaryText}} /> : <AddShoppingCart sx={{color: theme.accent}} />}
            </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductList;