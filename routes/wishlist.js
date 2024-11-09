const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {Wishlist} = require('../models/otherModel.js'); 
const {Product} = require('../models/productModel.js'); 

// Route to view the user's wishlist
router.get("/", wrapAsync(async (req, res) => {
    const userId = req.user._id; 
    try {
        const allWishlist = await Wishlist.find({userid: userId}).populate('productid');
        console.log(allWishlist)
        res.render('order/wishlist.ejs', { allWishlist, currentUser: req.user });
    } 
    catch (error) {
        req.flash('error', 'Could not retrieve your wishlist.');
        res.redirect('/home'); 
    }
}));

// Route to add a product to the wishlist
router.post('/:productId/add', wrapAsync(async (req, res) => {
    const userId = req.user._id; 
    const { productId } = req.params; 
    try {
        const existingWishlistItem = await Wishlist.findOne({ userid: userId, productid: productId });
        if (existingWishlistItem) {
            req.flash('info', 'Product is already in your wishlist.');
        } 
        else {
            const newWishlistItem = new Wishlist({
                userid: userId,
                productid: productId
            });
            await newWishlistItem.save();
            req.flash('success', 'Product added to your wishlist!');
        }
        res.redirect(`/home/${productId}`);
    } 
    catch (error) {
        console.error(error);
        req.flash('error', 'Could not add product to wishlist.');
        res.redirect('home/show.ejs'); 
    }
}));

// Route to remove a product from the wishlist
router.delete('/remove/:wishlistid', wrapAsync(async (req, res) => {
    const { wishlistid } = req.params; 
    try {
        await Wishlist.findByIdAndDelete(wishlistid);
        req.flash('success', 'Product removed from your wishlist.');
        res.redirect('/wishlist'); 
    } 
    catch (error) {
        console.error(error);
        req.flash('error', 'Could not remove product from wishlist.');
        res.redirect('/wishlist');
    }
}));

// Route to add a product to the cart
router.post('/cart/add/:productId', wrapAsync(async (req, res) => {
    const userId = req.user._id; 
    const productId = req.params.productId; 
    try {
        const existingCartItem = await ShoppingCart.findOne({ userid: userId, productid: productId });
        if (existingCartItem) {
            existingCartItem.quantity += 1;
            await existingCartItem.save();
        } 
        else {
            const product = await Product.findById(productId);
            const newCartItem = new ShoppingCart({
                userid: userId,
                productid: productId,
                quantity: 1,
                price: product.price 
            });
            await newCartItem.save();
        }
        req.flash('success', 'Product added to cart!');
        res.redirect('/cart'); 
    } 
    catch (error) {
        console.error(error);
        req.flash('error', 'Could not add product to cart.');
        res.redirect(`/wishlist`); 
    }
}));

module.exports = router;
