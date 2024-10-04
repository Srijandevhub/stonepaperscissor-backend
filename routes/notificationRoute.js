const express = require('express');
const { authUserInfo, auth } = require('../middlewares/authentication');
const { getNotifications, makeReadNotification, deleteNotification } = require('../controllers/notificationController');
const router = express.Router();
router.get("/getnotifications", authUserInfo, getNotifications);
router.put("/markread/:id", auth, makeReadNotification);
router.delete("/deletenotification/:id", auth, deleteNotification);
module.exports = router;