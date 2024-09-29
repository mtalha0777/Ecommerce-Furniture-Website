import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../header/header.css';
import logo from '../../assets/images/logo.png';
import { Select } from '../selectDrop/select'; // Ensure correct import
import 'bootstrap/dist/css/bootstrap.min.css';
import { Ballot, SearchOutlined, ShoppingBag } from '@mui/icons-material';
import axios from 'axios';

const Header = () => {
    const [categories] = useState([
        'All Categories',
        'Beds',
        'Sofa',
        'Tables',
        'Decoration pieces',
    ]);

    const [account] = useState([
        'My Account',
        'Profile',
        'Change Password',
        'Settings',
        'Log Out',
    ]);

    const [cartItems, setCartItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart.length);

        // Check if user is logged in
        const checkUser = async () => {
            try {
                const response = await axios.get('http://localhost:3001/check-auth');
                setUser(response.data.user);
            } catch (error) {
                setUser(null);
            }
        };

        checkUser();
    }, []);

    const handleCategorySelect = (category) => {
        switch (category) {
            case 'Beds':
                navigate('/bed');
                break;
            case 'Sofa':
                navigate('/sofa');
                break;
            case 'Tables':
                navigate('/table');
                break;
            case 'Decoration pieces':
                navigate('/home'); // Adjust if there's a specific route for decoration pieces
                break;
            case 'All Categories':
            default:
                navigate('/home');
                break;
        }
    };

    const handleAccountSelect = async (accountItem) => {
        switch (accountItem) {
            case 'Profile':
                navigate('/profile');
                break;
            case 'Change Password':
                navigate('/change-password');
                break;
            case 'Settings':
                navigate('/settings');
                break;
            case 'Log Out':
                try {
                    await axios.post('http://localhost:3001/logout');
                    setUser(null);
                    navigate('/');
                } catch (error) {
                    console.error('Error logging out:', error);
                }
                break;
            case 'My Account':
            default:
                navigate('/home');
                break;
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get('http://localhost:3001/search', {
                params: { query: searchQuery },
            });

            const { category, results } = response.data;

            if (results && results.length > 0) {
                navigate(`/${category}`, { state: { searchResults: results } });
            } else {
                alert('No matching products found');
            }
        } catch (error) {
            console.error('Error searching for products:', error);
        }
    };

    // Handler for Enter key press
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    };

    return (
        <header>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-2'>
                        <img src={logo} className="left-aligned-image" alt="Logo" />
                        <h3><strong>AR Furniture</strong></h3>
                    </div>
                    <div className='col-sm-5'>
                        <div className='headerSearch selecDrop d-flex align-items-center'>
                            <Select data={categories} onSelect={handleCategorySelect} placeholder="All Categories" />
                            <div className='search' style={{ position: 'relative' }}>
                                <input
                                    type='text'
                                    placeholder='Search the items'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <button
                                    className='searchIcon cursor'
                                    onClick={handleSearch}
                                    style={{ border: '1px solid transparent', position: 'absolute', right: -21, top: '13px' }}
                                >
                                    <SearchOutlined style={{ fontSize: '30px', color: 'blue', width: '35px', height: '47px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='col-sm-5 d-flex align-items-center'>
                        <ul className='list list-inline mb-0 headerTabs'>
                            <li className='list inline-item'>
                                <span>
                                    <Ballot style={{ fontSize: '30px' }} />
                                    <span className='badge bg-success rounded-circle'>2</span>
                                    Wishlist
                                </span>
                            </li>
                        </ul>
                        <ul className='list list-inline mb-0 headerTabs'>
                            <li className='list inline-item'>
                                <span>
                                    
                                    {cartItems > 0 && (
                                        <span className='badge bg-success rounded-circle'>{cartItems}</span>
                                    )}
                                    <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <ShoppingBag style={{ fontSize: '30px' }} />
                                     Cart
                                    </Link>
                                </span>
                            </li>
                        </ul>
                        <ul className='list list-inline mb-0 headerTabs'>
                            <li className='list inline-item'>
                                <span>
                                    <Select data={account} onSelect={handleAccountSelect} placeholder={user ? user.name : "My Account"} />
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
