
var c = document.getElementById("field");
var ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;

var xpos = 0;
var ypos = 0;
var mouse_pos = [];
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
    console.log(2);
    xpos++;
    ypos++;
    socket.emit('update_cell', [xpos, ypos])
    if(data.users != null)
      //redraw_game(data);
      draw_background();
      draw_player();
  })

  function redraw_game(data){
    //if(csize > 2000){ won = true; }   //win when big enough. do cool implode thing

    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(xoffset, yoffset);      //Draw with player in centre of screen
    ctx.scale(scale_inc, scale_inc);
    temp = data.users;
    players = 0;
    users = [];           //Stores all segments of all players
    Object.keys(temp).forEach(function(key) {
      players++;
      segments = temp[key].segments;          //Get cell as array of segments
      for(i = 0; i < segments.length; i++){
        users.push(segments[i]);
      }
    });
    users.sort(compare_size);     //Convert to sorted array by segment size

    draw_background();

    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.rect(0, 0, 4000, 4000); //draw border
    ctx.stroke();

    food.forEach(function(item,i){              //Draw food
      draw_circle(item[0], item[1], 5, '#fccd12');
    });

    pellets.forEach(function(item,i){              //Draw pellets
      draw_circle(item.xpos, item.ypos, 20, '#5555ff');
      draw_circle(item.xpos, item.ypos, 15, '#33ccff');
    });

    mines.forEach(function(item,i){              //Draw miness
      draw_circle(item.xpos, item.ypos, 20, '#ff5555');
      draw_circle(item.xpos, item.ypos, 15, '#ffcccc');
    });

    users.forEach(function(segment,i){   //Draw players
      if(segment != null){
        cel = images[segment.image];
        ctx.drawImage(cel, 0, 0, cel.width, cel.height, segment.xpos-(segment.radius*10/2), segment.ypos-(segment.radius*10/2), segment.radius*10, segment.radius*10);
        //draw_circle(player.xpos, player.ypos, 10, player.col);
      }
    });
    ctx.restore();        //reset the transform

    //document.getElementById("score").innerHTML = ("SIZE: &nbsp&nbsp" + csize + "  scale: " + scale + "  scale_inc: " + scale_inc + "<br>GOAL: 2000");
    document.getElementById("players").innerHTML = ("PLAYERS: " + players);
    document.getElementById("score").innerHTML = ("SIZE: &nbsp&nbsp" + parseInt(csize)); // + "<br>GOAL: 2000");
    document.getElementById("pos").innerHTML = ("XPOS: " + parseInt(xpos) + "<br>YPOS: " + parseInt(ypos));
    if(won){
      scale_inc -= 0.002; //displaye win or lose and do invert explode thing. add start again button
    }
    else {
      scale = (5+cradius/5)/cradius;//something about size
      if(scale > 2) {
        scale = 1.5;
      }
      else{
        grow_amount = scale/200;
        if(Math.abs(scale_inc - scale) < grow_amount)         //smooth out size changes
          scale_inc = scale;
        else if(scale_inc > scale){
          scale_inc-=grow_amount;
        }
        else{
          scale_inc+=grow_amount;
        }
      }
    }
  }

  function draw_circle(x, y, size, c){
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  function draw_background(){
    ctx.strokeStyle = "#555555";
    ctx.fillRect(0, 0, c.width, c.height); //draw border
  }

  function draw_player(){
    ctx.strokeStyle = "#aaaaaa";
    ctx.fillRect(0, 0, 100, 60); //draw border
  }

  document.onmousemove = handleMouseMove;   //tracking mouse position and movement direction
  function handleMouseMove(event) {
      var eventDoc, doc, body;
      event = event || window.event;
      if (event.pageX == null && event.clientX != null) {
          eventDoc = (event.target && event.target.ownerDocument) || document;
          doc = eventDoc.documentElement;
          body = eventDoc.body;

          event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
          event.pageY = event.clientY +
            (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
            (doc && doc.clientTop  || body && body.clientTop  || 0 );
      }
      mousex = event.pageX;
      mousey = event.pageY;
  }
}
