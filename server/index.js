const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Secrets come from the environment only (see .env.example). Never hard-code them.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Copy server/.env.example to server/.env and fill it in.');
}
const stripe = process.env.STRIPE_SECRET_KEY
    ? require('stripe')(process.env.STRIPE_SECRET_KEY)
    : null;
// Models
const eappmodel = require('./model/user');
const Bed = require('./model/bed');
const Table = require('./model/table');
const Sofa = require('./model/sofa');
const Order = require('./model/order');
const Shop = require("./model/shop");
const Product = require("./model/product");
const Favorite = require("./model/favourite");
const Cart = require("./model/cart");
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors({
    // One or more allowed frontends, comma separated.
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim().replace(/\/$/, '')),
    credentials: true
}));

const ROLE_USER = '1';
const ROLE_SELLER = '2';
const ROLE_ADMIN = '3';
const BCRYPT_ROUNDS = 10;
const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$/;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidId = (value) => typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isAdmin = (req) => String(req.user.role) === ROLE_ADMIN;
const withoutPassword = (user) => {
    const plain = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete plain.password;
    return plain;
};
function authenticateToken(req, res, next) {
    const [scheme, token] = (req.headers['authorization'] || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'No token provided'
        });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Token has expired'
            });
        }
        return res.status(403).json({
            error: 'Authentication failed',
            message: 'Invalid token'
        });
    }
}

// Only admins (role 3) may use the admin dashboard endpoints.
function requireAdmin(req, res, next) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}

// The userID in the URL or body must be the logged-in user (admins are exempt).
// When no userID is sent, the handlers fall back to the ID inside the token.
function requireSelf(req, res, next) {
    const requested = req.params.userID ?? (req.body && req.body.userID);
    if (requested !== undefined && String(requested) !== String(req.user.id) && !isAdmin(req)) {
        return res.status(403).json({ message: 'You can only access your own data' });
    }
    next();
}

// A shop may be changed only by its owner or an admin.
async function canManageShop(req, shopID) {
    if (!isValidId(shopID)) return { status: 400, message: 'A valid shop ID is required' };
    const shop = await Shop.findById(shopID);
    if (!shop) return { status: 404, message: 'Shop not found' };
    if (String(shop.userID) !== String(req.user.id) && !isAdmin(req)) {
        return { status: 403, message: 'You can only manage your own shop' };
    }
    return { shop };
}

// User Authentication Routes
app.post("/login", async (req, res) => {
    const { email, password } = req.body || {};
    // Strings only: objects such as { "$gt": "" } would otherwise reach the query.
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        return res.status(400).json("Email and password are required");
    }

    try {
        const user = await eappmodel.findOne({ email: email.trim() });
        if (!user || typeof user.password !== 'string') {
            return res.status(401).json("Invalid email or password");
        }

        let passwordMatches;
        if (BCRYPT_HASH.test(user.password)) {
            passwordMatches = await bcrypt.compare(password, user.password);
        } else {
            // Legacy account stored in plain text: verify once, then upgrade to a hash.
            passwordMatches = user.password === password;
            if (passwordMatches) {
                user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
                await user.save();
            }
        }
        if (!passwordMatches) {
            return res.status(401).json("Invalid email or password");
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" } // Token expires in 1 hour
        );
        res.json({
            message: "Success",
            role: user.role,
            loginStatus: user.firstLogin,
            userID: user.id,
            token // Send token to client
        });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json("An error occurred during login");
    }
});

app.get('/check-auth', (req, res) => {
    // Your authentication checking logic here
    res.json({ message: 'Auth check endpoint' });
});

// Stateless JWT: the client discards its token. Kept so the header's logout call succeeds.
app.post('/logout', (req, res) => {
    res.json({ message: 'Logged out' });
});

app.post("/register", async (req, res) => {
    const { name, email, password, role, phoneNumber } = req.body || {};

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || typeof password !== 'string') {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        return res.status(400).json({ message: 'Email address is invalid' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    // Self-registration can create a customer or a seller, never an admin.
    const safeRole = String(role) === ROLE_SELLER ? ROLE_SELLER : ROLE_USER;

    try {
        const existing = await eappmodel.findOne({ email: email.trim() });
        if (existing) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        const user = await eappmodel.create({
            name: name.trim(),
            email: email.trim(),
            password: await bcrypt.hash(password, BCRYPT_ROUNDS),
            phoneNumber: isNonEmptyString(phoneNumber) ? phoneNumber.trim() : undefined,
            role: safeRole,
            firstLogin: true
        });
        res.status(201).json(withoutPassword(user));
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'An error occurred during registration' });
    }
});

app.delete('/logins/:email', authenticateToken, async (req, res) => {
    const email = req.params.email;
    try {
        // Only the account owner or an admin may delete an account.
        const self = await eappmodel.findById(req.user.id);
        if (!isAdmin(req) && (!self || self.email !== email)) {
            return res.status(403).json({ message: 'You can only delete your own account' });
        }
    } catch (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: 'An error occurred while deleting the user' });
    }
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

app.post('/beds', authenticateToken, (req, res) => {
    const { name, price, imageUrl, description } = req.body;
    Bed.create({ name, price, imageUrl, description })
        .then(bed => res.status(201).json(bed))
        .catch(err => {
            console.error('Error creating bed:', err);
            res.status(500).json({ error: 'Failed to create bed' });
        });
});

app.delete('/beds/:name', authenticateToken, (req, res) => {
    const name = req.params.name;
    Bed.deleteOne({ name: name })
        .then(result => {
            if (result.deletedCount === 1) {
                res.json({ success: true, message: 'Bed deleted successfully' });
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

app.post('/sofas', authenticateToken, (req, res) => {
    const { name, price, imageUrl, description } = req.body;
    Sofa.create({ name, price, imageUrl, description })
        .then(sofa => res.status(201).json(sofa))
        .catch(err => {
            console.error('Error creating sofa:', err);
            res.status(500).json({ error: 'Failed to create sofa' });
        });
});

app.delete('/sofas/:name', authenticateToken, (req, res) => {
    const name = req.params.name;
    Sofa.deleteOne({ name: name })
        .then(result => {
            if (result.deletedCount === 1) {
                res.json({ success: true, message: 'Sofa deleted successfully' });
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

app.post('/tables', authenticateToken, (req, res) => {
    const { name, price, imageUrl, description } = req.body;
    Table.create({ name, price, imageUrl, description })
        .then(table => res.status(201).json(table))
        .catch(err => {
            console.error('Error creating table:', err);
            res.status(500).json({ error: 'Failed to create table' });
        });
});

app.delete('/tables/:name', authenticateToken, (req, res) => {
    const name = req.params.name;
    Table.deleteOne({ name: name })
        .then(result => {
            if (result.deletedCount === 1) {
                res.json({ success: true, message: 'Table deleted successfully' });
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
app.post('/search', async (req, res) => {
    const { query, category } = req.body || {};
    const hasCategory = isNonEmptyString(category) && category !== "All Categories";

    try {
        if (hasCategory) {
            const products = await Product.find({ category: { $regex: escapeRegex(category), $options: 'i' } });
            return res.json(products);
        }

        // User input is escaped so "(" or "*" cannot break or abuse the regex.
        const term = typeof query === 'string' ? escapeRegex(query.trim()) : '';
        let products = await Product.find({ productName: { $regex: term, $options: 'i' } });
        if (products.length === 0) {
            products = await Product.find({ category: { $regex: term, $options: 'i' } });
        }
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Order Routes
app.post('/orders', authenticateToken, async (req, res) => {
    // Payment and fulfilment state is decided by the server, never by the client.
    const { paymentStatus, paymentDate, status, userID, ...orderDetails } = req.body || {};

    try {
        let payment = { paymentStatus: 'pending' };

        if (orderDetails.paymentIntentID) {
            if (!stripe) {
                return res.status(503).json({ message: 'Card payments are not configured.' });
            }
            if (typeof orderDetails.paymentIntentID !== 'string') {
                return res.status(400).json({ message: 'Invalid payment reference.' });
            }
            const alreadyUsed = await Order.findOne({ paymentIntentID: orderDetails.paymentIntentID });
            if (alreadyUsed) {
                return res.status(409).json({ message: 'This payment has already been used for an order.' });
            }
            let intent;
            try {
                intent = await stripe.paymentIntents.retrieve(orderDetails.paymentIntentID);
            } catch (stripeError) {
                return res.status(402).json({ message: 'Payment could not be verified.' });
            }
            if (!intent || intent.status !== 'succeeded') {
                return res.status(402).json({ message: 'Payment has not been completed.' });
            }
            payment = { paymentStatus: 'paid', paymentDate: new Date() };
        }

        const newOrder = new Order({ ...orderDetails, ...payment });
        await newOrder.save();

        // Clear only the cart of the logged-in user (ID from the token, not the body).
        await Cart.deleteMany({ userID: String(req.user.id) });

        res.status(201).json({ 
            message: 'Order placed successfully.',
            order: newOrder
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

app.delete('/clearcart', authenticateToken, requireSelf, async (req, res) => {
    try {
        // Always scoped to the token's user: an empty filter would wipe every cart.
        await Cart.deleteMany({ userID: String(req.user.id) });
        res.status(200).json({ message: 'Cart cleared successfully.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'),
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Allowed formats
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: Only images (jpeg, jpg, png, gif) are allowed!')); // Error message
        }
    }
}).single('profilePicture');

// Shop Registration Route with Authentication and Error Handling
app.post('/createshop', authenticateToken, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ error: 'File upload error', details: err.message });
        }

        try {
            const { shopName, street, city, productCategories } = req.body;
            // The shop always belongs to the logged-in user.
            const userID = String(req.user.id);
            if (req.body.userID && String(req.body.userID) !== userID && !isAdmin(req)) {
                return res.status(403).json({ error: 'You can only create a shop for your own account' });
            }
            if (![shopName, street, city, productCategories].every(isNonEmptyString)) {
                return res.status(400).json({ error: 'Shop name, street, city and product categories are required' });
            }
            const profilePicture = req.file ? path.join('uploads', req.file.filename) : null;

            // Ensure userID is saved with the shop data
            const shop = await Shop.create({ shopName, street, city, productCategories, profilePicture, userID });

            // After shop creation, update the firstLogin status in the user model
            const updatedUser = await eappmodel.findByIdAndUpdate(userID, { firstLogin: false }, { new: true });

            res.status(201).json({
                message: 'Shop created successfully',
                shop: shop,
                updatedUser: updatedUser
            });
        } catch (err) {
            console.error('Failed to create shop or update firstLogin:', err);
            res.status(500).json({ error: 'Server error occurred', details: err.message });
        }
    });
});


app.post("/searchedProduct", (req, res) => {
    const { searchTerm } = req.body;

    if (!isNonEmptyString(searchTerm)) {
        return res.status(400).json({ error: "Search term is required" });
    }

    Product.find({ category: { $regex: escapeRegex(searchTerm), $options: "i" } })
        .then(products => {
            res.status(200).json({ products });
        })
        .catch(err => {
            console.error('Failed to fetch shops:', err);
            res.status(500).json({ error: 'Failed to fetch shops', details: err });
        });
});

app.post("/shop", authenticateToken, (req, res) => {
    const { userID, shopID } = req.body;

    if (!userID && !shopID) {
        return res.status(400).json({ error: "Either User ID or Shop ID is required" });
    }

    // If shopID is provided, find the shop by shopID
    if (shopID) {
        if (!isValidId(shopID)) {
            return res.status(400).json({ error: "Shop ID is invalid" });
        }
        Shop.findById(shopID)
            .then(shop => {
                if (!shop) {
                    return res.status(404).json({ message: "Shop not found." });
                }
                res.status(200).json({ shop });
            })
            .catch(err => {
                console.error('Failed to fetch shop:', err);
                res.status(500).json({ error: 'Failed to fetch shop', details: err });
            });
    } else if (userID) {
        // If userID is provided, find shops by userID
        Shop.find({ userID: userID })
            .then(shops => {
                if (shops.length === 0) {
                    return res.status(404).json({ message: "No shops found for this user." });
                }
                res.status(200).json({ shops });
            })
            .catch(err => {
                console.error('Failed to fetch shops:', err);
                res.status(500).json({ error: 'Failed to fetch shops', details: err });
            });
    }
});



const muiltFiles = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB per image
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Allowed formats
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).array('productImages', 5);

app.post('/createproduct',authenticateToken, (req, res) => {
    muiltFiles(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || err });
        }

        // Access product details from the form
        const { productName, category, price, shopID } = req.body;

        // Ensure required fields are provided
        if (!productName || !category || !price || !shopID) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({ error: 'Price must be a positive number.' });
        }

        try {
            const access = await canManageShop(req, shopID);
            if (!access.shop) {
                return res.status(access.status).json({ error: access.message });
            }
        } catch (lookupError) {
            return res.status(500).json({ error: 'Failed to create product' });
        }

        // Handle uploaded files
        let productImages = [];
        if (req.files) {
            productImages = req.files.map(file => file.filename);
        }

        // Create a new product instance
        const newProduct = new Product({
            productName,
            category,
            price,
            shopID,
            images: productImages // Save image filenames in the database
        });

        // Save the product to the database
        newProduct.save()
            .then(product => res.status(201).json({ message: 'Product created successfully!', product }))
            .catch(err => res.status(500).json({ error: 'Failed to create product', details: err }));
    });
});

// Add this endpoint to your existing code

app.post('/productsByShop', (req, res) => {
    const { shopID } = req.body;

    // Check if shopID is provided
    if (!isValidId(shopID)) {
        return res.status(400).json({ error: "Shop ID is required" });
    }

    // Find all products associated with the given shopID
    Product.find({ shopID: shopID })
        .then(products => {
            if (products.length === 0) {
                return res.status(404).json({ message: "No products found for this shop." });
            }
            res.status(200).json({ products });
        })
        .catch(err => {
            console.error('Failed to fetch products:', err);
            res.status(500).json({ error: 'Failed to fetch products', details: err });
        });
});
app.post('/create-payment-intent', authenticateToken, async (req, res) => {
    try {
        const amount = Number(req.body && req.body.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'A positive amount is required' });
        }
        if (!stripe) {
            return res.status(503).json({ error: 'Card payments are not configured' });
        }
        
        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to cents
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
                integration_check: 'accept_a_payment',
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: amount
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ 
            error: 'Failed to create payment intent',
            details: error.message 
        });
    }
});

app.post('/favorite', authenticateToken, requireSelf, async (req, res) => {
    const { userID, productID, productName, category, price, images, shopName, address } = req.body;

    if (!userID || !productID) {
        return res.status(400).json({ error: 'userID and productID are required' });
    }

    try {
        const existingFavorite = await Favorite.findOne({ 
            userID, 
            'product.productID': productID 
        });

        if (existingFavorite) {
            await Favorite.deleteOne({ _id: existingFavorite._id });
            return res.status(200).json({ message: 'Favorite product removed successfully!' });
        } else {
            const newFavorite = new Favorite({
                userID,
                product: {
                    productID,
                    productName,
                    category,
                    price,
                    images,
                    shopName,
                    address
                }
            });
            await newFavorite.save();
            return res.status(201).json({ message: 'Favorite product added successfully!' });
        }

    } catch (error) {
        console.error('Error handling favorite product:', error);
        return res.status(500).json({ error: 'Failed to toggle favorite product', details: error });
    }
});

app.post('/checkFavorite', authenticateToken, requireSelf, async (req, res) => {
    const { userID, productID } = req.body;

    if (!userID || !productID) {
        return res.status(400).json({ error: 'userID and productID are required' });
    }

    try {
        const existingFavorite = await Favorite.findOne({ 
            userID, 
            'product.productID': productID 
        });

        if (existingFavorite) {
            return res.status(200).json({ isFavorite: true });
        } else {
            return res.status(200).json({ isFavorite: false });
        }

    } catch (error) {
        console.error('Error checking favorite:', error);
        return res.status(500).json({ error: 'Failed to check favorite status', details: error });
    }
});

app.get('/favorites/:userID', authenticateToken, requireSelf, async (req, res) => {
    const { userID } = req.params;
    try {
        const favorites = await Favorite.find({ userID });
        res.status(200).json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorite products' });
    }
});

app.post('/addToCart', authenticateToken, requireSelf, async (req, res) => {
    const { userID, productID, productName, category, price, images, shopName, address } = req.body;

    if (!userID || !productID) {
        return res.status(400).json({ error: 'User ID and Product ID are required.' });
    }

    try {
        // Check if cart already exists for the user
        let cart = await Cart
            .findOne({ userID });

        // If cart doesn't exist, create a new one
        if (!cart) {
            cart = new Cart({ userID, products: [] });
        }

        // Check if the product already exists in the cart
        const existingProductIndex = cart.products.findIndex(product => product.productID.toString() === productID);

        // Save first, then answer: a failed save must not be reported as success.
        if (existingProductIndex !== -1) {
            // Product exists, remove it from the cart
            cart.products.splice(existingProductIndex, 1);
            await cart.save();
            return res.status(200).json({ message: 'Product removed from cart successfully!' });
        }

        // Product does not exist, add it to the cart
        cart.products.push({ productID, productName, category, price, images, shopName, address });
        await cart.save();
        return res.status(201).json({ message: 'Product added to cart successfully!' });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ error: 'Product details are incomplete or invalid.' });
        }
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Failed to update cart.' });
    }
});

app.post('/checkInCart', authenticateToken, requireSelf, async (req, res) => {
    const { userID, productID } = req.body;

    if (!userID || !productID) {
        return res.status(400).json({ error: 'User ID and Product ID are required.' });
    }

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userID });

        if (cart) {
            // Check if the product exists in the cart
            const productExists = cart.products.some(product => product.productID.toString() === productID);
            return res.status(200).json({ isInCart: productExists });
        } else {
            return res.status(200).json({ isInCart: false });
        }
    } catch (error) {
        console.error('Error checking cart:', error);
        res.status(500).json({ error: 'Failed to check cart status.' });
    }
});

app.get('/cart/:userID', authenticateToken, requireSelf, async (req, res) => {
    const { userID } = req.params;

    try {
        // Fetch the cart items for the given userID
        const cart = await Cart.findOne({ userID });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        // Transform the response to include the full product details
        const cartWithProducts = {
            ...cart.toObject(),
            products: cart.products.map(product => ({
                productID: product.productID,
                productName: product.productName,
                category: product.category,
                price: product.price,
                images: product.images,
                shopName: product.shopName,
                address: product.address,
                _id: product._id
            }))
        };

        res.json(cartWithProducts);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

app.delete('/cart/:userID/remove/:productID', authenticateToken, requireSelf, async (req, res) => {
    const { userID, productID } = req.params;

    try {
        const cart = await Cart.findOne({ userID });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        // Remove the product from the cart
        cart.products = cart.products.filter(product => product.productID.toString() !== productID);
        await cart.save();

        res.json({ message: 'Product removed from cart successfully.', cart });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

app.delete('/deleteProduct', authenticateToken, async (req, res) => {
    const { id } = req.body; // Get the ID from the request body

    if (!isValidId(id)) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Only the shop owner or an admin may delete a product.
        const access = await canManageShop(req, String(product.shopID));
        if (!access.shop && !isAdmin(req)) {
            return res.status(access.status).json({ message: access.message });
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Add this endpoint for updating shop details
app.put('/updateShop', authenticateToken, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ error: 'File upload error', details: err.message });
        }

        try {
            const { shopID, shopName, street, city, productCategories } = req.body;

            const access = await canManageShop(req, shopID);
            if (!access.shop) {
                return res.status(access.status).json({ error: access.message });
            }
            
            // Create update object
            const updateData = {
                shopName,
                street,
                city,
                productCategories
            };

            // If a new profile picture was uploaded, add it to the update
            if (req.file) {
                updateData.profilePicture = path.join('uploads', req.file.filename);
            }

            // Find and update the shop
            const updatedShop = await Shop.findByIdAndUpdate(
                shopID,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedShop) {
                return res.status(404).json({ error: 'Shop not found' });
            }

            res.status(200).json({
                message: 'Shop updated successfully',
                shop: updatedShop
            });

        } catch (err) {
            console.error('Failed to update shop:', err);
            res.status(500).json({ 
                error: 'Server error occurred', 
                details: err.message 
            });
        }
    });
});

// Add this endpoint to get shop details
app.get('/shop/:shopID', authenticateToken, async (req, res) => {
    try {
        if (!isValidId(req.params.shopID)) {
            return res.status(400).json({ error: 'Shop ID is invalid' });
        }
        const shop = await Shop.findById(req.params.shopID);
        
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        res.status(200).json({ shop });
    } catch (err) {
        console.error('Failed to fetch shop:', err);
        res.status(500).json({ 
            error: 'Server error occurred', 
            details: err.message 
        });
    }
});

// Get user details
app.get('/user/:userID', authenticateToken, async (req, res) => {
    try {
        if (!isValidId(req.params.userID)) {
            return res.status(400).json({ message: 'User ID is invalid' });
        }
        const user = await eappmodel.findById(req.params.userID, '-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

// Update user details (only name and phone number)
app.put('/user/:userID', authenticateToken, requireSelf, async (req, res) => {
    try {
        const { name, phoneNumber } = req.body;
        
        // Only allow updating name and phone number
        const updateData = {};
        if (name) updateData.name = name;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        const updatedUser = await eappmodel.findByIdAndUpdate(
            req.params.userID,
            updateData,
            { new: true, select: '-password' } // Return updated document without password
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

// Add this new endpoint for updating profile picture
app.put('/user/:userID/profile-picture', authenticateToken, requireSelf, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ message: 'File upload error', details: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = await eappmodel.findById(req.params.userID);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If there's an existing profile picture, delete it
      if (user.profilePicture) {
        const oldPicturePath = path.join(__dirname, user.profilePicture);
        fs.unlink(oldPicturePath, (err) => {
          if (err) console.error('Error deleting old profile picture:', err);
        });
      }

      // Update user with new profile picture
      user.profilePicture = path.join('uploads', req.file.filename);
      await user.save();

      res.status(200).json({
        message: 'Profile picture updated successfully',
        profilePicture: user.profilePicture
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      res.status(500).json({ message: 'Server error occurred' });
    }
  });
});

// Get all users with pagination
app.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await eappmodel
            .find({}, '-password') // Exclude password from response
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        const total = await eappmodel.countDocuments();

        res.status(200).json({
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

// Update user role
app.put('/users/:userID/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const role = String(req.body && req.body.role);
        if (![ROLE_USER, ROLE_SELLER, ROLE_ADMIN].includes(role)) {
            return res.status(400).json({ message: 'Role must be 1 (user), 2 (seller) or 3 (admin)' });
        }
        if (!isValidId(req.params.userID)) {
            return res.status(400).json({ message: 'User ID is invalid' });
        }
        const updatedUser = await eappmodel.findByIdAndUpdate(
            req.params.userID,
            { role },
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User role updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

// Delete user
app.delete('/users/:userID', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const deletedUser = await eappmodel.findByIdAndDelete(req.params.userID);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

// Get all orders
app.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

// Update order status
app.put('/orders/:orderId/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'In Progress', 'Delivered'].includes(status)) {
            return res.status(400).json({ message: 'Status must be Pending, In Progress or Delivered' });
        }
        if (!isValidId(req.params.orderId)) {
            return res.status(400).json({ message: 'Order ID is invalid' });
        }
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

// Get all shops
app.get('/shops', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const shops = await Shop.find().sort({ createdAt: -1 });
        res.status(200).json(shops);
    } catch (error) {
        console.error('Error fetching shops:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

// Add this endpoint for updating product details
app.put('/updateProduct', authenticateToken, (req, res) => {
    muiltFiles(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || err });
        }

        try {
            const { productID, existingImages } = req.body;
            const updateData = {};

            if (!isValidId(productID)) {
                return res.status(400).json({ error: 'Product ID is required' });
            }
            const existingProduct = await Product.findById(productID);
            if (!existingProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }
            const access = await canManageShop(req, String(existingProduct.shopID));
            if (!access.shop && !isAdmin(req)) {
                return res.status(access.status).json({ error: access.message });
            }

            // Update basic product information if provided
            if (req.body.productName) updateData.productName = req.body.productName;
            if (req.body.category) updateData.category = req.body.category;
            if (req.body.price) updateData.price = req.body.price;

            // Handle images
            let images = [];
            
            // Parse existingImages if it's a string
            if (typeof existingImages === 'string') {
                try {
                    images = JSON.parse(existingImages);
                } catch (e) {
                    images = existingImages.split(',').filter(img => img.trim());
                }
            } else if (Array.isArray(existingImages)) {
                images = existingImages;
            }

            // Add new uploaded images
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => file.filename);
                images = [...images, ...newImages];
            }
            
            // Update images only if we have any
            if (images.length > 0) {
                updateData.images = images;
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                productID,
                updateData,
                { new: true }
            );

            if (!updatedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.status(200).json({
                message: 'Product updated successfully',
                product: updatedProduct
            });

        } catch (err) {
            console.error('Failed to update product:', err);
            res.status(500).json({ 
                error: 'Server error occurred', 
                details: err.message 
            });
        }
    });
});

// Delete a favorite item
app.delete('/favorites/:favoriteId', authenticateToken, async (req, res) => {
    try {
        if (!isValidId(req.params.favoriteId)) {
            return res.status(400).json({ message: 'Favorite ID is invalid' });
        }
        const favorite = await Favorite.findById(req.params.favoriteId);
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite item not found' });
        }
        if (String(favorite.userID) !== String(req.user.id) && !isAdmin(req)) {
            return res.status(403).json({ message: 'You can only remove your own favorites' });
        }
        const deletedFavorite = await Favorite.findByIdAndDelete(req.params.favoriteId);

        res.status(200).json({ 
            message: 'Favorite item removed successfully',
            deletedFavorite 
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

// Unknown routes and malformed request bodies answer in JSON, not HTML stack traces.
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Request body is not valid JSON' });
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Server error occurred' });
});

async function start() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('MONGO_URI is not set. Copy server/.env.example to server/.env and fill it in.');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }

    if (process.env.SEED_DEMO === 'true') {
        try {
            await require('./seedDemo').seedDemo();
        } catch (err) {
            console.error('Demo seed failed:', err.message);
        }
    }

    const port = Number(process.env.PORT) || 3001;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

// Tests import the app without opening a database connection or a port.
if (require.main === module) {
    start();
}

module.exports = app;
