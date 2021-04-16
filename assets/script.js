var game_ratio = 1554/1038;

var c = document.getElementById("field");
var ctx = c.getContext("2d");
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

var xpos = 100;
var ypos = 100;
var car_angle = 0;
var joystick_angle = 0;
var lr_stick = 0;
var boost_amount = 33;
var is_boosting = false;
var jump = false;
var drifting = false;
var in_air = false;
var is_alive = true;
var pedal = 0;    //amount left or right trigger is held to calculate velocity
var velocity = 0;
var ball = {x: 0, y: 0, radius: 20};
var xcentre = window.innerWidth/2;
var ycentre = window.innerHeight/2;
var show_bodies = false;
var bodies;
var trails = [new Trail(100, 100, '#0000FF')];
var socket;
var mobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
document.addEventListener("DOMContentLoaded", start);
document.getElementById('axes').style.display='none';

function start(){
  socket = io();

  //const name = prompt('What is your name?')
  socket.emit('new-player',  Math.floor(Math.random()*25));

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
    socket.emit('update_player', {pedal: pedal, lr_stick: lr_stick});
    if(data.players != null){
      draw_background(data.boosts, data.big_boosts);
      if(show_bodies)
        window.requestAnimationFrame(render);
      draw_trails(data.players);
      draw_players(data.players);
      draw_ball();
    }
  })

  socket.on('get_self_data', data => {      //get self data to calculate 'camera' position and zoom
    xpos = data.xpos;
    ypos = data.ypos;
    car_angle = data.car_angle;
    boost_amount = data.boost_amount;
    in_air = data.in_air;
    is_alive = data.is_alive;
    velocity = data.velocity;
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
  //console.log(field_image.width, field_image.height);

  boosts = all_boosts.regular;
  //console.log(boosts);
  for(let i = 0; i < boosts.length; i++){
    if(boosts[i].active)
      draw_circle(boosts[i].x, boosts[i].y, boosts[i].size, "#FFFF00")
  }

  boosts = all_boosts.big;
  //console.log(boosts);
  for(let i = 0; i < boosts.length; i++){
    let current = boosts[i];
    if(current.active){
      //draw_circle(boosts[i].x, boosts[i].y, boosts[i].size, "#00FFFF")
      ctx.save();
      ctx.translate(current.x, current.y);
      //ctx.rotate(current.car_angle*Math.PI/180);
      ctx.drawImage(boost_image, -10, -10, 20, 20);
      ctx.restore();
    }
  }


}

function draw_trails(players){
  //console.log(players);
  Object.keys(players).forEach(function(player) {
    current = players[player];
    trail = trails[0];
    trail.update({x: current.x, y: current.y}, is_boosting);
    particles = trail.get_particles();
    for(let i = 0; i < particles.length; i++){
      p = particles[i];
      ctx.fillStyle = "rgba(" + trail.col + ", " + p.opacity + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI, false);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(current.x, current.y);
    ctx.rotate(current.car_angle*Math.PI/180);
    ctx.drawImage(car_image, -current.width/2, -current.height/2, current.width, current.height);
    ctx.restore();
  })
}

function draw_players(players){
  //console.log(players);
  Object.keys(players).forEach(function(player) {
    current = players[player];
    ctx.save();
    ctx.translate(current.x, current.y);
    ctx.rotate(current.car_angle*Math.PI/180);
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
  //drawImage(ball.x, ball.y, ball.radius, "#FFFFFF");
}

function render() {     //Draw matter objects to canvas
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#00F';
  ctx.fillStyle = '#FFF';
  //ctx.clearRect(20, 20, c.width, c.height);
  ctx.beginPath();
  for (var i = 0; i < bodies.length; i += 1) {
    var vertices = bodies[i].vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (var j = 1; j < vertices.length; j += 1) {
      //console.log(vertices[j].x + "  " +  vertices[j].y);
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
  }
  ctx.fill();
  ctx.stroke();
  //console.log(bodies[1].angle);
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
    lr_stick = gamepad.axes[0]*2;    //joystick lr
    joystick_angle = gamepad.axes[1];    //do some maths
    jump = gamepad.buttons[0].pressed;  //a button
    is_boosting = gamepad.buttons[1].pressed;  //b button
    drift = gamepad.buttons[2].pressed;  //b button
    pedal = gamepad.buttons[7].value - gamepad.buttons[6].value;     //right trigger - left trigger
    //console.log(gamepad.buttons[7]);

    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Jump: " + jump, 1200, 50);
    ctx.fillText("in air: " + in_air, 1200, 80);
    ctx.fillText("Boost: " + boost_amount, 1200, 110);
    ctx.fillText("velocity: " + velocity, 1200, 140);
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

function printMousePos(event) {
  console.log(event.clientX + '  ' + event.clientY);
}

document.addEventListener("click", printMousePos);
