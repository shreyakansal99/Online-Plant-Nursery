const mongoose = require('mongoose');

const shoppingCartSchema = new mongoose.Schema({
    orderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    cartstatus: {
        type: String,
        default: 'Pending',
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    }],
    quantity : [Number],
    price: Number,
});

const wishlistSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
});

const paymentSchema = new mongoose.Schema({
    orderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    paymentmethod: String,
    paymentstatus: String,
    paymentdate: {
        type: Date,
        default: Date.now,
    },
});

const chatbotInteractionSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    query: String,
    response: String,
});

const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const ChatbotInteraction = mongoose.model('ChatbotInteraction', chatbotInteractionSchema);

module.exports = {ShoppingCart, Wishlist, Payment, ChatbotInteraction};
