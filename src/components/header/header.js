import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Link, useNavigate } from 'react-router-dom';
import '../header/header.css';
import logo from '../../assets/images/logo.png';
import { Select } from '../selectDrop/select'; // Ensure correct import
import 'bootstrap/dist/css/bootstrap.min.css';
import { Ballot, SearchOutlined, ShoppingBag } from '@mui/icons-material';
import axios from 'axios';
import Modal from './WishlistModal';
import { Button } from 'react-bootstrap';

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


    useEffect(() => {
        const userID = localStorage.getItem('userID'); // Assuming userID is stored in localStorage

        const fetchCartItems = async () => {
            try {
                const response = await fetch(`http://localhost:3001/cart/${userID}`);
                const data = await response.json();
                setCartItems(data.products); // Assuming 'products' contains the array of cart items
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        };

        fetchCartItems();
    }, []);

    useEffect(() => {
        const storedUserID = localStorage.getItem('userID');

        const fetchUserData = async () => {
            try {
                const authResponse = await axios.get('http://localhost:3001/check-auth');
                setUser(authResponse.data.user);

                if (storedUserID) {
                    const shopResponse = await axios.post(`http://localhost:3001/shop`, { userID: storedUserID });
                    const shopID = shopResponse.data.shops[0]
                    setShops(shopID);
                    console.log('ShopResponse', shopID._id);
                    localStorage.setItem('shopID', shopID._id);
                }
                if (storedUserID) {
                    console.log('asas')
                    const favoritesResponse = await axios.get(`http://localhost:3001/favorites/${storedUserID}`);
                    setFavorites(favoritesResponse.data);
                }
            } catch (error) {
                setUser(null);
                console.error('Error fetching user or shops:', error);
            }
        };
        fetchUserData();
    }, []);

    const [selectedCategory, setSelectedCategory] = useState('All Categories'); // Track selected category

    const handleCategorySelect = (category) => {
        console.log('searchResult', category);
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
            console.log('response.data', response.data);
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
        navigate('/shopPage', { state: { shop: shops } });
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

    const [showWishlistModal, setShowWishlistModal] = useState(false);
    const toggleWishlistDropdown = () => {
        setWishlistDropdownOpen(!wishlistDropdownOpen);
    };
    const logoHandler = () => {
        navigate('/home');
    };
    const renderWishlistItems = () => {
        return (
            <ul className="wishlist-dropdown">
                {favorites.map((favorite, index) => (
                    <li key={index}>{favorite.productName}</li>
                ))}
            </ul>
        );
    };
    console.log('cartItems',cartItems)
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
                            <li className='list-inline-item' onClick={toggleWishlistDropdown}>
                                <span>
                                    <Ballot style={{ fontSize: '24px' }} />
                                    <span className='badge rounded-pill'>{favorites?.length}</span>
                                    Wishlist
                                </span>
                                {wishlistDropdownOpen && (
                                    <div className="wishlist-dropdown" ref={wishlistRef}>
                                        {renderWishlistItems()}
                                    </div>
                                )}
                            </li>
                            <li className='list-inline-item' style={{marginLeft:'15px'}}>
                                <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <span>
                                    {/* <span className='badge rounded-pill'>{cartItems?.length}</span> */}
                                        <ShoppingBag style={{ fontSize: '24px' }} />
                                        {cartItems?.length > 0 && (
                                            <span className='badge rounded-pill'>{cartItems?.length}</span>
                                        )}
                                        Cart
                                    </span>
                                </Link>
                            </li>
                        </ul>
                        <div className='ms-3'>
                            <span onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                                <img
                                    src={`http://localhost:3001/${shops.profilePicture}`}
                                    className="profile-image"
                                    alt="Avatar"
                                />
                            </span>
                            {dropdownOpen && (
                                <div className="dropdown-menu" style={{ display: 'block', marginRight:'2%', cursor:'pointer' }} ref={dropdownRef}>
                                    <span className="dropdown-item" onClick={handleShopClick}>{shops.shopName}</span>
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
