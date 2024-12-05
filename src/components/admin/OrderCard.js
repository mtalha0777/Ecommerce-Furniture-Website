import React from 'react';
import { Card, CardContent, Box, Typography, IconButton, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';

function OrderCard({ order, onMenuClick }) {
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#FFA726';
            case 'in progress':
                return '#29B6F6';
            case 'delivered':
                return '#66BB6A';
            default:
                return '#757575';
        }
    };

    return (
        <Card 
            sx={{
                width: '100%',
                maxWidth: '500px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                },
                margin: '8px',
                '@media (min-width: 720px)': {
                    width: 'calc(50% - 16px)',
                    flexGrow: 0,
                    flexShrink: 0,
                }
            }}
        >
            <CardContent sx={{ padding: '16px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Order #{order._id.slice(-6)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                            label={order.status}
                            sx={{ 
                                backgroundColor: getStatusColor(order.status),
                                color: 'white',
                                fontWeight: 500
                            }}
                        />
                        <IconButton 
                            onClick={(e) => onMenuClick(e, order)}
                            sx={{
                                color: '#5D4037',
                                '&:hover': { backgroundColor: '#FFF3E0' }
                            }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <InfoRow icon={<PersonIcon />} label="Customer" value={order.name} />
                    <InfoRow icon={<PhoneIcon />} label="Phone" value={order.phoneNumber} />
                    <InfoRow icon={<LocationOnIcon />} label="Address" value={`${order.address}, ${order.postalCode}`} />
                    <InfoRow icon={<PaymentIcon />} label="Payment" value={`${order.paymentMethod} - Rs ${order.grandTotal}`} />
                    <InfoRow 
                        icon={<LocalShippingIcon />} 
                        label="Products" 
                        value={order.products.map(p => p.name).join(', ')} 
                    />
                </Box>
            </CardContent>
        </Card>
    );
}

const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {React.cloneElement(icon, { sx: { color: '#8D6E63', fontSize: 20 } })}
        <Typography sx={{ color: '#5D4037', fontSize: '0.9rem' }}>
            <strong>{label}:</strong> {value}
        </Typography>
    </Box>
);

export default OrderCard; 