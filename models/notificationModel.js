const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
    userid: {
        type: String
    },
    notificationtitle: {
        type: String,
        default: "New Notification"
    },
    notificationbody: {
        type: String,
        default: ""
    },
    new: {
        type: Boolean,
        default: true
    },
    read: {
        type: Boolean,
        default: false
    },
    redirectlink: {
        type: String,
        default: ""
    }
});
const Notification = mongoose.model("notifications", notificationSchema);
module.exports = Notification;