import React from 'react';
import { Box, Menu, MenuItem, Typography, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import OrderCard from './OrderCard';

function OrderManagement({
    orderFilter,
    handleFilterChange,
    filteredOrders,
    handleOrderMenuClick,
    handleStatusChange,
    anchorEl,
    handleMenuClose
}) {
    return (
        <Stack 
            spacing={2} 
            sx={{ 
                height: 'calc(100vh - 100px)', 
                overflowY: 'auto',
                padding: 2,
                alignItems: 'center'
            }}
        >
            <Box sx={{ 
                width: '100%', 
                maxWidth: '1200px',
                display: 'flex',
                justifyContent: 'center',
                mb: 3
            }}>
                <Box sx={{
                    backgroundColor: 'white',
                    padding: 2,
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FilterListIcon sx={{ color: '#5D4037' }} />
                        <ToggleButtonGroup
                            value={orderFilter}
                            exclusive
                            onChange={handleFilterChange}
                            aria-label="order filter"
                            sx={{
                                '& .MuiToggleButton-root': {
                                    color: '#5D4037',
                                    borderColor: '#5D4037',
                                    '&.Mui-selected': {
                                        backgroundColor: '#5D4037',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#4E342E',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: '#FFF3E0',
                                    },
                                },
                            }}
                        >
                            <ToggleButton value="All">All Orders</ToggleButton>
                            <ToggleButton value="Pending">Pending</ToggleButton>
                            <ToggleButton value="In Progress">In Progress</ToggleButton>
                            <ToggleButton value="Delivered">Delivered</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3,
                justifyContent: 'center',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {filteredOrders.length === 0 ? (
                    <Typography variant="h6" sx={{ color: '#5D4037', textAlign: 'center', width: '100%', mt: 4 }}>
                        No {orderFilter !== 'All' ? orderFilter.toLowerCase() : ''} orders found
                    </Typography>
                ) : (
                    filteredOrders.map((order) => (
                        <OrderCard 
                            key={order._id}
                            order={order}
                            onMenuClick={handleOrderMenuClick}
                        />
                    ))
                )}
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleStatusChange('Pending')}>Mark as Pending</MenuItem>
                <MenuItem onClick={() => handleStatusChange('In Progress')}>Mark as In Progress</MenuItem>
                <MenuItem onClick={() => handleStatusChange('Delivered')}>Mark as Delivered</MenuItem>
            </Menu>
        </Stack>
    );
}

export default OrderManagement; 