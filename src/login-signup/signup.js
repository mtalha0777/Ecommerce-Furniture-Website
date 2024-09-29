

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import images1 from './images1.jpeg';
import signup from './signup.jpeg';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate(); 

    const validate = () => {
        const errors = {};
        if (!name.trim()) {
            errors.name = 'Name is required';
        } else if (name.length < 3) {
            errors.name = 'Name must be at least 3 characters';
        } else if (!/^[a-zA-Z]+$/.test(name)) {
            errors.name = 'Name must contain only letters with no spaces';
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
            axios.post('http://localhost:3001/register', { name, email, password })
                .then(result => {
                    console.log(result);
                    navigate('/');
                })
                .catch(err => {
                    console.log(err);
                    setErrors({ submit: 'Failed to register. Please try again.' });
                });
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center bg-secondary vh-100' style={{ backgroundSize: 'cover', backgroundImage: `url(${signup})`, backgroundRepeat: 'no-repeat'}}>
            <div className='bg-white p-3 rounded w-25'>
                <img src={images1} alt="Image" style={{width:'100%', position:'relative'}} />
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='name'><strong>Name</strong></label>
                        <input 
                            type='text' 
                            placeholder='Enter Name' 
                            autoComplete='off' 
                            name='name' 
                            className='form-control rounded-0' 
                            onChange={(e) => setName(e.target.value)} 
                        />
                        {errors.name && <div className="text-danger">{errors.name}</div>}
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='email'><strong>Email</strong></label>
                        <input 
                            type='email' 
                            placeholder='Enter Email' 
                            autoComplete='off' 
                            name='email' 
                            className='form-control rounded-0' 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                        {errors.email && <div className="text-danger">{errors.email}</div>}
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='password'><strong>Password</strong></label>
                        <input 
                            type='password' 
                            placeholder='Enter Password' 
                            autoComplete='off' 
                            name='password' 
                            className='form-control rounded-0' 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        {errors.password && <div className="text-danger">{errors.password}</div>}
                    </div>
                    {errors.submit && <div className="text-danger">{errors.submit}</div>}
                    <button type='submit' className='btn btn-default border w-100 bg-success rounded-0' style={{ boxShadow:' 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'}}>Register</button>
                </form>
                <p>Already have an Account?</p>
                <Link to='/' className='btn btn-default border w-100 bg-primary rounded-0 text-decoration-none' style={{ boxShadow:' 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'}}>Login</Link>
            </div>
        </div>
    );
}

export default Signup;