import React, { useState, useEffect } from 'react';
import './bed.css';
import SearchComponent from '../../components/SearchComponent';
import ShowCourseComponent from '../../components/ShowCourseComponent';
import { Link } from 'react-router-dom';

function Sofa() {
    const [sofas, setSofas] = useState([]);
    const [searchSofa, setSearchSofa] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newSofa, setNewSofa] = useState({ name: '', price: '', imageUrl: '', description: '' });

    useEffect(() => {
        fetch('http://localhost:3001/sofas')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                setSofas(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching sofa data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    const handleSearchChange = (event) => {
        setSearchSofa(event.target.value);
    };

    const handleNewSofaChange = (event) => {
        setNewSofa({ ...newSofa, [event.target.name]: event.target.value });
    };

    const handleAddNewSofa = (event) => {
        event.preventDefault();
        fetch('http://localhost:3001/sofas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSofa)
        })
        .then(response => response.json())
        .then(data => {
            setSofas([...sofas, data]);
            setNewSofa({ name: '', price: '', imageUrl: '', description: '' });
        })
        .catch(error => console.error('Error adding sofa:', error));
    };

    const deleteSofaByName = (name) => {
        fetch(`http://localhost:3001/sofas/${name}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setSofas(sofas.filter(sofa => sofa.name !== name));
            } else {
                console.error('Failed to delete the sofa');
            }
        })
        .catch(error => console.error('Error:', error));
    };

    const addSofaToCart = (sofa) => {
        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingSofa = existingCart.find(item => item.product._id === sofa._id);
    
        const updatedCart = existingSofa
            ? existingCart.map(item =>
                item.product._id === sofa._id ? { ...item, quantity: item.quantity + 1 } : item
            )
            : [...existingCart, { product: sofa, quantity: 1 }];
    
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const filteredSofas = sofas.filter(sofa =>
        sofa.name.toLowerCase().includes(searchSofa.toLowerCase())
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
                searchCourse={searchSofa} 
                courseSearchUserFunction={handleSearchChange} 
            />
            <form onSubmit={handleAddNewSofa} className="add-sofa-form" style={{ paddingLeft: '450px' }}>
                <input
                    type="text"
                    name="name"
                    value={newSofa.name}
                    onChange={handleNewSofaChange}
                    placeholder="Name"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={newSofa.price}
                    onChange={handleNewSofaChange}
                    placeholder="Price"
                    required
                />
                <input
                    type="text"
                    name="imageUrl"
                    value={newSofa.imageUrl}
                    onChange={handleNewSofaChange}
                    placeholder="Image URL"
                    required
                />
               
                <button type="submit">Add Sofa</button>
            </form>
            <main className="App-main">
                <ShowCourseComponent
                    courses={filteredSofas}
                    filterCourseFunction={filteredSofas}
                    addCourseToCartFunction={addSofaToCart} // Pass the function to the component
                    deleteCourseByName={deleteSofaByName}
                />
            </main>
            <footer>
                <Link to="/cart"><p className="strong-underline" style={{ textDecorationLine: 'underline' }}>Go to Cart</p></Link>
            </footer>
        </div>
    );
}

export default Sofa;
