const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const HttpError = require('./models/http-error');
const mainRoute = require('./routes/main-route');
// const keys = require('./keys');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    }
})

const mongoUrl = `mongodb+srv://pius_gori:${process.env.mongoPassword}@piuscluster.wvoqx.mongodb.net/tic-tac-toe?retryWrites=true&w=majority`;

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use(mainRoute);

app.use((req, res, next) => {
    throw new HttpError('The page you are looking for could not be found', null, 404);
})

app.use((error, req, res, next) => {
    res.status(error.code || 500);
    res.json({ message: error.message || 'An Unknown error has occurred!', content: error.content || null })
});

const gameRooms = [];
io.on('connection', (socket) => {
    socket.emit('receive_message', 'Hello Buddy');

    socket.on('create_game', (newGame) => {
        const foundGame = gameRooms.find(room => room.id === newGame.id);
        if(!foundGame){
            gameRooms.push({ id: newGame.id, playerX: newGame.playerX, pointsX: 0, pointsO: 0, currentPlayer: 'X', currentPlayerName: newGame.playerX, map: newGame.map });
            socket.join(newGame.id);
        }
    })

    socket.on('join_game', (data) => {
        const foundGame = gameRooms.find(room => room.id === data.id);
        if(foundGame){
            let sentGame;
            for (const a of gameRooms){
                if(a.id === data.id){
                    a.playerO = data.playerO;
                    sentGame = a;
                }
            }
            socket.join(data.id);
            socket.emit('join_success', sentGame);
            socket.to(data.id).emit('joined_game', sentGame);
        }
    })

    socket.on('your_turn', (data) => {
        let updatedData;
        const foundGame = gameRooms.find(game => game.id === data.id);
        if(foundGame){
            for(const a of gameRooms){
                if(a.id === data.id){
                    a.currentPlayer = data.currentPlayer;
                    a.currentPlayerName = data.currentPlayerName;
                    a.map = data.map;
                    updatedData = a;
                }
            }
            socket.to(data.id).emit('my_turn', updatedData);
        }
    });

    socket.on('game_over', (data) => {
        const foundRoom = gameRooms.find((room) => room.id === data.id);
        let updatedGameData;
        if(foundRoom){
            for (const d of gameRooms){
                if(d.id === data.id){
                    d.playerX = data.playerX;
                    d.playerO = data.playerO;
                    d.pointsX = data.pointsX;
                    d.pointsO = data.pointsO;
                    d.currentPlayer = data.currentPlayer;
                    d.currentPlayerName = data.currentPlayerName;
                    d.map = data.map;
                    updatedGameData = d;
                }
            }
            socket.to(data.id).emit('restart_game', updatedGameData);
        }
    })

    socket.on('game_tied', (data) => {
        const foundRoom = gameRooms.find((room) => room.id === data.id);
        let updatedGameData;
        if(foundRoom){
            for (const d of gameRooms){
                if(d.id === data.id){
                    d.playerX = data.playerX;
                    d.playerO = data.playerO;
                    d.pointsX = data.pointsX;
                    d.pointsO = data.pointsO;
                    d.currentPlayer = data.currentPlayer;
                    d.currentPlayerName = data.currentPlayerName;
                    d.map = data.map;
                    updatedGameData = d;
                }
            }
            socket.to(data.id).emit('tied_restart', updatedGameData);
        }
    })
})

mongoose.connect(mongoUrl).then(() => {
    server.listen(process.env.PORT || 8000);
}).catch((err) => { console.log(err)} );