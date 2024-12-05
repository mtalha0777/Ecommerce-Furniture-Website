import React from 'react';
import { Box, Menu, MenuItem, Typography, Stack, TextField, InputAdornment, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UserCard from './UserCard';

function UserManagement({ 
    users,
    loading,
    hasMore,
    searchQuery,
    setSearchQuery,
    filteredUsers,
    handleScroll,
    handleMenuClick,
    handleMenuClose,
    handleMakeAdmin,
    handleRemoveUser,
    anchorEl,
    selectedUser
}) {
    return (
        <Stack 
            spacing={2} 
            sx={{ 
                height: 'calc(100vh - 100px)', 
                overflowY: 'auto',
                padding: 2,
                alignItems: 'center',
                '& > div.MuiBox-root': {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '1200px'
                }
            }}
            onScroll={handleScroll}
        >
            <TextField
                sx={{ width: '100%', maxWidth: '600px', mb: 3 }}
                variant="outlined"
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#5D4037' }} />
                        </InputAdornment>
                    ),
                    sx: {
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#5D4037',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3E2723',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3E2723',
                        },
                    }
                }}
            />
            
            <Box>
                {filteredUsers.map((user) => (
                    <UserCard 
                        key={user._id}
                        user={user}
                        onMenuClick={handleMenuClick}
                    />
                ))}
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress sx={{ color: '#5D4037' }} />
                </Box>
            )}

            {!hasMore && users.length > 0 && (
                <Typography textAlign="center" color="textSecondary" sx={{ p: 2 }}>
                    No more users to load
                </Typography>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {selectedUser?.role !== '3' && (
                    <MenuItem onClick={handleMakeAdmin}>Make Admin</MenuItem>
                )}
                <MenuItem onClick={handleRemoveUser}>Remove User</MenuItem>
            </Menu>
        </Stack>
    );
}

export default UserManagement; 