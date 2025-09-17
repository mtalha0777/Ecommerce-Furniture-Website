import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { Box, Typography, TextField, Button, Paper, IconButton } from '@mui/material';

// Icons
import { FaUsers, FaTimes, FaStore, FaUserShield, FaTrash, FaBars} from 'react-icons/fa';
import logo from '../../assets/images/logo.png';

// --- RESPONSIVENESS HOOK ---
const useWindowSize = () => {
    const [size, setSize] = useState({ width: window.innerWidth });
    useEffect(() => {
        const handleResize = () => setSize({ width: window.innerWidth });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
 const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { width } = useWindowSize();
    const isMobile = width < 900;
    useEffect(() => {
        if (!isMobile) {
            setSidebarOpen(false);
        }
    }, [isMobile]);
    // --- THEME ---
    const theme = {
        background: '#FFF3E0', containerBackground: '#FFFFFF', primaryText: '#5D4037',
        secondaryText: '#8D6E63', accent: '#8D6E63', lightBorder: '#D7CCC8',
    };

    // --- DATA FETCHING -

 const fetchUsers = useCallback(async () => {
        setLoading(true);
        // This query will now work because of the new RLS policy
        const { data, error } = await supabase.from('profiles').select('*').neq('role', 3);
        if (error) { toast.error("Could not fetch users."); console.error(error); }
        else setUsers(data || []);
        setLoading(false);
    }, []);

          const fetchShops = useCallback(async () => {
        setLoading(true);
        // FIX: This query now explicitly tells Supabase how to join
        const { data, error } = await supabase
            .from('shops')
            .select(`*, profiles!owner_id ( name )`);
        
        if (error) {
            toast.error("Could not fetch shops.");
            console.error("Shop fetch error:", error);
        } else {
            setShops(data || []);
        }
        setLoading(false);
    }, []);


    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'shops') fetchShops();
        // Add fetchOrders logic here when ready
    }, [activeTab, fetchUsers, fetchShops]);

    // --- HANDLERS ---
    const handleMakeAdmin = async (userId) => {
        if (!window.confirm("Are you sure you want to make this user an admin?")) return;
        const { error } = await supabase.from('profiles').update({ role: 3 }).eq('id', userId);
        if (error) toast.error(error.message);
        else {
            toast.success("User role updated to Admin.");
            fetchUsers(); // Refresh list
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to remove ${userEmail}? This will only remove their profile, not their login.`)) return;
        
        // **IMPORTANT:** This only deletes the user's profile data.
        // To delete the user from Supabase Auth, you must use a secure server-side call, like an Edge Function.
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) toast.error(error.message);
        else {
            toast.success("User profile removed.");
            fetchUsers(); // Refresh list
        }
    };


    // --- FILTERING LOGIC ---
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- STYLES ---
    const styles = {
        page: { display: 'flex', height: '100vh', flexDirection: isMobile ? 'column' : 'row' },
        sidebar: {
            width: isMobile ? '100%' : '280px', flexShrink: 0, backgroundColor: theme.containerBackground,
            borderRight: isMobile ? 'none' : `1px solid ${theme.lightBorder}`, borderBottom: isMobile ? `1px solid ${theme.lightBorder}` : 'none',
            padding: '20px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center',
            justifyContent: isMobile ? 'space-around' : 'flex-start'
        },
        sidebarLogo: { height: '50px', marginBottom: isMobile ? 0 : '30px' },
        sidebarButton: {
            width: '100%', padding: '15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px',
            cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontSize: '1rem', color: theme.secondaryText,
            transition: 'all 0.3s ease'
        },
        mainContent: { flexGrow: 1, padding: isMobile ? '15px' : '30px', overflowY: 'auto', backgroundColor: theme.background },
        header: { color: theme.primaryText, fontFamily: "'Playfair Display', serif", marginBottom: '20px', textAlign: 'center' },
        tableContainer: { backgroundColor: theme.containerBackground, borderRadius: '15px', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { padding: '15px', textAlign: 'left', backgroundColor: '#f8f9fa', color: theme.primaryText, borderBottom: `1px solid ${theme.lightBorder}` },
        td: { padding: '15px', borderBottom: `1px solid ${theme.lightBorder}`, color: theme.secondaryText },
        actionButton: { padding: '8px 12px', borderRadius: '5px', border: 'none', cursor: 'pointer', color: 'white', marginRight: '10px' }
    };

    // --- RENDER ---
       // --- RENDER ---
    return (
        <Box sx={styles.page}>
            {/* --- RESPONSIVE SIDEBAR LOGIC START --- */}
            {isMobile && (
                <IconButton 
                    sx={{ position: 'absolute', top: 15, left: 15, zIndex: 11, color: theme.primaryText }} 
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </IconButton>
            )}

            <Box sx={{
                ...styles.sidebar,
                position: isMobile ? 'fixed' : 'relative',
                left: isMobile ? (isSidebarOpen ? '0' : '-100%') : '0',
                zIndex: 10,
                transition: 'left 0.3s ease-in-out',
                height: isMobile ? '100vh' : 'auto'
            }}>
                <img src={logo} alt="Logo" style={styles.sidebarLogo} />
                {[{ key: 'users', label: 'Manage Users', icon: <FaUsers /> },
                 { key: 'shops', label: 'Manage Shops', icon: <FaStore /> }
                ].map(tab => (
                    <button key={tab.key}
                        style={{ ...styles.sidebarButton, ...(activeTab === tab.key && { backgroundColor: theme.background, color: theme.primaryText, fontWeight: 'bold' }) }}
                        onClick={() => { setActiveTab(tab.key); if (isMobile) setSidebarOpen(false); }}
                    >
                        {tab.icon} {!isMobile && tab.label}
                    </button>
                ))}
            </Box>
            {/* --- RESPONSIVE SIDEBAR LOGIC END --- */}


            {/* Main Content */}
            <Box sx={{ ...styles.mainContent, marginLeft: isMobile ? 0 : '0' }}>
                {loading ? <Typography>Loading...</Typography> :
                <>
                    {activeTab === 'users' && (
                        <>
                            <Typography variant="h4" sx={styles.header}>Manage Users</Typography>
                            <TextField fullWidth placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 2 }}/>
                            <Paper sx={{ ...styles.tableContainer, overflowX: 'auto' }}>
                                <table style={styles.table}>
                                    <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>Role</th><th style={styles.th}>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}><td style={styles.td}>{user.name}</td><td style={styles.td}>{user.email}</td><td style={styles.td}>{user.role === 1 ? 'User' : user.role === 2 ? 'Seller' : 'Admin'}</td><td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                                                {user.role !== 3 && <Button variant="contained" startIcon={<FaUserShield/>} onClick={() => handleMakeAdmin(user.id)} sx={{mr: 1}}>Make Admin</Button>}
                                                <Button variant="contained" color="error" startIcon={<FaTrash/>} onClick={() => handleDeleteUser(user.id, user.email)}>Remove</Button>
                                            </td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Paper>
                        </>
                    )}

                    {activeTab === 'shops' && (
                         <>
                            <Typography variant="h4" sx={styles.header}>Manage Shops</Typography>
                             <Paper sx={{ ...styles.tableContainer, overflowX: 'auto' }}>
                                <table style={styles.table}>
                                   <thead><tr><th style={styles.th}>Shop Name</th><th style={styles.th}>Owner Name</th><th style={styles.th}>City</th></tr></thead>
                                  <tbody>
    {shops.map(shop => (
        <tr key={shop.id}>
            <td style={styles.td}>{shop.shopName}</td>
            <td style={styles.td}>{shop.profiles?.name || 'N/A'}</td>
            <td style={styles.td}>{shop.city}</td>
        </tr>
    ))}
</tbody>
                                </table>
                            </Paper>
                        </>
                    )}
                </>
                }
            </Box>
        </Box>
    );
};

export default AdminDashboard;