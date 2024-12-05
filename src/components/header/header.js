import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Link, useNavigate } from 'react-router-dom';
import '../header/header.css';
import logo from '../../assets/images/logo.png';
import { Select } from '../selectDrop/select'; // Ensure correct import
import 'bootstrap/dist/css/bootstrap.min.css';
import { Ballot, SearchOutlined, ShoppingBag, AdminPanelSettings } from '@mui/icons-material';
import axios from 'axios';
import Modal from './WishlistModal';
import { Button } from 'react-bootstrap';
import { isTokenExpired } from '../../utils/auth';

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
        "Payment Methods",
        'Change Password',
        'Settings',
        'Log Out',
    ]);
    const [cartItems, setCartItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const [shops, setShops] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [wishlistDropdownOpen, setWishlistDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);// Create a ref for the dropdown
    const wishlistRef = useRef(null);  // Create a ref for the dropdown
    const authToken = sessionStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const [userData, setUserData] = useState(null); // Add this state

    useEffect(() => {
        if (!authToken || isTokenExpired(authToken)) {
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    }, [authToken, navigate]);

    useEffect(() => {
        const userID = localStorage.getItem('userID');

        const fetchCartItems = async () => {
            try {
                const response = await fetch(`http://localhost:3001/cart/${userID}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                const data = await response.json();
                setCartItems(data.products);
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        };

        fetchCartItems();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const authResponse = await axios.get('http://localhost:3001/check-auth');
                setUser(authResponse.data.user);
            } catch (error) {
                setUser(null);
                console.error('Error fetching user:', error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const storedUserID = localStorage.getItem('userID');
        
        const fetchShops = async () => {
            try {
                if (storedUserID) {
                    const shopResponse = await axios.post(
                        'http://localhost:3001/shop',
                        { userID: storedUserID },
                        {
                            headers: {
                                'Authorization': `Bearer ${authToken}`
                            }
                        }
                    );
                    const shopID = shopResponse.data.shops[0];
                    setShops(shopID);
                    localStorage.setItem('shopID', shopID._id);
                }
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };

        const fetchFavorites = async () => {
            try {
                if (storedUserID) {
                    const favoritesResponse = await axios.get(
                        `http://localhost:3001/favorites/${storedUserID}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${authToken}`
                            }
                        }
                    );
                    setFavorites(favoritesResponse.data);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchShops();
        fetchFavorites();
    }, [authToken]);

    useEffect(() => {
        const fetchUserData = async () => {
            const userID = localStorage.getItem('userID');
            if (userID) {
                try {
                    const response = await axios.get(
                        `http://localhost:3001/user/${userID}`,
                        {
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        }
                    );
                    setUserData(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [authToken]);

    const [selectedCategory, setSelectedCategory] = useState('All Categories'); // Track selected category

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        navigate('/searchResult');
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
            case "Payment Methods":
                navigate('/paymentMethod');
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
            const response = await axios.post('http://localhost:3001/search', {
                query: searchQuery,
                category: selectedCategory !== 'All Categories' ? selectedCategory : 'All Categories', // Pass category if not "All Categories"
            });
    
            const products = response.data;
            if (products && products?.length > 0) {
                navigate('/searchResult', { state: { searchResults: products } });
            } else {
                alert('No matching products found');
            }
        } catch (error) {
            console.error('Error searching for products:', error);
        }
    };
    

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleShopClick = () => {
        if(userRole == 2){
            navigate('/shopPage', { state: { shop: shops } });
        }else{
            navigate('/profile');
        }
    };

    // Effect to handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false); // Close dropdown
            }
            if (wishlistDropdownOpen && wishlistRef.current && !wishlistRef.current.contains(event.target)) {
                setWishlistDropdownOpen(false); // Close wishlist dropdown
            }
        };

        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const toggleWishlistDropdown = () => {
        setWishlistDropdownOpen(!wishlistDropdownOpen);
    };
    const logoHandler = () => {
        navigate('/home');
    };

    console.log('userData: ', userData?.profilePicture);
    const renderWishlistItems = () => {
        return (
            <div className="wishlist-dropdown-container" style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#FFF3E0',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                padding: '8px',
                overflowY: 'auto',
                zIndex: 1000,
                marginTop: '5px',
                minHeight: '200px'
            }}>
                {favorites.length === 0 ? (
                    <p className="no-items" style={{
                        textAlign: 'center',
                        color: '#5D4037',
                        padding: '8px',
                        margin: 0,
                        position: 'absolute',
                        top: 0,
                    }}>No items in wishlist</p>
                ) : (
                    <ul className="wishlist-dropdown" style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        position: 'absolute',
                        top: 0,
                    }}>
                        {favorites.map((favorite) => (
                            <li key={favorite._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px',
                                borderBottom: '1px solid #FFE0B2',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                margin: 0,
                                '&:hover': {
                                    backgroundColor: '#FFE0B2'
                                }
                            }}>
                                <img 
                                    src={favorite.product?.images?.[0] 
                                        ? `http://localhost:3001/uploads/${favorite.product.images[0]}`
                                        : '/placeholder-image.jpg'
                                    }
                                    alt={favorite.product?.productName || favorite.productName}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        marginRight: '12px'
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        margin: '0 0 4px 0',
                                        fontWeight: 500,
                                        color: '#5D4037'
                                    }}>
                                        {favorite.product?.productName || favorite.productName}
                                    </p>
                                    {favorite.product?.price && (
                                        <p style={{
                                            margin: 0,
                                            color: '#FF8F00',
                                            fontSize: '0.875rem'
                                        }}>
                                            ${favorite.product.price.toLocaleString()}
                                        </p>
                                    )}
                                    
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <header>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-2 d-flex align-items-center'>
                        <img src={logo} className="left-aligned-image" onClick={logoHandler} alt="Logo" />
                        <h3><strong>AR Furniture</strong></h3>
                    </div>
                    <div className='col-sm-5'>
                        <div className='headerSearch d-flex align-items-center'>
                            <div className='selecDrop'>
                                <Select data={categories} onSelect={handleCategorySelect} placeholder="All Categories" />
                            </div>
                            <div className='search'>
                                <input
                                    type='text'
                                    placeholder='Search for furniture...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <button
                                    className='searchIcon'
                                    onClick={handleSearch}
                                >
                                    <SearchOutlined style={{ fontSize: '24px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='col-sm-5 d-flex align-items-center justify-content-end'>
                        <ul className='list list-inline mb-0 headerTabs'>
                            {userRole === '3' && (
                                <li className='list-inline-item' style={{ marginRight: '15px', marginTop: '8px' }}>
                                    <span onClick={() => navigate('/admin-dashboard')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <AdminPanelSettings style={{ fontSize: '24px' }} />
                                        <span>Admin</span>
                                    </span>
                                </li>
                            )}
                            <li className='list-inline-item position-relative' 
                                onClick={toggleWishlistDropdown} 
                                style={{
                                    cursor: 'pointer',
                                    marginRight: '15px'
                                }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <span className='badge rounded-pill' style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
                                            {favorites?.length ? favorites?.length : 0}
                                        </span>
                                        <Ballot style={{ fontSize: '24px' }} />
                                    </div>
                                    <span>Wishlist</span>
                                </span>
                                {wishlistDropdownOpen && (
                                    <div className="wishlist-dropdown-wrapper" ref={wishlistRef}>
                                        {renderWishlistItems()}
                                    </div>
                                )}
                            </li>
                            <li className='list-inline-item' style={{ marginLeft:'15px' }}>
                                <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <span className='badge rounded-pill' style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
                                                {cartItems?.length ? cartItems?.length : 0}
                                            </span>
                                            <ShoppingBag style={{ fontSize: '24px' }} />
                                        </div>
                                        <span>Cart</span>
                                    </span>
                                </Link>
                            </li>
                        </ul>
                        <div className='ms-3'>
                            <span onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                                <img
                                    src={
                                        userRole !== '1' && userData?.profilePicture
                                            ? `http://localhost:3001/${userData.profilePicture}`
                                            : userRole === '2' && shops.profilePicture
                                                ? `http://localhost:3001/${shops.profilePicture}`
                                                : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                                    }
                                    className="profile-image"
                                    alt="Avatar"
                                    onError={(e) => {
                                        e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                                    }}
                                />
                            </span>
                            {dropdownOpen && (
                                <div className="dropdown-menu" style={{ display: 'block', marginRight:'2%', cursor:'pointer' }} ref={dropdownRef}>
                                    <span className="dropdown-item" onClick={handleShopClick}>{shops.shopName? shops.shopName : 'My Profile'}</span>
                                    <button onClick={() => { navigate('/') }} className="dropdown-item">Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
