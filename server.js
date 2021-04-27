var w = 1554;
var h = 1038;
var score = {blue: 0, orange: 0};
var timer = 300;

var Player = require('./Player.js');
var Ball = require('./Ball.js');
var Field = require('./Field.js');
var world_objects = [];

const express = require('express');
const socketIO = require('socket.io');
const Matter = require('matter-js');
const PORT = process.env.PORT || 3000;
const INDEX = './index.html';
const SCRIPT = './script.js';

global.Engine = Matter.Engine;
global.Body = Matter.Body;
global.Vertices = Matter.Vertices;
    //Render = Matter.Render,
global.World = Matter.World;
    //Composites = Matter.Composites,
global.Composite = Matter.Composite;
global.Bodies = Matter.Bodies;
global.engine = Engine.create();
global.world_objects = [];

global.engine.world.gravity.x = 0;
global.engine.world.gravity.y = 0;

var field = new Field(w, h);
var boxA = Bodies.rectangle(400, 200, 80, 80);
var ball = new Ball(w/2, h/2, 20);
var ballB = Bodies.circle(460, 10, 40, 2);

global.world_objects.push(ball, boxA, ballB);
//engine.world.gravity = 0;
World.add(engine.world, world_objects);

const app = express();
app.use(express.static('assets'));    //location of images, scripts etc
app.get('/', function(req, res) {     //main index page
  res.sendFile(__dirname + '/index.html');
});
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
var io = socketIO(server);

var players = {};

//Main loop
setInterval(function(){
  Engine.update(engine, 16);
  ball.update();
  let scored = ball.goal_scored();
  if(scored != false){
    Object.keys(players).forEach(function(player) {
      players[player].reset_position();
    })
    if(scored == "orange")
      score.orange++;
    else if(scored == 'blue')
      score.blue++;
  };
  field.update(players);
  if(Object.keys(players).length > 1)
    timer -= 0.04;
  else
    timer = 300;

  let players_info = {};
  let world_info = [];
  Object.keys(players).forEach(function(player) {
    players_info[player] = players[player].get_info();
  })

  // let bodies = Composite.allBodies(engine.world);
  // world_objects = bodies;   //delete this when only need to pass world builds, not everything
  // for (var i = 0; i < world_objects.length; i ++) {
  //   let vertices = world_objects[i].vertices;
  //   let points = [];
  //   for (var j = 0; j < vertices.length; j ++)
  //     points.push({x: vertices[j].x, y: vertices[j].y});
  //   world_info.push({vertices: points, angle: world_objects[i].angle});
  // }
  io.sockets.emit('update_game', {players: players_info, ball: ball.get_info(), bodies: world_info, boosts: field.get_boost_info(), score: score, timer: Math.round(timer)});
}, 40);

io.on('connection', (socket) => {
  socket.on('new-player', () => {
    //player[socket.id] = new Player(w, h);
    if(Object.keys(players).length < 2){
      if(Object.keys(players).length == 0)
        players[socket.id] = new Player(318, 519, 30, 14, 180, "blue");
      else if(Object.keys(players).length == 1){
        Object.keys(players).forEach(function(player) {
          players[player].reset_position();
          ball.reset_position();
          if(players[player].colour == "blue")
            players[socket.id] = new Player(1233, 519, 30, 14, 0, "orange");
          else
            players[socket.id] = new Player(318, 519, 30, 14, 180, "blue");
        })
      }
      console.log("New Player. ID: " + socket.id);
      socket.emit('get_self_data', {id: socket.id});
    }
    else{
      console.log("new Spectator");
    }
  })

  socket.on('update_player', data => {
    if(players[socket.id] != null){
      players[socket.id].update_player(data);
    }
  })

  socket.on('disconnect', () => {
    console.log(socket.id + " disconnected");
    if(players[socket.id] != undefined)
      players[socket.id].destroy();
    delete players[socket.id]
  })
})
