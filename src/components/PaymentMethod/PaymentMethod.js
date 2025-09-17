import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { Box, Typography, Container, Button, CircularProgress } from '@mui/material';
import { Lock, CreditCard, Security } from '@mui/icons-material'; 

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);


const theme = {
    background: '#F5EFE6',
    containerBackground: '#FFFFFF',
    primaryText: '#5D4037',
    secondaryText: '#8D6E63',
    accent: '#8D6E63',
    lightBorder: '#ddd' 
};

const PaymentForm = ({ amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripe || !elements) {
            setError("Payment system is not ready. Please try again later.");
            setProcessing(false);
            return;
        }

        if (!amount || isNaN(amount)) {  
            setError("Invalid amount provided.");
            setProcessing(false);
            return;
        }

        try {
 
            const { data, error: funcError } = await supabase.functions.invoke('create-payment-intent', {
                body: { amount: Math.round(amount * 100) },
            });

            if (funcError) throw new Error(funcError.message);
            if (!data || !data.clientSecret) throw new Error("Invalid response from server");

            const { clientSecret } = data;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                console.log('Payment successful:', result.paymentIntent);
                setSuccess(true);
  
            }
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <Box sx={{ textAlign: 'center', p: 4, backgroundColor: '#d4edda', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ color: '#155724' }}>Payment Successful!</Typography>
                <Typography sx={{ mt: 1, color: '#155724' }}>Your order has been confirmed.</Typography>
                <Button component={Link} to="/" sx={{ mt: 2, color: theme.accent }}>
                    Continue Shopping
                </Button>
            </Box>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: theme.primaryText, fontWeight: 'bold' }}>
                    Complete Your Payment
                </Typography>
                <Typography sx={{ color: theme.secondaryText }}>
                    Finalize your purchase of Rs {amount}.
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography sx={{ color: theme.primaryText, mb: 1, fontWeight: 'medium' }}>
                    Card Information
                </Typography>
                <Box sx={{ border: `1px solid ${theme.lightBorder}`, borderRadius: 1, p: 2 }}>
                    <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770' } } }} />
                </Box>
            </Box>

            {error && (
                <Typography sx={{ color: 'red', mb: 2 }}>{error}</Typography>
            )}

            <Button
                type="submit"
                disabled={!stripe || processing}
                fullWidth
                variant="contained"
                startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                sx={{
                    py: 1.5, backgroundColor: theme.accent,
                    '&:hover': { backgroundColor: theme.primaryText },
                }}
            >
                {processing ? "Processing..." : `Pay Rs ${amount}`}
            </Button>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ color: theme.primaryText, mb: 2 }}>Why choose us?</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.secondaryText }}>
                        <Security /> Secure Payments
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.secondaryText }}>
                        <CreditCard /> Multiple Payment Options
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.secondaryText }}>
                        <Lock /> Data Protection
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

const PaymentMethod = ({ amount }) => {
    return (
        <Box sx={{
            minHeight: '100vh', backgroundColor: theme.background, display: 'flex',
            alignItems: 'center', justifyContent: 'center', p: 2
        }}>
            <Container maxWidth="sm" sx={{
                p: 4, backgroundColor: theme.containerBackground,
                borderRadius: 3, boxShadow: 3
            }}>
                <Elements stripe={stripePromise}>
                    <PaymentForm amount={amount} />
                </Elements>
            </Container>
        </Box>
    );
};

export default PaymentMethod;
