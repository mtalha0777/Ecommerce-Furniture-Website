import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripe || !elements) {
            setError("Payment system is not ready. Please try again later.");
            setProcessing(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/create-payment-intent', {
                amount: amount * 100,
            });

            if (!response.data || !response.data.clientSecret) {
                throw new Error("Invalid response from server");
            }

            const { clientSecret } = response.data;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        // Add billing details here if needed
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                // Handle successful payment here
                console.log('Payment successful:', result.paymentIntent);
            }
        } catch (err) {
            if (err.response) {
                setError(`Server error: ${err.response.data.message || err.response.statusText}`);
            } else if (err.request) {
                setError("Unable to reach the server. Please check your internet connection and try again.");
            } else {
                setError(`An error occurred: ${err.message}`);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto p-6 bg-white rounded-lg">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Payment</h1>
                <p className="text-gray-600">
                    Please provide your payment details to finalize your purchase of ${amount}.
                </p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Information
                </label>
                <div className="border rounded-md p-3 bg-white">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center mb-6"
            >
                {processing ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    <>
                        <Lock className="mr-2" size={20} />
                        Pay ${amount}
                    </>
                )}
            </button>

            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Why choose us?</h2>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <ShieldCheck className="text-teal-600 mr-2" size={20} />
                        <span>Secure Payments</span>
                    </div>
                    <div className="flex items-center">
                        <CreditCard className="text-teal-600 mr-2" size={20} />
                        <span>Multiple Payment Options</span>
                    </div>
                    <div className="flex items-center">
                        <Lock className="text-teal-600 mr-2" size={20} />
                        <span>Data Protection</span>
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-500">
                <p>By completing this payment, you agree to our <Link href="#" className="text-teal-600 hover:underline">Terms of Service</Link> and <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a>.</p>
            </div>
        </form>
    );
};

const PaymentComponent = ({ amount }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Elements stripe={stripePromise}>
                <PaymentForm amount={amount} />
            </Elements>
        </div>
    );
};

export default PaymentComponent;