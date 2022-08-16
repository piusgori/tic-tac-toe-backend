const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const Game = require('../models/game');
const Person = require('../models/person');

exports.main = (req, res, next) => {
    res.status(200).json({ message: 'Welcome to Tic Tac Toe' });
}

exports.createAccount = async (req, res, next) => {
    const { name, email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const errorArray = errors.array();
        const messageArray = [];
        for (const a of errorArray) {
            messageArray.push({ message: a.msg, type: a.param });
        }
        return next(new HttpError('Unable to Proceed', messageArray, 422));
    }
    let foundPerson;
    try {
        foundPerson = await Person.findOne({ email });
        if(foundPerson){
            return next(new HttpError('Person already exists', [{ message: 'Person already exists', type: 'person' }], 403));
        }
    } catch (err) {
        return next(new HttpError('Unable to look for people'));
    }

    const newPerson = new Person({ name: name, email: email });

    try {
        await newPerson.save();
    } catch (err) {
        return next(new HttpError('Unable to save user'));
    }
    res.status(201).json({ message: 'Person Created', id: newPerson._id, name: newPerson.name, email: newPerson.email })
}

exports.login = async (req, res, next) => {
    const { email } = req.body;
    let foundPerson;
    try {
        foundPerson = await Person.findOne({ email });
        if(!foundPerson){
            return next(new HttpError('Person not found', [{ message: 'Person not found', type: 'person' }], 404));
        }
    } catch (err) {
        return next(new HttpError('Unable to find person'));
    }
    res.status(200).json({ message: 'Person found', id: foundPerson._id, name: foundPerson.name, email: foundPerson.email });
}

exports.createGame = async (req, res, next) => {
    const { map, email, name } = req.body;
    let foundPerson;
    try {
        foundPerson = await Person.findOne({ email });
        if(!foundPerson){
            return next(new HttpError('Person not found', [{ message: 'The person is not found', type: 'person' }], 404));
        }
    } catch (err) {
        return next(new HttpError('Unable to look for people'));
    }

    const newGame = new Game({ currentPlayer: 'X', currentPlayerName: name, map: map, playerX: name, playerO: "Not Joined", pointsO: 0, pointsX: 0 });

    try {
        await newGame.save();
    } catch (err) {
        return next(new HttpError('Unable to save new game'));
    }

    res.status(201).json({ message: 'Game Created', id: newGame._id, currentPlayer: newGame.currentPlayer, currentPlayerName: newGame.currentPlayerName, map: newGame.map, playerX: newGame.playerX, playerO: newGame.playerO, pointsO: newGame.pointsO, pointsX: newGame.pointsX });
}

exports.joinGame = async (req, res, next) => {
    const { email, gameId } = req.body;
    let foundPerson;
    try {
        foundPerson = await Person.findOne({ email });
        if(!foundPerson){
            return next(new HttpError('Person not found', [{ message: 'Person not found', type: 'person' }], 404));
        }
    } catch (err) {
        return next(new HttpError('Unable to find person'));
    }

    let foundGame;

    try {
        foundGame = await Game.findByIdAndUpdate(gameId, { playerO: foundPerson.name });
        if(!foundGame){
            return next(new HttpError('Game not found', [{ message: 'Game not found', type: 'game' }], 404));
        }
    } catch (err) {
        return next(new HttpError('Unable to look for game'));
    }
    res.status(200).json({ message: 'Game, joined', id: foundGame._id, currentPlayer: foundGame.currentPlayer, currentPlayerName: foundGame.currentPlayerName, map: foundGame.map, playerX: foundGame.PlayerX, playerO: foundGame.playerO, pointsO: foundGame.pointsO, pointsX: foundGame.pointsX });
}

exports.changeTurn = async (req, res, next) => {
    const { currentPlayer, playerX, playerO, map, name, gameId } = req.body;
    const turnPlayer = currentPlayer === 'X' ? 'O' : 'X';
    const turnPlayerName = turnPlayer === 'X' ? playerO : playerX;
    let foundGame;
    try {
        foundGame = Game.findByIdAndUpdate(gameId, { map: map, currentPlayer: turnPlayer, currentPlayerName: turnPlayerName });
        if(!foundGame){
            return next(new HttpError('Game not found', [{ message: 'Game not found', type: 'game' }], 404));
        }
    } catch (err) {
        return next(new HttpError('Unable to search game'));
    }
    res.status(200).json({ message: 'Updated Game', id: foundGame._id, currentPlayer: foundGame.currentPlayer, currentPlayerName: foundGame.currentPlayerName, map: foundGame.map, playerX: foundGame.PlayerX, playerO: foundGame.playerO, pointsO: foundGame.pointsO, pointsX: foundGame.pointsX })
}

exports.gameOver = async (req, res, next) => {
    const { newCurrentPlayer, newCurrentPlayerName, newPointsX, newPointsY, map, gameId } = req.body;
    let foundGame
    try {
        foundGame = await Game.findById(gameId);
        if(!foundGame){
            return next(new HttpError('Game not found', [{ message: 'Game not found', type: 'game' }], 404));
        }
    } catch (err) {
        return next(new HttpError('Unable to update game'));
    }
    foundGame.map = map;
    foundGame.pointsO = newPointsY;
    foundGame.pointsX = newPointsX;
    foundGame.currentPlayer = newCurrentPlayer;
    foundGame.currentPlayerName = newCurrentPlayerName;

    try {
        await foundGame.save();
    } catch (err) {
        return next(new HttpError('Unable to save the game'));
    }
    res.status(200).json({ message: 'Game renewed', id: foundGame._id, currentPlayer: foundGame.currentPlayer, currentPlayerName: foundGame.currentPlayerName, map: foundGame.map, playerX: foundGame.PlayerX, playerO: foundGame.playerO, pointsO: foundGame.pointsO, pointsX: foundGame.pointsX })
}