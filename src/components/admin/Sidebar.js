import React from 'react';
import { Drawer, Box, Avatar, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Sidebar({ logo, selectedTab, onTabChange }) {
    const navigate = useNavigate();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', bgcolor: '#3E2723' },
            }}
        >
            <Box 
                sx={{ display: 'flex', justifyContent: 'center', p: 2, cursor: 'pointer' }}
                onClick={() => navigate('/home')}
            >
                <Avatar alt="Logo" src={logo} sx={{ width: 100, height: 100 }} />
            </Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#FFF3E0', fontWeight: 'bold', textAlign: 'center' }}>
                AR Furniture
            </Typography>
            <List>
                {['Manage Users', 'Approve Orders', 'Manage Shops'].map((text) => (
                    <ListItem 
                        button
                        key={text}
                        onClick={() => onTabChange(text)}
                        sx={{ 
                            '&:hover': { bgcolor: '#4E342E' }, 
                            borderTop: '1px solid rgba(255, 243, 224, 0.3)',
                            borderBottom: '1px solid rgba(255, 243, 224, 0.3)',
                            bgcolor: selectedTab === text ? '#4E342E' : 'transparent'
                        }}
                    >
                        <ListItemText primary={text} sx={{ color: '#FFF3E0', fontWeight: 'bold' }} />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}

export default Sidebar; 