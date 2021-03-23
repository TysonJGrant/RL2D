var w = 4000;
var h = 4000;

var Player = require('./Player.js');

const express = require('express');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 3000;
const INDEX = './index.html';
const SCRIPT = './script.js';

const app = express();
app.use(express.static('assets'));    //location of images, scripts etc
app.get('/', function(req, res) {     //main index page
  res.sendFile(__dirname + '/index.html');
});
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
var io = socketIO(server);

var users = {};

//Main loop
setInterval(function(){
  io.sockets.emit('update_game', {users: users});
}, 50);

io.on('connection', (socket) => {
  socket.on('new-user', cel => {
    //users[socket.id] = new Player(w, h);
    console.log(3);
    users[socket.id] = new Player(w, h);
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})
