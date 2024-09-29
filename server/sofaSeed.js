const mongoose = require('mongoose');
const Sofa = require('./model/sofa');  // Make sure the path is correct

mongoose.connect('mongodb://127.0.0.1:27017/eapp', { useNewUrlParser: true, useUnifiedTopology: true });

const sofas = [
    { name: 'Leather Sofa', price: 85000, imageUrl: '/images/sofa1.jpeg' },
    { name: 'Fabric Sofa', price: 45000, imageUrl: '/images/sofa2.jpeg' },
    { name: 'Fabric Sofa', price: 45000, imageUrl: '/images/sofa3.jpeg' },
    { name: 'Fabric Sofa', price: 45000, imageUrl: '/images/sofa4.jpeg' }
];

Sofa.insertMany(sofas)
    .then(() => {
        console.log('Sofa data inserted successfully');
        mongoose.connection.close();  // Close the connection when done
    })
    .catch(err => {
        console.error('Error inserting sofa data:', err);
        mongoose.connection.close();  // Ensure the connection is closed even on error
    });
