const mongoose = require("mongoose");
const initProduct = require("./products.js");
const initCategory = require("./category.js");
const { Product, Category } = require("../models/productModel.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/plant_nursery"; 

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to the database");

        const categoryIds = await initCategories();
        await initProducts(categoryIds);
    } catch (error) {
        console.error("Database connection error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
}

const initCategories = async () => {
    try {
        await Category.deleteMany({}); 
        console.log("Inserting categories:", initCategory.data); // Log category data
        const categories = await Category.insertMany(initCategory.data); 
        console.log("Categories initialized successfully!", categories);

        // Store category IDs for later use in products initialization
        return categories; // Return the complete category objects
    } catch (error) {
        console.error("Error initializing categories:", error);
        return []; // Return an empty array on error
    }
};

const initProducts = async (categories) => {
    try {
        await Product.deleteMany({}); 
        console.log("Products to be initialized:", initProduct.data); // Log product data

        // Create a map for easy category lookup by name
        const categoryMap = {};
        categories.forEach(category => {
            categoryMap[category.categoryname] = category._id; // Create a mapping of category names to ObjectIds
        });

        // Log the category map for debugging
        console.log("Category Map:", categoryMap);

        // Update products with the corresponding category ObjectIds
        const updatedProducts = initProduct.data.map(product => {
            const categoryId = categoryMap[product.category]; // Look up the ObjectId using the category name
            if (!categoryId) {
                console.error(`Invalid category for product: ${product.name}, assigning category as null`);
                product.category = null; // Handle as needed, e.g., skip this product
                return null; // Return null to filter out this product later
            } else {
                product.category = categoryId; // Assign the ObjectId of the category
            }
            return product;
        }).filter(product => product !== null); // Filter out null products

        if (updatedProducts.length === 0) {
            console.warn("No valid products to insert, skipping product initialization.");
            return; // Skip product initialization if there are no valid products
        }

        console.log("Final products to be inserted:", updatedProducts); // Log updated product data

        const products = await Product.insertMany(updatedProducts); 
        console.log("Products initialized successfully!", products);
    } catch (error) {
        console.error("Error initializing products:", error);
    }
};

main();
