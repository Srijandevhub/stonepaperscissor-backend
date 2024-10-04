const express = require('express');
const { authUserInfo } = require('../middlewares/authentication');
const { createGame, quickGame, joinQuickgame, getGame, makeMove } = require('../controllers/gameController');
const router = express.Router();
router.post("/createquickgame", authUserInfo, quickGame);
router.post("/join/:id", authUserInfo, joinQuickgame);
router.get("/getgame/:id", authUserInfo, getGame);
router.post("/move/:id", authUserInfo, makeMove);
router.post("/creategame", authUserInfo, createGame);
module.exports = router;