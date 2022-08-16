const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    map: { type: Array, required: true },
    playerX: { type: String, required: true },
    playerO: { type: String, required: true },
    pointsX: { type: Number, required: true },
    pointsO: { type: Number, required: true },
    currentPlayer: { type: String, required: true },
    currentPlayerName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);