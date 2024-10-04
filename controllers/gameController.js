const Game = require('../models/gameModel');
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const quickGame = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { rounds } = req.body;
        if (rounds === "") {
            return res.status(200).json({ status: 400, message: "Enter no of rounds", isfocus: "quickrounds" });
        }
        const newGame = new Game({
            player1: userId,
            rounds: parseInt(rounds),
            roundresult: new Array(parseInt(rounds)),
            saveroundmoveplayer1: new Array(parseInt(rounds)),
            saveroundmoveplayer2: new Array(parseInt(rounds)),
            createdby: userId
        });
        await newGame.save();
        res.status(200).json({ status: 200, message: "Quick game created successfully", quickgamecreated: true, gameid: newGame._id });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const joinQuickgame = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { id } = req.params;
        const game = await Game.findById(id);
        if (game.createdby !== userId) {
            await Game.findByIdAndUpdate(id, {
                player2: userId,
                player2join: true
            })
        } else {
            await Game.findByIdAndUpdate(id, {
                player1join: true
            })
        };
        res.status(200).json({ status: 200, message: "Joined the game successfully", redirect: true, redirecturl: `/game/${id}` });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const getGame = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { id } = req.params;
        const game = await Game.findById(id);
        if (userId === game.player1 || userId == game.player2) {
            const player1 = await User.findById(game.player1);
            const player2 = await User.findById(game.player2);
            return res.status(200).json({ status: 200, game: game, player1: player1, player2: player2, clientplayer: userId === player1._id.toString() ? 1 : 2 });
        }
        res.status(200).json({ status: 403, message: "You do not have access of this game" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const CheckWin = (arr) => {
    let noOfOnes = 0, noOftwos = 0;
    arr.forEach((el) => {
        if (el === 1) {
            noOfOnes++;
        } else if (el === 2) {
            noOftwos++;
        }
    });
    if (noOfOnes > noOftwos) {
        return 1;
    } else if (noOfOnes < noOftwos) {
        return 2;
    } else if (noOfOnes === noOftwos) {
        return 0;
    }
}
const makeMove = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { id } = req.params;
        const game = await Game.findById(id);
        const { move } = req.body;
        let updatedGame;
        let win;
        if (userId === game.player1) {
            if (game.player1move !== "") {
                return res.status(200).json({ status: 400, message: "You have already made your move" });
            }
            updatedGame = await Game.findByIdAndUpdate(id, {
                player1move: move
            }, { new: true });
        } else if (userId === game.player2) {
            if (game.player2move !== "") {
                return res.status(200).json({ status: 400, message: "You have already made your move" });
            }
            updatedGame = await Game.findByIdAndUpdate(id, {
                player2move: move
            }, { new: true });
        }
        if (updatedGame.player1move !== "" && updatedGame.player2move !== "") {
            if (updatedGame.player1move === "stone" && updatedGame.player2move === "stone") {
                updatedGame.roundresult[updatedGame.roundnumber - 1] = 0;
            } else if (updatedGame.player1move === "paper" && updatedGame.player2move === "paper") {
                updatedGame.roundresult[updatedGame.roundnumber - 1] = 0;
            } else if (updatedGame.player1move === "scissors" && updatedGame.player2move === "scissors") {
                updatedGame.roundresult[updatedGame.roundnumber - 1] = 0;
            } else if (updatedGame.player1move === "stone" && updatedGame.player2move === "paper") {
                updatedGame.roundresult[updatedGame.roundnumber - 1] = 2;
            } else if (updatedGame.player1move === "paper" && updatedGame.player2move === "stone") {
                updatedGame.roundresult[updatedGame.roundnumber - 1] = 1;
            } else if (updatedGame.player1move === "scissors" && updatedGame.player2move === "paper") {
                updatedGame.roundresult[updatedGame.roundnumber - 1] = 1;
            } else if (updatedGame.player1move === "paper" && updatedGame.player2move === "scissors") {
                updatedGame.roundresult[updatedGame.roundnumber - 1] = 2;
            } else if (updatedGame.player1move === "stone" && updatedGame.player2move === "scissors") {
                updatedGame.roundresult[updatedGame.roundnumber - 1] = 1;
            } else if (updatedGame.player1move === "scissors" && updatedGame.player2move === "stone") {
                updatedGame.roundresult[updatedGame.roundnumber - 1] = 2;
            }
            updatedGame = await Game.findByIdAndUpdate(id, {
                roundresult: updatedGame.roundresult
            }, { new: true });
            if (updatedGame.roundnumber < updatedGame.rounds) {
                updatedGame = await Game.findByIdAndUpdate(id, {
                    roundnumber: updatedGame.roundnumber + 1
                }, { new: true })
            } else if (updatedGame.roundnumber === updatedGame.rounds) {
                win = CheckWin(updatedGame.roundresult);
            }
            updatedGame = await Game.findByIdAndUpdate(id, {
                player1move: "",
                player2move: ""
            }, { new: true })
        }
        if (win === 0) {
            updatedGame = await Game.findByIdAndUpdate(id, {
                isdraw: true,
                isend: true
            });
        } else if (win === 1) {
            updatedGame = await Game.findByIdAndUpdate(id, {
                winner: updatedGame.player1,
                looser: updatedGame.player2,
                isend: true
            });
        } else if (win === 2) {
            updatedGame = await Game.findByIdAndUpdate(id, {
                winner: updatedGame.player2,
                looser: updatedGame.player1,
                isend: true
            });
        }
        res.status(200).json({ status: 200, message: "Move updated" });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
const createGame = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { player2, rounds } = req.body;
        const newGame = new Game({
            player1: userId,
            player2: player2,
            turn: userId,
            rounds: parseInt(rounds),
            roundresult: new Array(parseInt(rounds)),
            createdby: userId
        });
        await newGame.save();
        const notificationtitle = "New Challenge";
        const notificationbody = `${req.user.name} challenged you in a new game`;
        const newNotification = new Notification({
            userid: player2,
            notificationtitle: notificationtitle,
            notificationbody: notificationbody,
            new: true,
            redirectlink: `/game/${newGame._id}`
        });
        await newNotification.save();
        res.status(200).json({ status: 200, message: "New Game Created", gameid: newGame._id });
    } catch (error) {
        res.status(200).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
}
module.exports = { createGame, quickGame, joinQuickgame, getGame, makeMove };