const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    image: {
        type: String,
        default: ""
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    level: {
        type: Number,
        default: 0
    },
    friendrequests: {
        type: Array,
        default: []
    },
    friendlist: {
        type: Array,
        default: []
    }
});
const User = mongoose.model("users", userSchema);
module.exports = User;