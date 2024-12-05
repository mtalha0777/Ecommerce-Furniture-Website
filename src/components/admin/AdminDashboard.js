import React from 'react';
import { Box, Typography } from '@mui/material';
import logo from '../../assets/images/logo.png'; // Import your logo image
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';
import ShopManagement from './ShopManagement';

function AdminDashboard() {
    const [selectedTab, setSelectedTab] = useState('Manage Users');
    const [users, setUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const authToken = sessionStorage.getItem('authToken');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const USERS_PER_PAGE = 10;
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderFilter, setOrderFilter] = useState('All');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [shops, setShops] = useState([]);

    useEffect(() => {
        if (selectedTab === 'Manage Users') {
            fetchUsers(1, true); // Reset and fetch first page
        } else if (selectedTab === 'Approve Orders') {
            fetchOrders();
        } else if (selectedTab === 'Manage Shops') {
            fetchShops();
        }
    }, [selectedTab]);

    useEffect(() => {
        // Filter users based on search query
        const filtered = users.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.role === '1' && 'user'.includes(searchQuery.toLowerCase())) ||
            (user.role === '2' && 'seller'.includes(searchQuery.toLowerCase())) ||
            (user.role === '3' && 'admin'.includes(searchQuery.toLowerCase()))
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    useEffect(() => {
        if (selectedTab === 'Approve Orders') {
            fetchOrders();
        }
    }, [selectedTab]);

    useEffect(() => {
        if (!orders) return;
        
        if (orderFilter === 'All') {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order => 
                order.status.toLowerCase() === orderFilter.toLowerCase()
            );
            setFilteredOrders(filtered);
        }
    }, [orderFilter, orders]);

    const fetchUsers = async (pageNum, isNewSearch = false) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3001/users?page=${pageNum}&limit=${USERS_PER_PAGE}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const newUsers = response.data.users;
            setHasMore(newUsers.length === USERS_PER_PAGE);
            
            if (isNewSearch) {
                setUsers(newUsers);
                setPage(1);
            } else {
                setUsers(prev => [...prev, ...newUsers]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:3001/orders', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchShops = async () => {
        try {
            const response = await axios.get('http://localhost:3001/shops', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setShops(response.data);
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    const handleScroll = useCallback((event) => {
        const { scrollTop, clientHeight, scrollHeight } = event.target;
        
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchUsers(nextPage);
        }
    }, [loading, hasMore, page]);

    const handleMenuClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleOrderMenuClick = (event, order) => {
        setAnchorEl(event.currentTarget);
        setSelectedOrder(order);
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await axios.put(
                `http://localhost:3001/orders/${selectedOrder._id}/status`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${authToken}` } }
            );
            fetchOrders(); // Refresh orders list
            handleMenuClose();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleMakeAdmin = async () => {
        try {
            await axios.put(`http://localhost:3001/users/${selectedUser._id}/role`, 
                { role: '3' },
                { headers: { 'Authorization': `Bearer ${authToken}` } }
            );
            fetchUsers(); // Refresh user list
            handleMenuClose();
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const handleRemoveUser = async () => {
        try {
            await axios.delete(`http://localhost:3001/users/${selectedUser._id}`,
                { headers: { 'Authorization': `Bearer ${authToken}` } }
            );
            fetchUsers(); // Refresh user list
            handleMenuClose();
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            setOrderFilter(newFilter);
        }
    };

    const renderContent = () => {
        if (selectedTab === 'Manage Users') {
            return (
                <UserManagement 
                    users={users}
                    loading={loading}
                    hasMore={hasMore}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredUsers={filteredUsers}
                    handleScroll={handleScroll}
                    handleMenuClick={handleMenuClick}
                    handleMenuClose={handleMenuClose}
                    handleMakeAdmin={handleMakeAdmin}
                    handleRemoveUser={handleRemoveUser}
                    anchorEl={anchorEl}
                    selectedUser={selectedUser}
                />
            );
        } else if (selectedTab === 'Approve Orders') {
            return (
                <OrderManagement 
                    orderFilter={orderFilter}
                    handleFilterChange={handleFilterChange}
                    filteredOrders={filteredOrders}
                    handleOrderMenuClick={handleOrderMenuClick}
                    handleStatusChange={handleStatusChange}
                    anchorEl={anchorEl}
                    handleMenuClose={handleMenuClose}
                />
            );
        } else if (selectedTab === 'Manage Shops') {
            return (
                <ShopManagement 
                    shops={shops}
                />
            );
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#FFF3E0' }}>
            <Sidebar 
                logo={logo}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
            />
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#FFF3E0' }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#5D4037', textAlign: 'center' }}>
                    {selectedTab}
                </Typography>
                {renderContent()}
            </Box>
        </Box>
    );
}

export default AdminDashboard; 