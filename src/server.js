const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
//socket io needs to be on top of the server
const server = http.createServer(app);
// manage live connection with sockets
const io = socketio.listen(server);

// db connection
mongoose.connect('mongodb://kybel_dev:8Cz5RWFtNMyqrrR3@67.23.241.26:27017/chat_db')
.then(db => console.log('db is connected'))
.catch(err => console.log(err));

//settings
app.set('port', process.env.PORT || 3000);
require('./sockets')(io);

//midleware to use static files
app.use(express.static(path.join(__dirname, 'public')));

server.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});