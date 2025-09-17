import React, { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Divider,
  IconButton,
  FormLabel,
  CircularProgress,
} from "@mui/material";
import { Delete, CheckCircle, ShoppingCart } from "@mui/icons-material";
import toast from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
};

function CheckoutForm({ totalAmount, handleSubmit, orderCompleted }) {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    postalCode: "",
    phoneNumber: "",
    paymentMethod: "card",
  });

  const theme = {
    accent: "#8D6E63",
    primaryText: "#5D4037",
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    if (
      !formData.name ||
      !formData.address ||
      !formData.postalCode ||
      !formData.phoneNumber
    ) {
      setError("Please fill in all required shipping details.");
      setProcessing(false);
      return;
    }

    try {
      if (!stripe || !elements) {
        setError("Stripe has not loaded yet. Please wait a moment.");
        setProcessing(false);
        return;
      }

      const { data, error: funcError } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: { amount: Math.round(totalAmount * 10) },
        }
      );
       if (funcError) {
        console.error("Edge Function Error Details:", funcError);
        throw new Error(`Server Error: ${funcError.context?.msg || funcError.message}`);
      }
      
      if (!data || !data.clientSecret) {
        throw new Error("Could not get a valid payment key from the server.");
      }
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: formData.name },
        },
      });

      if (result.error) throw new Error(result.error.message);

      await handleSubmit({
        ...formData,
        paymentMethod: "card",
        paymentIntentID: result.paymentIntent.id,
        paymentStatus: "paid",
        paymentDate: new Date().toISOString(),
      });
      
      setSuccess(true);
      // Notify parent component that order is completed
      orderCompleted();
      
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          p: 3,
          backgroundColor: "#d4edda",
          borderRadius: "8px",
          textAlign: "center",
          border: "1px solid #c3e6cb"
        }}
      >
        <CheckCircle sx={{ color: "#28a745", fontSize: 48, mb: 2 }} />
        <Typography variant="h6" sx={{ color: "#155724", mb: 1 }}>
          Payment Successful! 🎉
        </Typography>
        <Typography sx={{ color: "#155724", mb: 2 }}>
          Your order has been placed successfully.
        </Typography>
        <Typography variant="body2" sx={{ color: "#6c757d" }}>
          You will receive a confirmation email shortly.
        </Typography>
      </Box>
    );
  }

  return (
    <form onSubmit={handlePaymentSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Shipping Address"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleFormChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleFormChange}
            required
          />
        </Grid>

        {formData.paymentMethod === "card" && (
          <Grid item xs={12}>
            <FormLabel
              component="legend"
              sx={{ mb: 1, color: theme.primaryText }}
            >
              Card Details
            </FormLabel>
            <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
              <CardElement
                options={{
                  style: { base: { fontSize: "16px", color: "#424770" } },
                }}
              />
            </Box>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={
              processing || (formData.paymentMethod === "card" && !stripe)
            }
            sx={{
              backgroundColor: theme.accent,
              "&:hover": { backgroundColor: theme.primaryText },
              py: 1.5,
            }}
          >
            {processing
              ? "Processing..."
              : formData.paymentMethod === "card"
              ? `Pay Rs ${totalAmount}`
              : "Place Order"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default Cart;

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0); // Store the order total before clearing cart

  const { width } = useWindowSize();
  const isMobile = width < 768;

  // --- THEME & STYLES ---
  const theme = {
    background: "#F5EFE6",
    containerBackground: "#FFFFFF",
    primaryText: "#5D4037",
    secondaryText: "#8D6E63",
    accent: "#8D6E63",
    lightBorder: "#D7CCC8",
  };

  const styles = {
    page: {
      backgroundColor: theme.background,
      minHeight: "100vh",
      padding: isMobile ? "15px" : "30px",
    },
    card: {
      backgroundColor: theme.containerBackground,
      borderRadius: "15px",
      padding: isMobile ? "20px" : "30px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    cartItemCard: {
      display: "flex",
      marginBottom: "15px",
      backgroundColor: theme.containerBackground,
      borderRadius: "10px",
    },
    summaryCard: {
      backgroundColor: theme.containerBackground,
      borderRadius: "15px",
      padding: "25px",
    },
    title: {
      color: theme.primaryText,
      textAlign: "center",
      mb: 4,
      fontWeight: "bold",
    },
  };

  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select("id, products(*, shops(shopName))")
        .eq("user_id", user.id);

      if (error) throw error;

      const formattedCart = data.map((item) => ({
        ...item.products,
        shopName: item.products.shops?.shopName || "N/A",
        cart_item_id: item.id,
      }));

      setCartItems(formattedCart || []);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast.error("Could not load your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const removeFromCart = async (cartItemId) => {
    const toastId = toast.loading("Removing item...");
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);
      if (error) throw error;
      setCartItems((prev) =>
        prev.filter((item) => item.cart_item_id !== cartItemId)
      );
      toast.success("Item removed from cart.", { id: toastId });
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item.", { id: toastId });
    }
  };

  const calculateTotalAmount = () => {
    return (
      cartItems?.reduce((total, item) => total + parseFloat(item.price), 0) || 0
    );
  };

  const handleSubmit = async (formDetails) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("You must be logged in to place an order.");
    
    const {
      name,
      address,
      postalCode,
      phoneNumber,
      paymentMethod,
      paymentIntentID,
      paymentStatus,
      paymentDate
    } = formDetails;

    // Store the order total before clearing cart
    const currentTotal = calculateTotalAmount();
    const currentShipping = 200;
    const currentGrandTotal = currentTotal + currentShipping;
    
    setOrderTotal(currentGrandTotal);

    const orderDetails = {
      name: name,
      address: address,
      postal_code: postalCode,
      phone_number: phoneNumber,
      payment_method: paymentMethod,
      payment_intent_id: paymentIntentID,
      payment_status: paymentStatus,
      payment_date: paymentDate,
      user_id: user.id,
      products: cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        shop_id: item.shop_id
      })),
      total_amount: currentTotal,
      shipping_charges: currentShipping,
      grand_total: currentGrandTotal,
      status: 'pending'
    };

    const toastId = toast.loading("Placing your order...");
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .insert(orderDetails);
      
      if (orderError) {
        console.error("Order insertion error:", orderError);
        throw orderError;
      }

      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      
      if (clearCartError) {
        console.error("Cart clearing error:", clearCartError);
        throw clearCartError;
      }
      
      setCartItems([]);
      toast.success("Order placed successfully!", { id: toastId });
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to place your order.", { id: toastId });
      throw error;
    }
  };

  const handleOrderCompleted = () => {
    setOrderCompleted(true);
  };

  const resetCart = () => {
    setOrderCompleted(false);
    setOrderTotal(0);
    fetchCartItems(); // Refresh cart items
  };

  const totalAmount = calculateTotalAmount();
  const shippingCharges = totalAmount > 0 ? 200 : 0;
  const grandTotal = totalAmount + shippingCharges;

  // Show order success page if order is completed
  if (orderCompleted && cartItems.length === 0) {
    return (
      <Box sx={styles.page}>
        <Container maxWidth="md">
          <Card sx={styles.card}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CheckCircle sx={{ color: "#28a745", fontSize: 80, mb: 3 }} />
              <Typography variant="h4" sx={{ color: theme.primaryText, mb: 2 }}>
                Order Placed Successfully! 🎉
              </Typography>
              <Typography variant="h6" sx={{ color: theme.secondaryText, mb: 1 }}>
                Thank you for your purchase!
              </Typography>
              <Typography sx={{ color: theme.secondaryText, mb: 3 }}>
                Order Total: Rs {orderTotal}
              </Typography>
              <Typography sx={{ color: theme.secondaryText, mb: 4 }}>
                You will receive a confirmation email shortly with your order details.
              </Typography>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={resetCart}
                sx={{
                  backgroundColor: theme.accent,
                  "&:hover": { backgroundColor: theme.primaryText },
                  px: 4,
                  py: 1.5,
                }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.page}>
      <Container maxWidth="lg">
        <Typography variant={isMobile ? "h4" : "h3"} sx={styles.title}>
          Your Shopping Cart
        </Typography>
        <Grid container spacing={isMobile ? 3 : 4}>
          <Grid item xs={12} md={7}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress sx={{ color: theme.accent }} />
              </Box>
            ) : cartItems.length === 0 ? (
              <Card sx={styles.card}>
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <ShoppingCart sx={{ fontSize: 64, color: theme.secondaryText, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: theme.secondaryText, mb: 1 }}>
                    Your cart is empty
                  </Typography>
                  <Typography sx={{ color: theme.secondaryText }}>
                    Add some products to get started!
                  </Typography>
                </Box>
              </Card>
            ) : (
              cartItems.map((item) => (
                <Card key={item.cart_item_id} sx={styles.cartItemCard}>
                  <CardMedia
                    component="img"
                    sx={{ width: isMobile ? 100 : 150, objectFit: "cover" }}
                    image={
                      item.image_urls?.[0] ||
                      "https://placehold.co/150/F5EFE6/5D4037?text=No+Image"
                    }
                    alt={item.name}
                  />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{ color: theme.primaryText }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: theme.secondaryText }}
                      >
                        Rs {item.price}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.secondaryText, mt: 1 }}
                      >
                        Shop: {item.shopName}
                      </Typography>
                    </CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        p: 1,
                        mt: "auto",
                      }}
                    >
                      <IconButton
                        onClick={() => removeFromCart(item.cart_item_id)}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))
            )}
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={styles.summaryCard}>
              <Typography
                variant="h5"
                sx={{ color: theme.primaryText, mb: 2, fontWeight: "bold" }}
              >
                Cart Summary
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ color: theme.secondaryText }}>
                  Subtotal:
                </Typography>
                <Typography sx={{ color: theme.primaryText }}>
                  Rs {totalAmount}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography sx={{ color: theme.secondaryText }}>
                  Shipping:
                </Typography>
                <Typography sx={{ color: theme.primaryText }}>
                  Rs {shippingCharges}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Typography variant="h6" sx={{ color: theme.primaryText }}>
                  Grand Total:
                </Typography>
                <Typography variant="h6" sx={{ color: theme.primaryText }}>
                  Rs {grandTotal}
                </Typography>
              </Box>
              
              {cartItems.length > 0 && (
                <>
                  <Divider sx={{ mb: 3 }} />
                  <Typography
                    variant="h6"
                    sx={{ color: theme.primaryText, mb: 2, fontWeight: "bold" }}
                  >
                    Shipping & Payment
                  </Typography>
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      totalAmount={grandTotal}
                      handleSubmit={handleSubmit}
                      orderCompleted={handleOrderCompleted}
                    />
                  </Elements>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}