// src/pages/Bed.js
import React, { useState, useEffect } from 'react';
import './bed.css';
import SearchComponent from '../../components/SearchComponent';
import ShowCourseComponent from '../../components/ShowCourseComponent';
import { Link } from 'react-router-dom';

function Bed() {
    const [beds, setBeds] = useState([]);
    const [searchBed, setSearchBed] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newBed, setNewBed] = useState({ name: '', price: '', imageUrl: '', description: '' });
    const [cartBeds, setCartBeds] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/beds')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                setBeds(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching bed data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    const handleSearchChange = (event) => {
        setSearchBed(event.target.value);
    };

    const handleNewBedChange = (event) => {
        setNewBed({ ...newBed, [event.target.name]: event.target.value });
    };

    const handleAddNewBed = (event) => {
        event.preventDefault();
        fetch('http://localhost:3001/beds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBed)
        })
        .then(response => response.json())
        .then(data => {
            console.log("New bed added: ", data);
            setBeds([...beds, data]);
            setNewBed({ name: '', price: '', imageUrl: '', description: '' });
        })
        .catch(error => console.error('Error adding bed:', error));
    };

    const deleteBedByName = (name) => {
        fetch(`http://localhost:3001/beds/${name}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setBeds(beds.filter(bed => bed.name !== name));
            } else {
                console.error('Failed to delete the bed');
            }
        })
        .catch(error => console.error('Error:', error));
        // No need to reload page; state update will handle it
    };

    const addBedToCart = (bed) => {
        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingBed = existingCart.find(item => item.product._id === bed._id);
    
        const updatedCart = existingBed
            ? existingCart.map(item =>
                item.product._id === bed._id ? { ...item, quantity: item.quantity + 1 } : item
            )
            : [...existingCart, { product: bed, quantity: 1 }];
    
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartBeds(updatedCart); // Optional if you need to maintain local state
    };
    
    

    const filteredBeds = beds.filter(bed =>
        bed.name.toLowerCase().includes(searchBed.toLowerCase())
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading data: {error.message}</div>;
    }

    return (
        <div className="App">
            <SearchComponent 
                searchCourse={searchBed} 
                courseSearchUserFunction={handleSearchChange} 
            />
            <form onSubmit={handleAddNewBed} className="add-bed-form" style={{paddingLeft:'450px'}}>
                <input
                    type="text"
                    name="name"
                    value={newBed.name}
                    onChange={handleNewBedChange}
                    placeholder="Name"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={newBed.price}
                    onChange={handleNewBedChange}
                    placeholder="Price"
                    required
                />
                <input
                    type="text"
                    name="imageUrl"
                    value={newBed.imageUrl}
                    onChange={handleNewBedChange}
                    placeholder="Image URL"
                    required
                />
               
                <button type="submit">Add Bed</button>
            </form>
            <main className="App-main">
                <ShowCourseComponent
                    courses={beds}
                    filterCourseFunction={filteredBeds}
                    addCourseToCartFunction={addBedToCart}
                    deleteCourseByName={deleteBedByName}
                />
            </main>
            <footer>
                <Link to="/cart"><p className="strong-underline" style={{ textDecorationLine: 'underline' }}>Go to Cart</p></Link>
            </footer>
        </div>
    );
}

export default Bed;
