import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import images from './images.jpeg';
import login from './login.jpeg';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
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
            const result = await axios.post('http://localhost:3001/logins', { email, password });
            if (result.data.message === "Success") {
                const userID = result.data.userID;
                // Store userID in localStorage
                localStorage.setItem('userID', userID);
                localStorage.setItem('userRole', result.data.role);
                if (result.data.role == 2 && result.data.loginStatus === true) {
                    navigate('/shopdetails', { state: { userID } });
                }
                else{
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
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100" style={{ backgroundSize: 'cover', backgroundImage: `url(${login})` }}>
            <div className="bg-white p-4 rounded shadow" style={{ minWidth: '350px' }}>
                <img src={images} alt="Logo" className="img-fluid mb-3" />
                <h2 className="text-center mb-3">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label"><strong>Email</strong></label>
                        <input 
                            type="email" 
                            placeholder="Enter Email" 
                            autoComplete="off" 
                            name="email" 
                            className="form-control rounded-0" 
                            onChange={(e) => setEmail(e.target.value)} 
                            value={email} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label"><strong>Password</strong></label>
                        <input 
                            type="password" 
                            placeholder="Enter Password" 
                            autoComplete="off" 
                            name="password" 
                            className="form-control rounded-0" 
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password} 
                            required 
                            minLength="6" 
                        />
                    </div>
                    {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 rounded-0 mb-3" 
                        style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.19)' }}
                    >
                        Login
                    </button>
                </form>
                <p className="text-center">Don't have an account?</p>
                <Link 
                    to="/signup" 
                    className="btn btn-success w-100 rounded-0 text-decoration-none mb-2" 
                    style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.19)' }}
                >
                    Sign Up
                </Link>
                <Link 
                    to="/delete" 
                    className="btn btn-danger w-100 rounded-0 text-decoration-none" 
                    style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.19)' }}
                >
                    Delete User
                </Link>
            </div>
        </div>
    );
}
export default Login;
