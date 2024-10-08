const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const path = require('path');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Models
const eappmodel = require('./model/eapp');
const Bed = require('./model/bed');
const Table = require('./model/table');
const Sofa = require('./model/sofa');
const Order = require('./model/order');
const Shop = require("./model/shop");
const product = require("./model/product");
const Product = require("./model/product");
const Favorite = require("./model/favourite");
const Cart = require("./model/cart");

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// MongoDB connection
const mongoUri = "mongodb+srv://farhanalibhatti785:12345@cluster0.mwimt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

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
                    res.json({
                        message: "Success",
                        role: user.role,
                        loginStatus: user.firstLogin,
                        userID: user.id
                    });
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
    req.body.firstLogin = true;
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
app.post('/search', async (req, res) => {
    const { query, category } = req.body;
    try {
        if(category === "All Categories"){

            let products = await Product.find({ productName: { $regex: query, $options: 'i' } });
    
            if (products.length === 0) {
                products = await Product.find({ category: { $regex: query, $options: 'i' } });
            }
    
            res.json(products);
        }
        else if(category){
            
           let products = await Product.find({ category: { $regex: category, $options: 'i' } });
           res.json(products);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Order Routes
app.post('/orders', async (req, res) => {
    const orderDetails = req.body;

    try {
        // Create the order in the database
        const newOrder = new Order(orderDetails);
        await newOrder.save();

        // Clear the user's cart after successful order placement
        await Cart.deleteMany({ userID: orderDetails.userID }); // Clear the cart by userID

        res.status(201).json({ message: 'Order placed successfully.' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

app.delete('/clearcart', async (req, res) => {
    const {userID} = req.body;

    try {
        // Clear the user's cart after successful order placement
        await Cart.deleteMany({ userID: userID }); // Clear the cart by userID

        res.status(201).json({ message: 'cart cleared successfully.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
    destination: './uploads/',
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
            cb('Error: Images Only!'); // Error message
        }
    }
}).array('profilePicture'); // Expect a single file with the name "profilePicture"

// Shop Registration Route with file upload
app.post("/createshop", upload, (req, res) => {
    const { shopName, street, city, productCategories, userID } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    // Ensure userID is saved with the shop data
    Shop.create({ shopName, street, city, productCategories, profilePicture, userID })
        .then(shop => {
            // After shop creation, update the firstLogin status in the user model
            eappmodel.findByIdAndUpdate(userID, { firstLogin: false }, { new: true })
                .then(updatedUser => {
                    res.status(201).json({ 
                        message: 'Shop created successfully'
                    });
                })
                .catch(err => {
                    console.error('Failed to update firstLogin:', err);
                    res.status(500).json({ error: 'Failed to update firstLogin', details: err });
                });
        })
        .catch(err => {
            console.error('Failed to create shop:', err);
            res.status(500).json({ error: 'Failed to create shop', details: err });
        });
});


app.post("/searchedProduct", (req, res) => {
    const { searchTerm } = req.body;

    if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
    }

    Product.find({ category: { $regex: searchTerm, $options: "i" } })
        .then(products => {
            res.status(200).json({ products });
        })
        .catch(err => {
            console.error('Failed to fetch shops:', err);
            res.status(500).json({ error: 'Failed to fetch shops', details: err });
        });
});

app.post("/shop", (req, res) => {
    const { userID, shopID } = req.body;

    if (!userID && !shopID) {
        return res.status(400).json({ error: "Either User ID or Shop ID is required" });
    }

    // If shopID is provided, find the shop by shopID
    if (shopID) {
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

app.post('/createproduct', (req, res) => {
    muiltFiles(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err });
        }

        // Access product details from the form
        const { productName, category, price, shopID } = req.body;

        // Ensure required fields are provided
        if (!productName || !category || !price || !shopID) {
            return res.status(400).json({ error: 'All fields are required.' });
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
    if (!shopID) {
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
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        console.log('Received amount:', amount);
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
        });
        console.log('Payment Intent created:', paymentIntent.id);
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Error creating payment intent:', err);
        res.status(500).send({ error: err.message });
    }
});

app.post('/favorite', async (req, res) => {
    const { userID, productID, productName } = req.body;

    if (!userID || !productID || !productName) {
        return res.status(400).json({ error: 'userID and productID are required' });
    }

    try {
        const existingFavorite = await Favorite.findOne({ userID, productID });

        if (existingFavorite) {
            await Favorite.deleteOne({ _id: existingFavorite._id });
            return res.status(200).json({ message: 'Favorite product removed successfully!' });
        } else {
            const newFavorite = new Favorite({ userID, productID, productName });
            await newFavorite.save();
            return res.status(201).json({ message: 'Favorite product added successfully!' });
        }

    } catch (error) {
        console.error('Error handling favorite product:', error);
        return res.status(500).json({ error: 'Failed to toggle favorite product', details: error });
    }
});

app.post('/checkFavorite', async (req, res) => {
    const { userID, productID } = req.body;
  
    if (!userID || !productID) {
      return res.status(400).json({ error: 'userID and productID are required' });
    }
  
    try {
      const existingFavorite = await Favorite.findOne({ userID, productID });
  
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
  
  app.get('/favorites/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        const favorites = await Favorite.find({ userID }).populate('productID', 'productName');
        
        const favoriteProducts = favorites.map(fav => ({
            productID: fav.productID._id,
            productName: fav.productID.productName
        }));

        res.status(200).json(favoriteProducts);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorite products' });
    }
});

app.post('/addToCart', async (req, res) => {
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
  
      if (existingProductIndex !== -1) {
        // Product exists, remove it from the cart
        cart.products.splice(existingProductIndex, 1);
        res.status(200).json({ message: 'Product removed from cart successfully!' });
      } else {
        // Product does not exist, add it to the cart
        cart.products.push({ productID, productName, category, price, images, shopName, address });
        res.status(201).json({ message: 'Product added to cart successfully!' });
      }
  
      // Save the updated cart
      await cart.save();
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ error: 'Failed to update cart.' });
    }
  });  

  app.post('/checkInCart', async (req, res) => {
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

  app.get('/cart/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        // Fetch the cart items for the given userID
        const cart = await Cart.findOne({ userID }).populate('products.productID');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

app.delete('/cart/:userID/remove/:productID', async (req, res) => {
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

app.delete('/deleteProduct', async (req, res) => {
    const { id } = req.body; // Get the ID from the request body

    if (!id) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        // Find the product by ID and delete it
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        // Check if the product was found and deleted
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
