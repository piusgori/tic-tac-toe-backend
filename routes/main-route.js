const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const mainController = require('../controllers/main-controller');

router.get('/', mainController.main);

router.post('/account', [
    body('name').isLength({ min: 3 }).withMessage('Please enter a a valid name of at least 3 characters'),
    body('email').normalizeEmail().isEmail().withMessage('Please enter a valid email address'),
], mainController.createAccount);

router.post('/login', mainController.login);

router.post('/new-game', mainController.createGame);

router.post('/join-game', mainController.joinGame);

router.post('/turn', mainController.changeTurn);

router.post('/game-over', mainController.gameOver);

module.exports = router;