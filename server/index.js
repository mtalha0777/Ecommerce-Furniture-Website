const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Models
const eappmodel = require('./model/eapp');
const Bed = require('./model/bed');
const Table = require('./model/table');
const Sofa = require('./model/sofa');
const Order = require('./model/Order');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/eapp", { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log("Connected to MongoDB");
});

// User Authentication Routes
app.post("/logins", (req, res) => {
    const { email, password } = req.body;
    eappmodel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json("Success");
                } else {
                    res.status(400).json("Password is incorrect");
                }
            } else {
                res.status(404).json("Email is incorrect");
            }
        })
        .catch(err => {
            console.error("Error occurred while logging in:", err);
            res.status(500).json("An error occurred while processing your request");
        });
});

app.get('/check-auth', (req, res) => {
    // Your authentication checking logic here
    res.json({ message: 'Auth check endpoint' });
});

app.post("/register", (req, res) => {
    eappmodel.create(req.body)
        .then(eapp => res.status(201).json(eapp))
        .catch(err => res.status(500).json(err));
});

app.delete('/logins/:email', (req, res) => {
    const email = req.params.email;
    eappmodel.deleteOne({ email: email })
        .then(result => {
            if (result.deletedCount === 1) {
                res.json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        })
        .catch(err => {
            console.error("Error deleting user:", err);
            res.status(500).json({ message: 'An error occurred while deleting the user' });
        });
});

// Bed Routes
app.get('/beds', (req, res) => {
    Bed.find()
        .then(beds => res.json(beds))
        .catch(err => {
            console.error('Error fetching beds:', err);
            res.status(500).json({ error: 'Failed to fetch beds' });
        });
});

app.post('/beds', (req, res) => {
    const { name, price, imageUrl, description } = req.body;
    Bed.create({ name, price, imageUrl, description })
        .then(bed => res.status(201).json(bed))
        .catch(err => {
            console.error('Error creating bed:', err);
            res.status(500).json({ error: 'Failed to create bed' });
        });
});

app.delete('/beds/:name', (req, res) => {
    const name = req.params.name;
    Bed.deleteOne({ name: name })
        .then(result => {
            if (result.deletedCount === 1) {
                res.json({ message: 'Bed deleted successfully' });
            } else {
                res.status(404).json({ message: 'Bed not found' });
            }
        })
        .catch(err => {
            console.error('Error deleting bed:', err);
            res.status(500).json({ error: 'Failed to delete bed' });
        });
});

// Sofa Routes
app.get('/sofas', (req, res) => {
    Sofa.find()
        .then(sofas => res.json(sofas))
        .catch(err => {
            console.error('Error fetching sofas:', err);
            res.status(500).json({ error: 'Failed to fetch sofas' });
        });
});

app.post('/sofas', (req, res) => {
    const { name, price, imageUrl, description } = req.body;
    Sofa.create({ name, price, imageUrl, description })
        .then(sofa => res.status(201).json(sofa))
        .catch(err => {
            console.error('Error creating sofa:', err);
            res.status(500).json({ error: 'Failed to create sofa' });
        });
});

app.delete('/sofas/:name', (req, res) => {
    const name = req.params.name;
    Sofa.deleteOne({ name: name })
        .then(result => {
            if (result.deletedCount === 1) {
                res.json({ message: 'Sofa deleted successfully' });
            } else {
                res.status(404).json({ message: 'Sofa not found' });
            }
        })
        .catch(err => {
            console.error('Error deleting sofa:', err);
            res.status(500).json({ error: 'Failed to delete sofa' });
        });
});

// Table Routes
app.get('/tables', (req, res) => {
    Table.find()
        .then(tables => res.json(tables))
        .catch(err => {
            console.error('Error fetching tables:', err);
            res.status(500).json({ error: 'Failed to fetch tables' });
        });
});

app.post('/tables', (req, res) => {
    const { name, price, imageUrl, description } = req.body;
    Table.create({ name, price, imageUrl, description })
        .then(table => res.status(201).json(table))
        .catch(err => {
            console.error('Error creating table:', err);
            res.status(500).json({ error: 'Failed to create table' });
        });
});

app.delete('/tables/:name', (req, res) => {
    const name = req.params.name;
    Table.deleteOne({ name: name })
        .then(result => {
            if (result.deletedCount === 1) {
                res.json({ message: 'Table deleted successfully' });
            } else {
                res.status(404).json({ message: 'Table not found' });
            }
        })
        .catch(err => {
            console.error('Error deleting table:', err);
            res.status(500).json({ error: 'Failed to delete table' });
        });
});

// Search Route
app.get('/search', async (req, res) => {
    const { query } = req.query; // Get search query from request

    try {
        const beds = await Bed.find({ name: new RegExp(query, 'i') }).exec();
        const sofas = await Sofa.find({ name: new RegExp(query, 'i') }).exec();
        const tables = await Table.find({ name: new RegExp(query, 'i') }).exec();

        let category = '';
        let results = [];

        if (beds.length > 0) {
            category = 'bed';
            results = beds;
        } else if (sofas.length > 0) {
            category = 'sofa';
            results = sofas;
        } else if (tables.length > 0) {
            category = 'table';
            results = tables;
        }

        if (results.length > 0) {
            res.json({ category, results });
        } else {
            res.status(404).json({ message: 'No results found' });
        }
    } catch (err) {
        console.error('Error performing search:', err);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

// Order Routes
app.post('/api/orders', (req, res) => {
    const newOrder = new Order(req.body);
    newOrder.save()
        .then(() => res.status(201).json({ message: 'Order created successfully' }))
        .catch(err => {
            console.error('Error creating order:', err);
            res.status(500).json({ error: 'Failed to create order' });
        });
});

// Server setup
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
