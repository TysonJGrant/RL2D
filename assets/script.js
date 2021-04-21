var game_ratio = 1554/1038;

var c = document.getElementById("field");
var ctx = c.getContext("2d");
var orange_div = document.getElementById("orange_score");
var blue_div = document.getElementById("blue_score");
var timer = document.getElementById("timer");
// c.width = window.innerWidth;
// c.height = window.innerHeight;
//c.width = 1598;
//c.height = 1066;
car_image = new Image();
//car_image.src = "images/car.png";
car_image.src = "images/octane.png";
ball_images = get_ball_images();
field_image = new Image();
field_image.src = "images/field.jpg";
boost_image = new Image();
boost_image.src = "images/boost.png";
console.log(ball_images);

var id = "";    //id of player, generated by server. used to get self values from players array


var joystick_angle = {x: 0, y: 0};   //Controller input values. server will interpret actual values based on game/car state
var lr_stick = 0;
var is_boosting = false;
var jump = false;
var drift = false;
var pedal = 0;    //amount left or right trigger is held to calculate velocity

var players = {};
var ball = {x: 0, y: 0, radius: 20};
var show_bodies = false;
var bodies;
var trails = {};
var dusts = {};
var socket;
var mobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
document.addEventListener("DOMContentLoaded", start);
document.getElementById('axes').style.display='none';

function start(){
  socket = io();

  //const name = prompt('What is your name?')
  socket.emit('new-player');

  socket.on('update_game', data => {
    screen_ratio = window.innerWidth/window.innerHeight;    //fill screen
    if(screen_ratio < game_ratio){
      c.style.width = window.innerWidth + "px";
      c.style.height = 'auto';
    }
    else {
      c.style.height = window.innerHeight + "px";
    }

    players = data.players;
    ball = data.ball;
    bodies = data.bodies;
    blue_div.innerHTML = data.score.blue;
    orange_div.innerHTML = data.score.orange;
    let seconds = data.timer%60;
    if(seconds < 10)
      seconds = '0' + seconds;
    timer.innerHTML = Math.floor(data.timer/60) + ":" + seconds;
    socket.emit('update_player', {drift: drift, joystick_angle: joystick_angle, jump: jump, pedal: pedal, lr_stick: lr_stick, is_boosting: is_boosting});
    if(Object.keys(players).length != 0){
      draw_background(data.boosts, data.big_boosts);
      if(show_bodies)
        window.requestAnimationFrame(render);
      draw_trails();
      draw_dust();
      draw_players();
      draw_ball();
      draw_hud();
    }
  })

  socket.on('get_self_data', data => {
    id = data.id;
  })

  socket.on('get_game_data', food_pos => {    //called when user enters and gets current food positions
    food = food_pos;
  })
}

function draw_circle(x, y, size, c){
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2 * Math.PI, false);
  ctx.fill();
}

function draw_background(all_boosts){
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(field_image, 0, 0);

  boosts = all_boosts.regular;
  for(let i = 0; i < boosts.length; i++){
    if(boosts[i].active)
      draw_circle(boosts[i].x, boosts[i].y, boosts[i].size, "#FFFF00")
  }

  boosts = all_boosts.big;
  for(let i = 0; i < boosts.length; i++){
    let current = boosts[i];
    if(current.active){
      //draw_circle(boosts[i].x, boosts[i].y, boosts[i].size, "#00FFFF")
      ctx.save();
      ctx.translate(current.x, current.y);
      ctx.drawImage(boost_image, -10, -10, 20, 20);
      ctx.restore();
    }
  }


}

function draw_trails(){
  Object.keys(players).forEach(function(player) {
    current = players[player];
    if(trails[player] == undefined)
      trails[player] = new Trail(current.x, current.y);
    trail = trails[player];
    trail.update({x: current.x, y: current.y}, current.boost_amount > 0 && is_boosting);
    particles = trail.get_particles();
    for(let i = 0; i < particles.length; i++){
      p = particles[i];
      ctx.fillStyle = "rgba(" + trail.col + ", " + p.opacity + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI, false);
      ctx.fill();
    }
  })
}

function draw_dust(){
  Object.keys(players).forEach(function(player) {
    current = players[player];
    if(dusts[player] == undefined)
      dusts[player] = new Dust(current.x, current.y);
    dust = dusts[player];
    dust.update({x: current.x, y: current.y}, drift);
    particles = dust.get_particles();
    for(let i = 0; i < particles.length; i++){
      p = particles[i];
      ctx.fillStyle = "rgba(" + dust.col + ", " + p.opacity + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI, false);
      ctx.fill();
    }
  })
}

function draw_players(){
  Object.keys(players).forEach(function(player) {
    current = players[player];
    ctx.save();
    ctx.translate(current.x, current.y);
    ctx.rotate(current.car_angle*Math.PI/180);
    if(current.in_air > 0)
      ctx.drawImage(car_image, -current.width*1.4/2, -current.height*1.4/2, current.width*1.4, current.height*1.4);
    else
      ctx.drawImage(car_image, -current.width/2, -current.height/2, current.width, current.height);
    ctx.restore();
  })
}

function draw_ball(){
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.angle);
  ctx.drawImage(ball_images[ball.index], -ball.radius, -ball.radius, ball.radius*2, ball.radius*2);
  ctx.restore();
}

function draw_hud(){
  p = players[id].boost_amount;
  span_progress = document.getElementById("boost_bar"),
  div_loading_progress = document.getElementById("boost_amount");
  span_progress.className="c100 p"+p + " big magenta";
  div_loading_progress.innerHTML=""+p+"%";
}

function render() {     //Draw matter objects to canvas
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#00F';
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  for (var i = 0; i < bodies.length; i += 1) {
    var vertices = bodies[i].vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
  }
  ctx.fill();
  ctx.stroke();
}

function get_ball_images(){
  temp = [];
  temp[0] = get_image("images/ball1.png");
  temp[1] = get_image("images/ball2.png");
  return temp;
}

function get_image(location)
{
  base_image = new Image();
  base_image.src = location;
  return base_image;
}




//Record all necessary controller touches
window.addEventListener('gamepadconnected', (event) => {
  const update = () => {
    var gamepad = navigator.getGamepads()[0];
    if(Math.abs(gamepad.axes[0]) > 0.1)
      lr_stick = gamepad.axes[0]*2;    //joystick lr and sensitivity
    else
      lr_stick = 0;

    if(Math.abs(gamepad.axes[0]) < 0.2 && Math.abs(gamepad.axes[1]) < 0.2)        //joystick angle and sensitivity
      joystick_angle = {x: 0, y: 0};
    else
      joystick_angle = {x: gamepad.axes[0], y: gamepad.axes[1]};
      //joystick_angle = Math.atan2(gamepad.axes[1], gamepad.axes[0]) * (180 / Math.PI) + 180;//]; / (180 / Math.PI));    //do some maths
    //joystick_angle = (Math.abs(gamepad.axes[1]))
    jump = gamepad.buttons[0].pressed;  //a button
    is_boosting = gamepad.buttons[1].pressed;  //b button
    drift = gamepad.buttons[2].pressed;  //b button
    pedal = gamepad.buttons[7].value - gamepad.buttons[6].value;     //right trigger - left trigger
    //console.log(gamepad.buttons[7]);

    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Jump: " + jump, 1200, 50);
    ctx.fillText("in air: " + players[id].in_air, 1200, 80);
    ctx.fillText("Boost: " + players[id].boost_amount, 1200, 110);
    ctx.fillText("velocity: " + players[id].velocity, 1200, 140);
    ctx.fillText("pedal: " + pedal, 1200, 170);
    ctx.fillText("Drift: " + drift, 1200, 200);
    requestAnimationFrame(update);
  };
  update();
});

window.addEventListener("keydown", function (event) {
  if(event.key == 1)
    show_bodies = show_bodies ? false : true;
});
