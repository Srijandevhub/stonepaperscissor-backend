const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;
const auth = (req, res, next) => {
    const token = req.cookies.sps_user;
    if (!token) {
        return res.status(200).json({ status: 403, message: "Access Forbidden" });
    }
    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            return res.status(200).json({ status: 403, message: "Access Forbidden" });
        }
        next();
    })
}
const authUserInfo = (req, res, next) => {
    const token = req.cookies.sps_user;
    if (!token) {
        return res.status(200).json({ status: 403, message: "Access Forbidden" });
    }
    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            return res.status(200).json({ status: 403, message: "Access Forbidden" });
        }
        req.user = user;
        next();
    })
}
module.exports = { auth, authUserInfo };