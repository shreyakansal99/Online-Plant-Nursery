const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderstatus: {
        type: String,
        default: 'Pending',
    },
    cart : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShoppingCart',
    },
    totalamount: Number,
    shippingaddress: String,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = {Order};
