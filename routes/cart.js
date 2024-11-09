const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
const {ShoppingCart} = require('../models/otherModel.js'); 
const {Order} = require('../models/orderModel.js');
const {Product} = require('../models/productModel.js'); 

// Get Cart Route
router.get('/', wrapAsync(async (req, res) => { 
    try {
        const order = await Order.findOne({ userid: req.user._id, orderstatus: 'Pending' });
        let cart;
        if(order){
            cart = await ShoppingCart.findOne({ userid: req.user._id, cartstatus: 'Pending' }).populate("product");
        }
        console.log(cart);
        res.render('order/cart', { cart, messages: req.flash() }); // Use orderItems here
    } 
    catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while fetching the cart.');
        res.redirect('/home');
    }
}));

// Add to Cart Route
router.post('/:productId/add', async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user._id;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            req.flash('error', 'Product not found.');
            return res.redirect(`/home/${productId}`);
        }
        if (product.quantity <= 0) {
            req.flash('error', 'Product is out of stock.');
            return res.redirect(`/home/${productId}`);
        }
        product.quantity -= 1;
        await product.save();

        console.log(product)
        console.log(product._id)

        let shoppingCartItem = await ShoppingCart.findOne({ userid: userId, cartstatus: "Pending" }).populate("product");
        console.log(shoppingCartItem)
        if(!shoppingCartItem){

            if (!mongoose.Types.ObjectId.isValid(product._id)) {
                console.log("noooooooooooooooooo")
            }
            
            // const item = [mongoose.Types.ObjectId(product._id), 1]
            // const p = [item];
            // console.log(p)
            shoppingCartItem = new ShoppingCart({
                cartstatus : "Pending",
                userid: userId,
                product: [[new mongoose.Types.ObjectId('672eef0e1e0ddbd9c0adee0d'), 1]],
                price: product.price
            });
            console.log(shoppingCartItem)
        }else{
            for(i of shoppingCartItem.product){
                if(i[0]._id === productId){
                    i[1] += 1;
                    shoppingCartItem.price += i[0].price;
                }
            }
        }

        await shoppingCartItem.save();

        let order = await Order.findOne({ userid: userId, orderstatus: 'Pending' });

        if (!order) {
            order = new Order({
                userid: userId,
                orderstatus: 'Pending',
                cart : shoppingCartItem._id,
                totalamount: 0,
                shippingaddress: '',
            });
            await order.save();
        }


        order.totalamount += product.price;
        await order.save();

        shoppingCartItem.orderid = order._id;
        await shoppingCartItem.save();

        req.flash('success', 'Product added to cart successfully.');
        res.redirect(`/home/${productId}`);
    } 
    catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while adding the product to the cart.');
        res.redirect(`/home/${productId}`);
    }
});


router.get('/order', wrapAsync(async (req, res) => {
    try {
        const userId = req.user._id; 
        const order = await Order.findOne({ userid: userId, orderstatus: 'Pending' });
        let orderItems = [];
        let totalAmount = 0;
        if (order) {
            orderItems = await OrderItem.find({ orderid: order._id }).populate('productid');
            totalAmount = order.totalamount;
        }
        res.render('order/order', {
            orderItems: orderItems,
            totalAmount: totalAmount,
            messages: req.flash() 
        });
    } 
    catch (error) {
        console.error('Error fetching order items:', error);
        req.flash('error', 'An error occurred while fetching your order.');
        res.redirect('/home'); 
    }
}));

module.exports = router;