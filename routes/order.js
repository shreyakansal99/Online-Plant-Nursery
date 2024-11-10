const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { Order, OrderItem } = require('../models/orderModel.js');
const { Product } = require('../models/productModel.js');
const { Payment } = require('../models/otherModel.js'); 
const {ShoppingCart} = require('../models/otherModel.js'); 

// Route to display the order details (GET)
// router.get('/', wrapAsync(async (req, res) => {
//     const userId = req.user._id; 
//     try {
//         const order = await Order.findOne({ userid: userId, orderstatus: 'Pending' });
//         if (!order) {
//             req.flash('error', 'No pending orders found.');
//             return res.redirect('/home'); 
//         }
//         const orderItems = await OrderItem.find({ orderid: order._id }).populate('productid');
//         const totalAmount = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
//         res.render('order/order', { orderItems, totalAmount, messages: req.flash() });
//     } 
//     catch (error) {
//         console.error("Error fetching order details:", error);
//         req.flash('error', 'An error occurred while fetching the order details.');
//         res.redirect('/home');
//     }
// }));

// Route to place the order (POST)
// router.post('/place-order', wrapAsync(async (req, res) => {
//     const userId = req.user._id; 
//     const { productId } = req.body; 
//     try {
//         let order = await Order.findOne({ userid: userId, orderstatus: 'Pending' });
//         if (!order) {
//             order = new Order({
//                 userid: userId,
//                 orderstatus: 'Pending',
//                 orderdate: new Date(),
//                 totalamount: 0,
//                 shippingaddress: '', 
//                 paymentstatus: 'Pending'
//             });
//             await order.save();
//         }
//         const product = await Product.findById(productId);
//         if (!product) {
//             req.flash('error', 'Product not found.');
//             return res.redirect('/home'); 
//         }
//         if (product.quantity <= 0) {
//             req.flash('error', 'Product is out of stock.');
//             return res.redirect(`/home/${productId}`);
//         }
//         product.quantity -= 1;
//         await product.save();
//         const orderItem = new OrderItem({
//             orderid: order._id,
//             productid: product._id,
//             quantity: 1,
//             price: product.price
//         });
//         await orderItem.save();
//         order.totalamount += product.price;
//         await order.save();
//         req.flash('success', 'Please finalize your order.');
//         res.redirect('/order'); 
//     } 
//     catch (error) {
//         console.error(error);
//         req.flash('error', 'An error occurred while placing your order. Please try again.');
//         res.redirect('/home'); 
//     }
// }));





// Route to display payment options (GET)
// router.get('/payment', wrapAsync(async (req, res) => {
//     const userId = req.user._id;
//     const order = await Order.findOne({ userid: userId, orderstatus: 'Pending' });
//     if (!order) {
//         req.flash('error', 'No pending orders found.');
//         return res.redirect('/order');
//     }
//     res.render('order/payment', { totalAmount: order.totalamount, messages: req.flash() });
// }));




// Route to confirm payment method (POST)
router.post('/payment', wrapAsync(async (req, res) => {
    const userId = req.user._id;
    const { paymentMethod } = req.body;  
    const order = await Order.findOne({ userid: userId, orderstatus: 'Pending' });
    const amt = order.totalamount
    if (!order) {
        req.flash('error', 'No pending orders found.');
        return res.redirect('/order');
    }
    try {
        const payment = new Payment({
            orderid: order._id,
            paymentmethod: paymentMethod,
            paymentstatus: 'Completed', 
            paymentdate: new Date()
        });
        await payment.save();
        order.orderstatus = 'Confirmed'; 
        await order.save();
        req.flash('success', 'Please proceed to payment.');
        
        res.render('order/payment', {totalamount : amt}); 
    } 
    catch (error) {
        console.error("Error processing payment:", error);
        req.flash('error', 'Payment failed. Please try again.');
        res.redirect('order/payment'); 
    }
}));

router.get('/confirmation', wrapAsync(async (req, res) => {
    const userId = req.user._id;
    await ShoppingCart.findOneAndDelete({userid : userId, cartstatus : "Pending"});
    req.flash('success', 'Your order has been confirmed successfully!'); 
    res.render('order/confirmation', { messages: req.flash() }); 
}));

module.exports = router;
