const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch((error) => console.log("Error:", error));

const Product = mongoose.model("Product", {
    id: Number,
    name: String,
    image: String,
    category: String,
    new_price: Number,
    old_price: Number,
    date: Date,
    available: Boolean,
});

const fixImages = async () => {
    const products = await Product.find({});
    console.log(`Total products: ${products.length}`);

    for (let product of products) {
        if (product.image.includes('localhost')) {
            const newImage = product.image.replace('localhost', '192.168.29.21');
            await Product.findOneAndUpdate(
                { id: product.id },
                { image: newImage }
            );
            console.log(`✅ Fixed: ${product.name}`);
        }
    }

    console.log("🎉 All images fixed!");
    mongoose.connection.close();
}

fixImages();
