const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('add user', (userData) => {
        const existingUser = users.find(user => user.name === userData.name);
        if (!existingUser) {
            users.push({
                id: socket.id,
                name: userData.name,
                color: userData.color
            });

            socket.userName = userData.name;  // Set the userName for this socket
            console.log('Emitting updated user list after user addition:', users);  // Debug log
            io.emit('users list', users);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        // Remove the user from the list
        users = users.filter(user => user.id !== socket.id);
        console.log('Emitting updated user list after user disconnect:', users);  // Debug log 
        io.emit('users list', users);
    });

    socket.on('chat message', (msg) => {
        console.log("Received message from client:", msg);
    
        // Check for slash commands
        if (msg.text.startsWith('/')) {
            if (msg.text === '/help') {
                socket.emit('show help');  // Send only to the sender
            } else if (msg.text === '/clear') {
                socket.emit('clear chat');  // Send only to the sender
            } else if (msg.text === '/random') {
                const randomNumber = Math.floor(Math.random() * 100);  // Generate a random number between 0 and 99
                socket.emit('show random', randomNumber);  // Send only to the sender
            }
        } else {
            socket.broadcast.emit('chat message', msg); // Send to everyone except the sender
        }
    });
    
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});



