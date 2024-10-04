const express = require('express');
const { signUp, login, logout, protected, getAuthenticatedUser, updateProfileImage, removeProfilePicture, deactivateProfile, fetchsuggestionList, sendFriendRequest, cancelFriendrequest, searchUsers, getUser, acceptFriendRequest, unfriend, getFriendRequests, getFriendRequestsCount, getFriendList, getFriendListCount } = require('../controllers/userController');
const { auth, authUserInfo } = require('../middlewares/authentication');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const title = req.user.name;
        if (!title) {
            return cb(new Error('Title is required'), false);
        }
        const userDir = path.join(__dirname, '../uploads/users', title);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/protected", auth, protected);
router.get("/getloggedinuser", authUserInfo, getAuthenticatedUser);
router.put("/profileimageupload", authUserInfo, upload.single('image'), updateProfileImage);
router.put("/removeprofilepicture", authUserInfo, removeProfilePicture);
router.put("/deactivateprofile", authUserInfo, deactivateProfile);
router.get("/getsuggestions", authUserInfo, fetchsuggestionList);
router.post('/sendfriendrequest', authUserInfo, sendFriendRequest);
router.post('/cencelfriendrequest', authUserInfo, cancelFriendrequest);
router.post("/searchusers", authUserInfo, searchUsers);
router.get("/get-user/:id", authUserInfo, getUser);
router.post("/acceptrequest", authUserInfo, acceptFriendRequest);
router.post("/unfriend", authUserInfo, unfriend);
router.get("/getfriendrequests", authUserInfo, getFriendRequests);
router.get("/getfriendlist", authUserInfo, getFriendList);
router.get("/getfriendrequestscount", authUserInfo, getFriendRequestsCount);
router.get("/getfriendlistcount", authUserInfo, getFriendListCount);
module.exports = router;