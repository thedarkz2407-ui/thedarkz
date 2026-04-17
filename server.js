// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Tell the server to serve our HTML/CSS files from a folder called "public"
app.use(express.static('public'));

// When a player connects to the game...
io.on('connection', (socket) => {
    console.log('A new player connected! ID:', socket.id);

    // Listen for a 'move' from this player
    const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
        
        // Broadcast that move to EVERYONE ELSE connected
        socket.broadcast.emit('opponentMove', moveData);
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
    });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Live Chess Server running on http://localhost:${PORT}`);
});
let players = {}; // Track who is white and who is black

io.on('connection', (socket) => {
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

    socket.on('makeMove', (moveData) => {
        // Only allow the player whose turn it is to broadcast
        socket.broadcast.emit('opponentMove', moveData);
    });

    socket.on('disconnect', () => {
        if (socket.id === players.white) delete players.white;
        if (socket.id === players.black) delete players.black;
    });
});