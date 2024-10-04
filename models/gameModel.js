const mongoose = require('mongoose');
const gameSchema = new mongoose.Schema({
    player1: {
        type: String,
        default: ""
    },
    player2: {
        type: String,
        default: ""
    },
    player1move: {
        type: String,
        default: ""
    },
    player2move: {
        type: String,
        default: ""
    },
    player1join: {
        type: Boolean,
        default: false
    },
    player2join: {
        type: Boolean,
        default: false
    },
    rounds: {
        type: Number,
        default: 0
    },
    roundnumber: {
        type: Number,
        default: 1
    },
    isend: {
        type: Boolean,
        default: false
    },
    roundresult: {
        type: Array,
        default: []
    },
    createdby: {
        type: String,
        default: ""
    },
    winner: {
        type: String,
        default: ""
    },
    looser: {
        type: String,
        default: ""
    },
    isdraw: {
        type: Boolean,
        default: false
    }
});
const Game = mongoose.model('games', gameSchema);
module.exports = Game;