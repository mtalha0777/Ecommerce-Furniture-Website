const mongoose = require('mongoose');
const Table = require('./model/table');  // Make sure the path is correct

mongoose.connect('mongodb://127.0.0.1:27017/eapp', { useNewUrlParser: true, useUnifiedTopology: true });

const tables = [
    { name: 'Wooden Dining Table', price: 65000, imageUrl: '/images/table1.jpeg', description: 'Elegant wooden dining table.' },
    { name: 'Glass Coffee Table', price: 25000, imageUrl: '/images/table2.jpeg', description: 'Modern glass coffee table.' }
];

Table.insertMany(tables)
    .then(() => {
        console.log('Table data inserted successfully');
        mongoose.connection.close();  // Close the connection when done
    })
    .catch(err => {
        console.error('Error inserting table data:', err);
        mongoose.connection.close();  // Ensure the connection is closed even on error
    });
