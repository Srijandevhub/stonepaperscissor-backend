const User = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;
const path = require('path');
const fs = require('fs');
const Notification = require('../models/notificationModel');

const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (name === "") {
            return res.status(200).json({ status: 400, message: "Enter a valid name", focusOn: "name", redirect: false, redirecturl: "" });
        }
        if (email === "") {
            return res.status(200).json({ status: 400, message: "Enter a valid email", focusOn: "email", redirect: false, redirecturl: "" });
        }
        if (password === "") {
            return res.status(200).json({ status: 400, message: "Enter a valid password", focusOn: "password", redirect: false, redirecturl: "" });
        }
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(password)) {
            return res.status(200).json({ status: 400, message: "Password Must contain at least one uppercase letter, one special character and must be a minimum of 8 characters long", focusOn: "password", redirect: false, redirecturl: "" });
        }
        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.status(200).json({ status: 400, message: "Email Already Exists", focusOn: "email", redirect: false, redirecturl: "" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(200).json({ status: 200, message: "User Created Successfully", redirect: true, redirecturl: "/signin" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error });
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === "") {
            return res.status(200).json({ status: 400, message: "Enter a valid email", focusOn: "email", redirect: false, redirecturl: "" });
        }
        if (password === "") {
            return res.status(200).json({ status: 400, message: "Enter a valid password", focusOn: "password", redirect: false, redirecturl: "" });
        }
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(password)) {
            return res.status(200).json({ status: 400, message: "Password Must contain at least one uppercase letter, one special character and must be a minimum of 8 characters long", focusOn: "password", redirect: false, redirecturl: "" });
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(200).json({ status: 400, message: "User not found", redirect: false, redirecturl: "" });
        }
        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword) {
            return res.status(200).json({ status: 400, message: "You have entered wrong password", redirect: false, redirecturl: "" });
        }
        const token = jwt.sign({ userid: user._id, name: user.name, email: user.email, image: user.image, level: user.level, friendrequests: user.friendrequests, friendlist: user.friendlist }, SECRET, { expiresIn: '30d' });
        res.cookie("sps_user", token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ status: 200, message: "User logged in Successfully", redirect: true, redirecturl: "/dashboard" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error });
    }
}
const logout = async (req, res) => {
    try {
        res.clearCookie("sps_user");
        res.status(200).json({ status: 200, message: "User logged out Successfully", redirect: true, redirecturl: "/signin" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Inter Server Error", error });
    }
}
const protected = async (req, res) => {
    try {
        res.status(200).json({ status: 200, message: "User authenticated"});
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error });
    }
}
const getAuthenticatedUser = async (req, res) => {
    try {
        const userid = req.user.userid;
        const user = await User.findById(userid);
        res.status(200).json({ status: 200, message: "User fetched successfully", user: user });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error });
    }
}
const updateProfileImage = async (req, res) => {
    try {
        const userId = req.user.userid;
        const user = await User.findById(userId);
        if (req.file) {
            if (user.image) {
                const oldImagePath = path.join(__dirname, '../uploads/users/', user.image);
                if (oldImagePath && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            const relativeImagePath = path.relative(path.join(__dirname, '../uploads/users'), req.file.path);
            await User.findByIdAndUpdate(userId, {
                image: relativeImagePath
            });
            res.status(200).json({ status: 200, message: "User updated successfully" });
        } else {
            res.status(200).json({ status: 400, message: "Cannot update profile image" });
        }
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const removeProfilePicture = async (req, res) => {
    try {
        const userId = req.user.userid;
        const user = await User.findById(userId);
        if (user.image) {
            const oldImagePath = path.join(__dirname, '../uploads/users/', user.image);
            if (oldImagePath && fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        await User.findByIdAndUpdate(userId, {
            image: ""
        });
        res.status(200).json({ status: 200, message: "User image deleted successfully" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const deactivateProfile = async (req, res) => {
    try {
        const userId = req.user.userid;
        const userDirectory = path.join(__dirname, `../uploads/users/${req.user.name}`);
        if (fs.existsSync(userDirectory)) {
            fs.rmSync(userDirectory, { recursive: true, force: true });
        }
        await User.findByIdAndDelete(userId);
        res.clearCookie("sps_user");
        res.status(200).json({ status: 200, message: "User deactivated successfully", redirect: true, redirecturl: "/signin" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const fetchsuggestionList = async (req, res) => {
    try {
        const userId = req.user.userid;
        const users = await User.find({}, {password: 0});
        if (users.length === 0) {
            return res.status(200).json({ status: 400, message: "Users not found" });
        }
        const filteredList = users.filter((el) => el._id.toString() !== userId).map((el) => {
            const userObject = el.toObject();
            userObject.friendrequests.forEach((item) => {
                if (item.userid === userId) {
                    userObject['friendrequestsent'] = true;
                }
            })
            return userObject;
        });
        const user = await User.findById(userId);
        const hasSentRequests = user.friendrequests.map(item => item.userid);
        filteredList.map((el) => {
            const userObject = el;
            if (hasSentRequests.includes(userObject._id.toString())) {
                userObject['hassentrequest'] = true;
            }
            return userObject;
        })
        const idsinFriendList = user.friendlist.map(item => item.userid);
        const finalList = filteredList.filter(item => !idsinFriendList.includes(item._id.toString()));
        res.status(200).json({ status: 200, message: "Users fetched successfully", users: finalList });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const sendFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { id } = req.body;
        const userToUpdate = await User.findById(id);
        const notificationtitle = "New friend request";
        const notificationbody = `${req.user.name} sent you friend request`;
        const newNotification = new Notification({
            userid: id,
            notificationtitle: notificationtitle,
            notificationbody: notificationbody,
            new: true,
            redirectlink: '/dashboard/friend-requests'
        });
        await newNotification.save();
        await User.findByIdAndUpdate(id, {
            friendrequests: [...userToUpdate.friendrequests, {userid: userId, notificationid: newNotification._id}]
        });
        res.status(200).json({ status: 200, message: `Friend request sent successfully to ${id}` });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const cancelFriendrequest = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { id } = req.body;
        const userToUpdate = await User.findById(id);
        const request = userToUpdate.friendrequests.find((el) => el.userid === userId);
        await Notification.findByIdAndDelete(request.notificationid);
        const filteredArray = userToUpdate.friendrequests.filter((el) => el.userid !== request.userid);
        await User.findByIdAndUpdate(id, {
            friendrequests: filteredArray
        });
        res.status(200).json({ status: 200, message: "Friend request cancelled successfully" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const searchUsers = async (req, res) => {
    try {
        const { search } = req.body;
        if (!search || search.trim() === "") {
            return res.status(200).json({ status: 400, message: "Search term is required" });
        }
        const users = await User.find({
            $or: [
                { name: { $regex: search, $options: 'i' } }
            ]
        });
        if (users.length === 0) {
            return res.status(200).json({ status: 400, message: "Users not found" });
        }
        const filteredList = users.filter((el) => el._id.toString() !== req.user.userid);
        res.status(200).json({ status: 200, message: "Users fetched", users: filteredList });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id, {password: 0});
        const idsinFriendRequests = user.friendrequests.map(item => item.userid);
        const loggedinUser = await User.findById(req.user.userid);
        const hasSentRequest = loggedinUser.friendrequests.map(item => item.userid);
        const friendList = loggedinUser.friendlist.map(item => item.userid);
        res.status(200).json({ status: 200, message: "Users fetched", user: user, friendrequestsent: idsinFriendRequests.includes(req.user.userid) ? true : false, hassentrequest: hasSentRequest.includes(user._id.toString()) ? true : false, isFriend: friendList.includes(id) ? true : false });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const acceptFriendRequest = async (req, res) => {
    try {
        const { id } = req.body;
        const loggedinUser = await User.findById(req.user.userid);
        const oppositeUser = await User.findById(id);
        const newFriendrequestArray = loggedinUser.friendrequests.filter((el) => el.userid !== id);
        await User.findByIdAndUpdate(id, {
            friendlist: [...oppositeUser.friendlist, { userid: req.user.userid }]
        });
        await User.findByIdAndUpdate(req.user.userid, {
            friendrequests: newFriendrequestArray,
            friendlist: [...loggedinUser.friendlist, { userid:  id}]
        });
        const notificationtitle = "Friend Request Accepted";
        const notificationbody = `${req.user.name} accepted your friend request`;
        const newNotification = new Notification({
            userid: id,
            notificationtitle: notificationtitle,
            notificationbody: notificationbody,
            new: true,
            redirectlink: `/dashboard/view-profile/${req.user.userid}`
        });
        await newNotification.save();
        res.status(200).json({ status: 200, message: "Friend request accepted" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const unfriend = async (req, res) => {
    try {
        const { id } = req.body;
        const loggedinUser = await User.findById(req.user.userid);
        const oppositeUser = await User.findById(id);
        const newFilterArrayforLoggedin = loggedinUser.friendlist.filter(item => item.userid !== id);
        const newFilterArrayforOppsite = oppositeUser.friendlist.filter(item => item.userid !== req.user.userid);
        await User.findByIdAndUpdate(req.user.userid, {
            friendlist: newFilterArrayforLoggedin
        });
        await User.findByIdAndUpdate(id, {
            friendlist: newFilterArrayforOppsite
        });
        res.status(200).json({ status: 200, message: "Unfriend successfully" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user.userid;
        const user = await User.findById(userId);
        const allUsers = await User.find({}, {password: 0});
        const idsinrequests = user.friendrequests.map(item => item.userid);
        const filtertedList = idsinrequests.length === 0 ? [] : allUsers.filter(item => item._id.toString() !== userId).filter(item => idsinrequests.includes(item._id.toString()));
        res.status(200).json({ status: 200, message: "Fetched successfully", users: filtertedList, count: filtertedList.length });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const getFriendRequestsCount = async (req, res) => {
    try {
        const userId = req.user.userid;
        const user = await User.findById(userId);
        const allUsers = await User.find({}, {password: 0});
        const idsinrequests = user.friendrequests.map(item => item.userid);
        const filtertedList = idsinrequests.length === 0 ? [] : allUsers.filter(item => item._id.toString() !== userId).filter(item => idsinrequests.includes(item._id.toString()));
        res.status(200).json({ status: 200, message: "Fetched successfully", count: filtertedList.length });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const getFriendList = async (req, res) => {
    try {
        const userId = req.user.userid;
        const user = await User.findById(userId);
        const allUsers = await User.find({}, {password: 0});
        const idsinrequests = user.friendlist.map(item => item.userid);
        const filtertedList = idsinrequests.length === 0 ? [] : allUsers.filter(item => item._id.toString() !== userId).filter(item => idsinrequests.includes(item._id.toString()));
        res.status(200).json({ status: 200, message: "Fetched successfully", users: filtertedList, count: filtertedList.length });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const getFriendListCount = async (req, res) => {
    try {
        const userId = req.user.userid;
        const user = await User.findById(userId);
        const allUsers = await User.find({}, {password: 0});
        const idsinrequests = user.friendlist.map(item => item.userid);
        const filtertedList = idsinrequests.length === 0 ? [] : allUsers.filter(item => item._id.toString() !== userId).filter(item => idsinrequests.includes(item._id.toString()));
        res.status(200).json({ status: 200, message: "Fetched successfully", count: filtertedList.length });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
module.exports = { signUp, login, logout, protected, getAuthenticatedUser, updateProfileImage, removeProfilePicture, deactivateProfile, fetchsuggestionList, sendFriendRequest, cancelFriendrequest, searchUsers, getUser, acceptFriendRequest, unfriend, getFriendRequests, getFriendRequestsCount, getFriendList, getFriendListCount };