const mongoose = require('mongoose');
const Review = require("./reviewModel.js");

const categorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
        required: true,
    },
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    image: {
        url: String,
        filename: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ]
});

productSchema.post("findOneAndDelete", async(product) => {
    if(product){
        await Review.deleteMany({_id: {$in: product.reviews}});
    }
});

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

module.exports = {Category, Product};
