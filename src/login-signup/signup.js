import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserTag, FaCouch } from 'react-icons/fa';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import images1 from './images1.jpeg';
import signup from './signup.jpeg';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [role, setRole] = useState('User');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); 

    const validate = () => {
        const errors = {};
        if (!name.trim()) {
            errors.name = 'Name is required';
        } else if (name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(name)) {
            errors.name = 'Name must contain only letters';
        }
        if (!email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email address is invalid';
        }
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (/\s/.test(password)) {
            errors.password = 'Password must not contain spaces';
        }
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            const roleValue = role === "User" ? 1 : 2;

            axios.post('http://localhost:3001/register', { name, email, password, role: roleValue })
                .then(result => {
                    console.log(result);
                    alert('Registration successful! Redirecting to login...');
                    navigate('/');
                })
                .catch(err => {
                    console.log(err);
                    setErrors({ 
                        submit: err.response?.data?.message || 
                               'Failed to register. Please check your information and try again.' 
                    });
                });
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" 
            style={{ 
                backgroundColor: '#FFF3E0',
                backgroundImage: 'url("/textures/subtle-paper.png")',
                backgroundBlend: 'multiply'
            }}>
            <div className="p-5 rounded-4" 
                style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    minWidth: '420px',
                    boxShadow: '0 8px 32px rgba(139, 69, 19, 0.1)',
                    border: '1px solid rgba(139, 69, 19, 0.1)'
                }}>
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <div className="mx-3" style={{ height: '2px', width: '40px', background: 'linear-gradient(to right, transparent, #8D6E63)' }}></div>
                        <FaCouch size={24} style={{ color: '#8D6E63' }} />
                        <div className="mx-3" style={{ height: '2px', width: '40px', background: 'linear-gradient(to left, transparent, #8D6E63)' }}></div>
                    </div>
                    <h2 className="mb-2" 
                        style={{ 
                            color: '#5D4037',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '2.2rem'
                        }}>Create Account</h2>
                    <p style={{ 
                        color: '#8D6E63',
                        fontFamily: '"Source Sans Pro", sans-serif',
                        fontSize: '1.1rem'
                    }}>Join our community today</p>
                </div>

                <div className="position-relative">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 position-relative">
                            <label style={{ color: '#795548', fontFamily: '"Source Sans Pro", sans-serif' }}>
                                <strong>Name</strong>
                            </label>
                            <div className="position-relative">
                                <FaUser 
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
                                    type="text"
                                    placeholder="Enter Name"
                                    className="form-control rounded-3 border-0"
                                    style={{
                                        backgroundColor: '#FFF8E7',
                                        padding: '0.8rem',
                                        paddingLeft: '2.5rem',
                                        fontSize: '1rem'
                                    }}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            {errors.name && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.name}</div>}
                        </div>

                        <div className="mb-4 position-relative">
                            <label style={{ color: '#795548', fontFamily: '"Source Sans Pro", sans-serif' }}>
                                <strong>Email</strong>
                            </label>
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
                                    placeholder="Enter Email"
                                    className="form-control rounded-3 border-0"
                                    style={{
                                        backgroundColor: '#FFF8E7',
                                        padding: '0.8rem',
                                        paddingLeft: '2.5rem',
                                        fontSize: '1rem'
                                    }}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {errors.email && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.email}</div>}
                        </div>

                        <div className="mb-4 position-relative">
                            <label style={{ color: '#795548', fontFamily: '"Source Sans Pro", sans-serif' }}>
                                <strong>Password</strong>
                            </label>
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
                                    placeholder="Enter Password"
                                    className="form-control rounded-3 border-0"
                                    style={{
                                        backgroundColor: '#FFF8E7',
                                        padding: '0.8rem',
                                        paddingLeft: '2.5rem',
                                        paddingRight: '2.5rem',
                                        fontSize: '1rem'
                                    }}
                                    onChange={(e) => setPassword(e.target.value)}
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
                            {errors.password && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.password}</div>}
                        </div>

                        <div className="mb-4 position-relative">
                            <label style={{ color: '#795548', fontFamily: '"Source Sans Pro", sans-serif' }}>
                                <strong>Role</strong>
                            </label>
                            <div className="position-relative">
                                <FaUserTag 
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#8D6E63',
                                        zIndex: 1
                                    }}
                                />
                                <select 
                                    className="form-control rounded-3 border-0"
                                    style={{
                                        backgroundColor: '#FFF8E7',
                                        padding: '0.8rem',
                                        paddingLeft: '2.5rem',
                                        fontSize: '1rem',
                                        appearance: 'auto'
                                    }}
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="User">User</option>
                                    <option value="Seller">Seller</option>
                                </select>
                            </div>
                            {errors.role && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.role}</div>}
                        </div>

                        {errors.submit && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.submit}</div>}
                        <button 
                            type="submit" 
                            className="btn w-100 rounded-3 mb-4 position-relative overflow-hidden"
                            style={{
                                backgroundColor: '#8D6E63',
                                color: 'white',
                                padding: '0.8rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(141, 110, 99, 0.2)'
                            }}>
                            <span className="d-flex align-items-center justify-content-center">
                                <span>Register</span>
                                <div className="ms-2" style={{ 
                                    width: '20px', 
                                    height: '2px', 
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                    transition: 'all 0.3s ease' 
                                }}></div>
                            </span>
                        </button>
                    </form>
                    <div className="text-center" style={{ color: '#795548' }}>
                        <div className="d-flex align-items-center justify-content-center mb-3">
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #8D6E63, transparent)' }}></div>
                            <span className="px-3">or</span>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #8D6E63, transparent)' }}></div>
                        </div>
                        <p className="mb-3">Already have an Account?</p>
                        <Link 
                            to="/" 
                            className="btn w-100 rounded-3 position-relative overflow-hidden"
                            style={{
                                backgroundColor: '#D7CCC8',
                                color: '#5D4037',
                                padding: '0.8rem',
                                transition: 'all 0.3s ease'
                            }}>
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;