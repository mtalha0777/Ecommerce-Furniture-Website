import React, { useState, useEffect } from 'react';
import './bed.css';  // Assuming you have a separate CSS file for tables
import ShowCourseComponent from '../../components/ShowCourseComponent';  // Component to display tables
import SearchComponent from '../../components/SearchComponent';
import { Link } from 'react-router-dom';

function Table() {
    const [tables, setTables] = useState([]);
    const [searchTable, setSearchTable] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTable, setNewTable] = useState({ name: '', price: '', imageUrl: '', description: '' });

    useEffect(() => {
        fetch('http://localhost:3001/tables')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                setTables(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching table data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    const addTableToCart = (table) => {
        // Retrieve existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
        // Check if table is already in the cart
        const existingTable = existingCart.find(item => item.product._id === table._id);
        
        const updatedCart = existingTable
            ? existingCart.map(item =>
                item.product._id === table._id ? { ...item, quantity: item.quantity + 1 } : item
            )
            : [...existingCart, { product: table, quantity: 1 }];

        // Save the updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        console.log('Cart updated:', updatedCart);
    };

    const deleteTableByName = (name) => {
        fetch(`http://localhost:3001/tables/${name}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setTables(tables.filter(table => table.name !== name));
            } else {
                console.error('Failed to delete the table');
            }
        })
        .catch(error => console.error('Error:', error));
    };

    const handleSearchChange = (event) => {
        setSearchTable(event.target.value);
    };

    const handleNewTableChange = (event) => {
        setNewTable({ ...newTable, [event.target.name]: event.target.value });
    };

    const handleAddNewTable = (event) => {
        event.preventDefault();
        fetch('http://localhost:3001/tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTable)
        })
        .then(response => response.json())
        .then(data => {
            setTables([...tables, data]);
            setNewTable({ name: '', price: '', imageUrl: '', description: '' });
        })
        .catch(error => console.error('Error adding table:', error));
    };

    const filteredTables = tables.filter(table =>
        table.name.toLowerCase().includes(searchTable.toLowerCase())
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
                searchCourse={searchTable} 
                courseSearchUserFunction={handleSearchChange} 
            />
            <form onSubmit={handleAddNewTable} className="add-table-form" style={{ paddingLeft: '450px' }}>
                <input
                    type="text"
                    name="name"
                    value={newTable.name}
                    onChange={handleNewTableChange}
                    placeholder="Name"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={newTable.price}
                    onChange={handleNewTableChange}
                    placeholder="Price"
                    required
                />
                <input
                    type="text"
                    name="imageUrl"
                    value={newTable.imageUrl}
                    onChange={handleNewTableChange}
                    placeholder="Image URL"
                    required
                />
                <textarea
                    name="description"
                    value={newTable.description}
                    onChange={handleNewTableChange}
                    placeholder="Description"
                />
                <button type="submit">Add Table</button>
            </form>
            <main className="App-main">
                <ShowCourseComponent
                    courses={filteredTables}
                    filterCourseFunction={filteredTables}
                    addCourseToCartFunction={addTableToCart}
                    deleteCourseByName={deleteTableByName}
                />
            </main>
            <footer>
                <Link to="/cart"><p className="strong-underline" style={{ textDecorationLine: 'underline' }}>Go to Cart</p></Link>
            </footer>
        </div>
    );
}

export default Table;
