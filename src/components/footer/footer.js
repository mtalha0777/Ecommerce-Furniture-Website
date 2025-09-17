import React from 'react';
import { Link } from 'react-router-dom';
import { useWindowSize } from '../../utils/useWindowSize';
import logo from '../../assets/images/logo.png'; 
import bed from '../../assets/images/bed.webp';
import { Box, Container, Grid, Typography, Stack } from '@mui/material';
import { 
    LocationOnOutlined, HeadphonesOutlined, EmailOutlined, WatchLaterOutlined,
    Facebook, Twitter, Instagram, YouTube 
} from '@mui/icons-material';
import { SiVisa, SiMastercard, SiStripe } from 'react-icons/si';

const Footer = () => {
    const { width } = useWindowSize();
    const isMobile = width < 768;

    const theme = {
        primary: '#3C2A21',      
        textPrimary: '#EAE0D5',   
        textSecondary: '#D7CCC8', 
        accent: '#FFF',           
        newsletterBg: '#F5EFE6', 
        newsletterSectionBg: '#FFF3E0', 
        brandPrimary: '#5D4037', 
        brandSecondary: '#8D6E63',
    };

    const linkStyles = {
        color: theme.textSecondary,
        textDecoration: 'none',
        transition: 'color 0.3s ease',
        '&:hover': {
            color: theme.accent,
        },
    };

    return (
        <>
            {/* Newsletter Section */}
            <Box sx={{ p: isMobile ? 3 : 6, backgroundColor: theme.newsletterSectionBg }}>
                <Box sx={{
                    backgroundColor: theme.newsletterBg, 
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: isMobile ? 4 : 6,
                    flexDirection: isMobile ? 'column' : 'row',
                    textAlign: isMobile ? 'center' : 'left',
                }}>
                    <Box>
                        <Typography variant={isMobile ? "h4" : "h3"} component="h2" sx={{
                            fontFamily: "'Playfair Display', serif",
                            color: theme.brandPrimary,
                            mb: 2
                        }}>
                            Stay home & furnish<br /> your dreams with us
                        </Typography>
                        <Typography sx={{ color: theme.brandSecondary, fontSize: '1.1rem' }}>
                            Start Your Shopping with AR Furniture
                        </Typography>
                    </Box>
                    <Box 
                        component="img" 
                        src={bed} 
                        alt='bed' 
                        sx={{ 
                            maxWidth: isMobile ? '220px' : '320px', 
                            height: 'auto', 
                            mt: isMobile ? 4 : 0 
                        }} 
                    />
                </Box>
            </Box>

            {/* Main Footer */}
            <Box sx={{
                backgroundColor: theme.primary, 
                color: theme.textPrimary,
                p: isMobile ? '50px 25px' : '80px 50px',
                fontFamily: "'Lato', sans-serif"
            }}>
                <Container maxWidth="xl">
                    <Grid container spacing={5}>
                        
                        {/* Column 1: Contact Info */}
                        <Grid item xs={12} md={4}>
                            <Box component="img" src={logo} alt="AR Furniture Logo" sx={{ height: '50px', mb: 3 }} />
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5}><LocationOnOutlined /> <Typography><strong>Address:</strong> Chiniot, Pakistan</Typography></Stack>
                                <Stack direction="row" spacing={1.5}><HeadphonesOutlined /> <Typography><strong>Call Us:</strong> (+92)-3125636893</Typography></Stack>
                                <Stack direction="row" spacing={1.5}><EmailOutlined /> <Typography><strong>Email:</strong> arfurnish@gmail.com</Typography></Stack>
                                <Stack direction="row" spacing={1.5}><WatchLaterOutlined /> <Typography><strong>Hours:</strong> 10:00 - 18:00, Mon-Sat</Typography></Stack>
                            </Stack>
                        </Grid>

                        {/* Column 2 & 3: Links */}
                        <Grid item xs={12} md={5}>
                            <Grid container spacing={5}>
                                <Grid item xs={6}>
                                     <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", color: theme.accent, mb: 3 }}>Company</Typography>
                                     <Stack spacing={1.5} component="ul" sx={{p: 0, listStyle: 'none'}}>
                                        <li><Link to="/aboutpage" style={linkStyles}>About Us</Link></li>
                                        <li><Link to="/aboutdelivery" style={linkStyles}>Delivery Info</Link></li>
                                        <li><Link to="/aboutprivacy" style={linkStyles}>Privacy Policy</Link></li>
                                        <li><Link to="/aboutterms" style={linkStyles}>Terms & Conditions</Link></li>
                                     </Stack>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", color: theme.accent, mb: 3 }}>Information</Typography>
                                    <Stack spacing={1.5} component="ul" sx={{p: 0, listStyle: 'none'}}>
                                        <li><Link to="/aboutshipping" style={linkStyles}>Shipping Policy</Link></li>
                                        <li><Link to="/aboutreturn" style={linkStyles}>Return Policy</Link></li>
                                        <li><Link to="/contact" style={linkStyles}>Contact Us</Link></li>
                                     </Stack>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Column 4: Payment */}
                        <Grid item xs={12} md={3}>
                            <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", color: theme.accent, mb: 3 }}>Secured Payment</Typography>
                            <Typography sx={{ color: theme.textSecondary, mb: 2 }}>We use secure payment gateways to protect you.</Typography>
                            <Stack direction="row" spacing={2} sx={{ fontSize: '2.5rem', color: theme.textSecondary }}>
                                <SiVisa />
                                <SiMastercard />
                                <SiStripe />
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Bottom Strip */}
                    <Box sx={{
                        pt: 4, mt: 6, borderTop: `1px solid ${theme.brandPrimary}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexDirection: isMobile ? 'column' : 'row', gap: 2
                    }}>
                        <Typography sx={{ color: theme.textSecondary }}>© {new Date().getFullYear()}, AR Furniture. All Rights Reserved.</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>Follow Us:</Typography>
                            <Stack direction="row" spacing={1.5}>
                                <Link to='#' style={linkStyles}><Facebook /></Link>
                                <Link to='#' style={linkStyles}><Twitter /></Link>
                                <Link to='#' style={linkStyles}><Instagram /></Link>
                                <Link to='#' style={linkStyles}><YouTube /></Link>
                            </Stack>
                        </Stack>
                    </Box>
                </Container>
            </Box> 
        </>
    );
}

export default Footer;