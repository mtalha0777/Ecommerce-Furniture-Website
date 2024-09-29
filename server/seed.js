const mongoose = require('mongoose');
const Bed = require('./model/bed');  // Make sure the path is correct

mongoose.connect("mongodb://127.0.0.1:27017/eapp", { useNewUrlParser: true, useUnifiedTopology: true });

const beds = [
    { name: 'Cushion-01', price: 74000, imageUrl: '/images/bed.webp' },
    { name: 'Wooden-01', price: 56099, imageUrl: '/images/bed2.jpeg' },
    { name: 'Rounded-Cushion-01', price: 97000, imageUrl: '/images/bed3.jpeg' },
    { name: 'Cushion-02', price: 82000, imageUrl: '/images/bed4.jpeg' },
    { name: 'Wooden-02', price: 48000, imageUrl: '/images/bed5.jpeg' },
    { name: 'Rounded-Cushion-02', price: 110000, imageUrl: '/images/bed6.jpeg' },
    { name: 'Cushion-03', price: 77000, imageUrl: '/images/bed7.jpeg' }
];

Bed.insertMany(beds)
    .then(() => {
        console.log('Bed data inserted successfully');
        mongoose.connection.close();  // Close the connection when done
    })
    .catch(err => {
        console.error('Error inserting bed data:', err);
        mongoose.connection.close();  // Ensure the connection is closed even on error
    });


    