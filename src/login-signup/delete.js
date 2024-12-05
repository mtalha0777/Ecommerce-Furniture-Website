import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link} from 'react-router-dom';
import images1 from './images1.jpeg';
import signup from './signup.jpeg';

function Del() {
    const [email, setEmail] = useState('');

    const handleDelete = (e) => {
        e.preventDefault();
        axios.delete(`http://localhost:3001/login/${email}`)
            .then(response => {
                console.log(response.data);
                alert('Account deleted successfully.');
            })
            .catch(err => {
                console.error(err);
                alert('Error deleting account.');
            });
    };

    return (
        <div className='d-flex justify-content-center align-items-center bg-secondary vh-100' style={{ backgroundSize: 'cover', backgroundImage: `url(${signup})`, backgroundRepeat: 'no-repeat' }}>
            <div className='bg-white p-3 rounded w-25'>
                <img src={images1} alt="Image" style={{ width: '100%', position: 'relative' }} />
                <h2>Delete Account</h2>
                <form onSubmit={handleDelete}>
                    <div className='mb-3'>
                        <label htmlFor='email'><strong>Email</strong></label>
                        <input type='email' placeholder='Enter Email' autoComplete='off' name='email' className='form-control rounded-0' onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button type='submit' className='btn btn-danger w-100 mt-2'>Delete Account</button>
                    <Link to='/signup' className='btn btn-default border w-100 mt-1 bg-success rounded-0 text-decoration-none ' style={{boxShadow:'0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'}}>Sign Up</Link>
                    <Link to='/' className='btn btn-default border w-100 mt-1 bg-primary rounded-0 text-decoration-none' style={{boxShadow:'0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'}}>Sign in</Link>
              
                </form>

            </div>
        </div>
    );
}

export default Del;
