import React from 'react';
import { Card, CardContent, Box, Avatar, Typography, IconButton } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function UserCard({ user, onMenuClick }) {
    return (
        <Card 
            sx={{
                width: '100%',
                maxWidth: '500px',
                minHeight: '120px',
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
            <CardContent 
                sx={{ 
                    height: '100%',
                    padding: '16px !important',
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    gap: 3,
                    height: '100%'
                }}>
                    <Avatar
                        src={user.profilePicture
                            ? `http://localhost:3001/${user.profilePicture}`
                            : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                        }
                        sx={{
                            width: 80,
                            height: 80,
                            border: '3px solid #FFF3E0'
                        }}
                        alt={user.name}
                    />
                    
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600, mb: 0.5 }}>
                            {user.name}
                        </Typography>
                        <UserInfoRow icon={<EmailIcon />} text={user.email} />
                        <UserInfoRow 
                            icon={<PersonIcon />} 
                            text={`Role: ${user.role === '1' ? 'User' : 
                                          user.role === '2' ? 'Seller' : 
                                          user.role === '3' ? 'Admin' : 'Unknown'}`} 
                        />
                        {user.phoneNumber && <UserInfoRow icon={<PhoneIcon />} text={user.phoneNumber} />}
                    </Box>

                    <IconButton 
                        onClick={(e) => onMenuClick(e, user)}
                        sx={{
                            color: '#5D4037',
                            '&:hover': { backgroundColor: '#FFF3E0' }
                        }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
}

const UserInfoRow = ({ icon, text }) => (
    <Typography 
        sx={{ 
            color: '#8D6E63',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            wordBreak: 'break-word',
            lineHeight: 1.5,
        }}
    >
        {React.cloneElement(icon, { sx: { fontSize: 18, flexShrink: 0 } })}
        {text}
    </Typography>
);

export default UserCard; 