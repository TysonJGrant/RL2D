
var c = document.getElementById("field");
var ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;

var xpos = 100;
var ypos = 100;
var xmove = 0;
var ymove = 0;
var xcentre = window.innerWidth/2;
var ycentre = window.innerHeight/2;
var players = 1;
var socket;
var mobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
document.addEventListener("DOMContentLoaded", start);

function start(){
  socket = io();

  //const name = prompt('What is your name?')
  socket.emit('new-user',  Math.floor(Math.random()*25));

  socket.on('update_game', data => {
    xpos+=xmove;
    ypos+=ymove;
    socket.emit('update_cell', [xpos, ypos])
    if(data.users != null)
      draw_background();
      draw_player();
  })

  function draw_circle(x, y, size, c){
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  function draw_background(){
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, c.width, c.height);
  }

  function draw_player(){
    draw_circle(xpos, ypos, 20, "#00FF00");
  }
}

window.addEventListener('gamepadconnected', (event) => {
  const update = () => {
    const output = document.getElementById('axes');
    output.innerHTML = ''; // clear the output

    var gamepad = navigator.getGamepads()[0];
    xmove = gamepad.axes[0]*5;
    ymove = gamepad.axes[1]*5;

    requestAnimationFrame(update);
  };
  update();
});
