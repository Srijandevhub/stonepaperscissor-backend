const Notification = require('../models/notificationModel');
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userid;
        const notifications = await Notification.find({ userid: userId });
        let flag = false;
        for (let i = 0; i < notifications.length; i++) {
            if (notifications[i].read === false) {
                flag = true;
                break;
            }
        }
        res.status(200).json({ status: 200, message: "Notification Fetched", notifications: notifications.reverse(), flag: flag });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const makeReadNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, {
            read: true
        });
        res.status(200).json({ status: 200, message: "Notification updated successfully" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).json({ status: 200, message: "Notification deleted successfully" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
module.exports = { getNotifications, makeReadNotification, deleteNotification };