const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

app.use(express.json());
app.use(cors());

//Database connection with mongoDB
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.log("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test Cloudinary connection
console.log("Cloudinary Config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Missing",
    api_key: process.env.CLOUDINARY_API_KEY ? "Set" : "Missing",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "Set" : "Missing"
});

//API Creation
app.get("/", (req, res) => {
    res.send("Express app is Running")
})

//Image Storage Engine - Using Memory Storage for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

//Creating upload Endpoint for images - Upload to Cloudinary
app.post("/upload", upload.single('product'), async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                success: 0,
                message: "No file uploaded"
            });
        }

        console.log("File received:", req.file.originalname);

        // Check Cloudinary credentials
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error("Cloudinary credentials missing");
            return res.status(500).json({
                success: 0,
                message: "Server configuration error - Cloudinary credentials missing"
            });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'ecommerce_products',
                    resource_type: 'auto',
                    transformation: [
                        { width: 1000, height: 1000, crop: 'limit' },
                        { quality: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        console.log("Upload successful:", result.secure_url);
                        resolve(result);
                    }
                }
            );
            uploadStream.end(req.file.buffer);
        });

        res.json({
            success: 1,
            image_url: result.secure_url
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({
            success: 0,
            message: error.message || "Image upload failed"
        });
    }
});

// Schema for creating product
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    Date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
})

app.post('/addproduct', async (req, res) => {
    try {
        // Validation
        if (!req.body.name || !req.body.image || !req.body.category || !req.body.new_price || !req.body.old_price) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

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

        console.log("Adding product:", product);
        await product.save();
        console.log("Product saved successfully");

        res.json({
            success: true,
            name: req.body.name,
            product: product
        })
    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add product"
        });
    }
})

// Creating API for deleting products
app.post('/removeproduct', async (req, res) => {
    try {
        const result = await Product.findOneAndDelete({ id: req.body.id });
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        console.log("Product removed:", req.body.id);
        res.json({
            success: true,
            name: req.body.name
        })
    } catch (error) {
        console.error("Remove product error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to remove product"
        });
    }
})

//Creating API for getting all products
app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        console.log("All Products Fetched:", products.length);
        res.send(products);
    } catch (error) {
        console.error("Fetch products error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch products"
        });
    }
})

//Schema creating for user model
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

//Creating Endpoint for registering the user
app.post('/signup', async (req, res) => {
    try {
        // Validation
        if (!req.body.username || !req.body.email || !req.body.password) {
            return res.status(400).json({
                success: false,
                errors: "All fields are required"
            });
        }

        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({
                success: false,
                errors: "existing user found with same email address"
            })
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
        })

        await user.save();

        const data = {
            user: {
                id: user.id
            }
        }

        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token })
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            errors: error.message || "Signup failed"
        });
    }
})

//Creating endpoint for user login
app.post('/login', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({
                success: false,
                errors: "Email and password are required"
            });
        }

        let user = await Users.findOne({ email: req.body.email });
        if (user) {
            const passCompare = req.body.password === user.password;
            if (passCompare) {
                const data = {
                    user: {
                        id: user.id
                    }
                }
                const token = jwt.sign(data, 'secret_ecom');
                res.json({ success: true, token });
            } else {
                res.json({ success: false, errors: "Wrong Password" })
            }
        } else {
            res.json({ success: false, errors: "Wrong Email Id" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            errors: error.message || "Login failed"
        });
    }
})

//creating endpoint for newcollection data
app.get('/newcollections', async (req, res) => {
    try {
        let products = await Product.find({});
        let newcollection = products.slice(1).slice(-8);
        console.log("NewCollection Fetched");
        res.send(newcollection);
    } catch (error) {
        console.error("New collections error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch new collections"
        });
    }
})

//creating endpoint for popular in women section
app.get('/popularinwomen', async (req, res) => {
    try {
        let products = await Product.find({ category: "women" });
        let popular_in_women = products.slice(0, 4);
        console.log("popular in women fetched");
        res.send(popular_in_women);
    } catch (error) {
        console.error("Popular in women error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch popular products"
        });
    }
})

//creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using valid token" })
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "please authenticate using a valid token" })
        }
    }
}

//creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        console.log("Added", req.body.itemId);
        let userData = await Users.findOne({ _id: req.user.id });
        userData.cartData[req.body.itemId] += 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("Added")
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add to cart"
        });
    }
})

//creating endpoint to remove product from cartData
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        console.log("removed", req.body.itemId);
        let userData = await Users.findOne({ _id: req.user.id });
        if (userData.cartData[req.body.itemId] > 0)
            userData.cartData[req.body.itemId] -= 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("Removed")
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to remove from cart"
        });
    }
})

//creating endpoint to get cartdata
app.post('/getcart', fetchUser, async (req, res) => {
    try {
        console.log("GetCart");
        let userData = await Users.findOne({ _id: req.user.id });
        res.json(userData.cartData);
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to get cart data"
        });
    }
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port)
        console.log("Environment variables loaded:", {
            MONGO_URL: process.env.MONGO_URL ? "Set" : "Missing",
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Missing",
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "Set" : "Missing",
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "Set" : "Missing"
        });
    } else {
        console.log("Error starting server: " + error)
    }
})