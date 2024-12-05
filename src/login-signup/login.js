import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import images from './images.jpeg';
import login from './login.jpeg';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTools, FaChair } from 'react-icons/fa';
import { BiSolidCabinet } from 'react-icons/bi';
import { GiWoodBeam, GiSawedOffShotgun } from 'react-icons/gi';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();


    // axios.get('http://localhost:3001/check-auth')
    // .then(response => {
    //     // Handle response
    // })
    // .catch(error => {
    //     console.error('Error checking auth:', error);
    // });
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post('http://localhost:3001/login', { email, password });
            if (result.data.message === "Success") {
                const userID = result.data.userID;
                // Store userID in localStorage
                sessionStorage.setItem('authToken', result.data.token);
                localStorage.setItem('userID', userID);
                localStorage.setItem('userRole', result.data.role);
                if (result.data.role == 3) {
                    navigate('/admin-dashboard', { state: { userID } });
                } else if (result.data.role == 2 && result.data.loginStatus === true) {
                    navigate('/shopdetails', { state: { userID } });
                } else {
                    navigate('/home');
                }
            } else {
                setErrorMessage('Invalid email or password');
            }
        } catch (err) {
            if (err.response) {
                setErrorMessage('Error: ' + err.response.data);
            } else if (err.request) {
                setErrorMessage('Error: No response from server. Please try again later.');
            } else {
                setErrorMessage('Error: ' + err.message);
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" 
            style={{ 
                backgroundColor: '#FFF3E0',
                backgroundImage: `
                    linear-gradient(45deg, rgba(139, 69, 19, 0.05) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(139, 69, 19, 0.05) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, rgba(139, 69, 19, 0.05) 75%),
                    linear-gradient(-45deg, transparent 75%, rgba(139, 69, 19, 0.05) 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}>
            <div className="p-5 rounded-4" 
                style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    minWidth: '380px',
                    boxShadow: '0 8px 32px rgba(139, 69, 19, 0.15)',
                    border: '2px solid rgba(139, 69, 19, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                
                {/* Decorative Corner Elements */}
                <div className="corner-design top-left"></div>
                <div className="corner-design top-right"></div>
                <div className="corner-design bottom-left"></div>
                <div className="corner-design bottom-right"></div>

                {/* Header Section */}
                <div className="text-center mb-4">
                    <div className="workshop-icon-container mb-3">
                        <div className="tool-icon">
                            <FaTools size={24} style={{ color: '#8D6E63' }} />
                        </div>
                        <div className="chair-icon">
                            <FaChair size={28} style={{ color: '#5D4037' }} />
                        </div>
                        <div className="cabinet-icon">
                            <BiSolidCabinet size={26} style={{ color: '#8D6E63' }} />
                        </div>
                    </div>
                    <h2 className="mb-2" 
                        style={{ 
                            color: '#5D4037',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '2.2rem',
                            position: 'relative'
                        }}>
                        Welcome Back
                        <div className="wood-grain"></div>
                    </h2>
                    <p style={{ 
                        color: '#8D6E63',
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '1.1rem'
                    }}>Crafting Excellence, Building Dreams</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 position-relative">
                        <label htmlFor="email" 
                            style={{ 
                                color: '#795548',
                                fontFamily: '"Source Sans Pro", sans-serif',
                                fontSize: '0.95rem'
                            }}>Email</label>
                        <div className="position-relative">
                            <FaEnvelope 
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#8D6E63',
                                    zIndex: 1
                                }}
                            />
                            <input 
                                type="email"
                                className="form-control rounded-3 border-0"
                                style={{
                                    backgroundColor: '#FFF8E7',
                                    padding: '0.8rem',
                                    paddingLeft: '2.5rem',
                                    fontSize: '1rem'
                                }}
                                placeholder="Enter Email" 
                                autoComplete="off" 
                                name="email" 
                                onChange={(e) => setEmail(e.target.value)} 
                                value={email} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="mb-4 position-relative">
                        <label htmlFor="password" 
                            style={{ 
                                color: '#795548',
                                fontFamily: '"Source Sans Pro", sans-serif',
                                fontSize: '0.95rem'
                            }}>Password</label>
                        <div className="position-relative">
                            <FaLock 
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#8D6E63',
                                    zIndex: 1
                                }}
                            />
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="form-control rounded-3 border-0"
                                style={{
                                    backgroundColor: '#FFF8E7',
                                    padding: '0.8rem',
                                    paddingLeft: '2.5rem',
                                    paddingRight: '2.5rem',
                                    fontSize: '1rem'
                                }}
                                placeholder="Enter Password" 
                                autoComplete="off" 
                                name="password" 
                                onChange={(e) => setPassword(e.target.value)} 
                                value={password} 
                                required 
                                minLength="6" 
                            />
                            <div 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    color: '#8D6E63'
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="alert rounded-3 mb-4" 
                            style={{
                                backgroundColor: '#FFDDC9',
                                color: '#D84315',
                                border: 'none',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                            <div className="wood-texture"></div>
                            {errorMessage}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn w-100 rounded-3 mb-4 workshop-btn"
                        style={{
                            backgroundColor: '#8D6E63',
                            color: 'white',
                            padding: '0.8rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(141, 110, 99, 0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                        <span className="btn-content">
                            Sign In
                        </span>
                    </button>
                </form>

                <div className="text-center" style={{ color: '#795548' }}>
                    <div className="tools-divider mb-3">
                        <div className="saw-line"></div>
                        <GiSawedOffShotgun size={24} style={{ color: '#8D6E63' }} />
                        <div className="saw-line"></div>
                    </div>
                    <p className="mb-3">Don't have an account?</p>
                    <Link 
                        to="/signup" 
                        className="btn w-100 rounded-3 mb-3 workshop-btn-secondary"
                        style={{
                            backgroundColor: '#D7CCC8',
                            color: '#5D4037',
                            padding: '0.8rem',
                            transition: 'all 0.3s ease'
                        }}>
                        Create Account
                    </Link>
                    
                    {/* <Link 
                        to="/delete" 
                        className="btn w-100 rounded-3"
                        style={{
                            backgroundColor: '#EFEBE9',
                            color: '#D32F2F',
                            padding: '0.8rem',
                            transition: 'all 0.3s ease'
                        }}>
                        Delete Account
                    </Link> */}
                </div>
            </div>
        </div>
    );
}
export default Login;
