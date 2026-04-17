const socket = io(); // Connect to our Node server
var board = null;
var game = new Chess(); // The "Brain" (rules engine)
var $status = $('#status');

function onDrop(source, target) {
    // Check if the move is legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Always promote to queen for simplicity
    });

    // If illegal move, snap the piece back
    if (move === null) return 'snapback';

    // If legal, send the move to the server!
    socket.emit('makeMove', move);
    updateStatus();
}

// Receive move from the other player
socket.on('opponentMove', function(moveData) {
    game.move(moveData);
    board.position(game.fen());
    updateStatus();
});

function updateStatus() {
    var status = '';
    var moveColor = (game.turn() === 'b') ? 'Black' : 'White';

    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
    } else if (game.in_draw()) {
        status = 'Game over, drawn position';
    } else {
        status = moveColor + ' to move';
    }
    $status.html(status);
}

var config = {
    draggable: true,
    position: 'start',
    onDrop: onDrop
};
board = ChessBoard('myBoard', config);
updateStatus();
var playerRole = null;

socket.on('playerRole', function(role) {
    playerRole = role;
    // Flip the board if you are black
    if (playerRole === 'b') {
        board.orientation('black');
    }
});

function onDragStart (source, piece, position, orientation) {
    // 1. Don't let the game start if it's over
    if (game.game_over()) return false;

    // 2. ONLY allow the player to move THEIR own color
    if ((playerRole === 'w' && piece.search(/^b/) !== -1) ||
        (playerRole === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }

    // 3. Only move if it's your turn
    if ((game.turn() === 'w' && playerRole !== 'w') ||
        (game.turn() === 'b' && playerRole !== 'b')) {
        return false;
    }
}
// Add 'onDragStart: onDragStart' to your 'config' object at the bottom!