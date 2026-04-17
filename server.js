// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Tell the server to serve our HTML/CSS files from a folder called "public"
app.use(express.static('public'));

let players = {}; // Track who is white and who is black

// When a player connects to the game...
io.on('connection', (socket) => {
    console.log('A new player connected! ID:', socket.id);

    // Assign roles based on who joins first
    if (!players.white) {
        players.white = socket.id;
        socket.emit('playerRole', 'w');
    } else if (!players.black) {
        players.black = socket.id;
        socket.emit('playerRole', 'b');
    } else {
        socket.emit('playerRole', 'spectator');
    }

    // Listen for a 'makeMove' from this player
    socket.on('makeMove', (moveData) => {
        // Only allow the player whose turn it is to broadcast
        socket.broadcast.emit('opponentMove', moveData);
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        if (socket.id === players.white) delete players.white;
        if (socket.id === players.black) delete players.black;
    });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});