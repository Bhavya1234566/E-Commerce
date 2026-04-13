const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

app.use(express.json());
app.use(cors());

// Serve static files from 'upload/images' directory
app.use('/images', express.static('upload/images'));

// Database Connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch((error) => console.log("MongoDB Connection Error:", error));

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});

const upload = multer({ storage: storage });

// Creating Upload Endpoint for images
// Creating Upload Endpoint for images
app.post("/upload", upload.single('product'), (req, res) => {
    // Automatically detect host - localhost pe localhost, mobile pe network IP
    const host = req.headers.host; // e.g. "localhost:4000" or "192.168.29.21:4000"
    const protocol = req.protocol; // "http"
    
    res.json({
        success: 1,
        image_url: `${protocol}://${host}/images/${req.file.filename}`
    });
});

// API Creation
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

// Product Schema
const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
});

// Creating API for adding products
app.post('/addproduct', async (req, res) => {
    try{
        let products = await Product.find({});
        let id;
        if (products.length > 0) {
            let last_product_array = products.slice(-1);
            let last_product = last_product_array[0];
            id = last_product.id + 1;
        } else {
            id = 1;
        }

        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();
        console.log("Product Saved");
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Creating API for deleting products
app.post('/removeproduct', async (req, res) => {
    try{
        await Product.findOneAndDelete({ id: req.body.id });
        console.log("Product Removed");
        res.json({
            success: true,
            name: req.body.name
        });
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all products
app.get("/allproducts", async (req, res) => {
    try{
        let products = await Product.find({});
        console.log("All Products Fetched");
        res.send(products);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get popular in women
app.get("/popularinwomen", async (req, res) => {
    try {
        let products = await Product.find({ category: "women" });
        let popular_in_women = products.slice(0, 4);
        console.log("popular in women fetched");
        res.send(popular_in_women);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get new collections
app.get("/newcollections", async (req, res) => {
    try {
        let products = await Product.find({});
        let newcollection = products.slice(1).slice(-8);
        console.log("NewCollection Fetched");
        res.send(newcollection);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// User Schema
const Users = mongoose.model('Users', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now }
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    try{
        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: false, errors: "User already exists" });
        }

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();

        const data = { user: { id: user.id } };
        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        let user = await Users.findOne({ email: req.body.email });
        if (user) {
            const passCompare = req.body.password === user.password;
            if (passCompare) {
                const data = { user: { id: user.id } };
                const token = jwt.sign(data, 'secret_ecom');
                res.json({ success: true, token });
            } else {
                res.json({ success: false, errors: "Wrong Password" });
            }
        } else {
            res.json({ success: false, errors: "Wrong Email Id" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using valid token" });
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "Please authenticate using a valid token" });
        }
    }
};

// Add to cart
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        console.log("Added", req.body.itemId);
        let userData = await Users.findOne({ _id: req.user.id });
        userData.cartData[req.body.itemId] += 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("Added");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove from cart
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        console.log("removed", req.body.itemId);
        let userData = await Users.findOne({ _id: req.user.id });
        if (userData.cartData[req.body.itemId] > 0)
            userData.cartData[req.body.itemId] -= 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("Removed");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get cart
app.post('/getcart', fetchUser, async (req, res) => {
    try {
        console.log("GetCart");
        let userData = await Users.findOne({ _id: req.user.id });
        res.json(userData.cartData);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server && api creation
app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port);
    } else {
        console.log("Error: " + error);
    }
});