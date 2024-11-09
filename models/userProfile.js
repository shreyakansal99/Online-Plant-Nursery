const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: String,
    address: String,
    city: String,
    state: String,
    postalcode: Number,
    phonenumber: Number,
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
module.exports = UserProfile;