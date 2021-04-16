class Ball {

  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.index = 0;
    this.options = {
      restitution: 0.8,
      friction: 0.5
    };
    this.ball = global.Bodies.circle(x, y, r, this.options);
    this.radius = r;
    global.World.add(global.engine.world, this.ball);
    this.image = "images/ball1.png";
    this.count = 50;
  }

  update(){
    this.count--;
    if(this.count == 0){
      if(this.index == 0){
        this.count = 10;
        this.index = 1;
      }
      else{
        this.count = 20;
        this.index = 0;
      }
    }
  }

  goal_scored(){
    if(this.ball.position.x < 154){
      global.Body.setPosition(this.ball, {x: this.x, y: this.y});
      global.Body.setVelocity(this.ball, {x: 0, y: 0});
      return true;
    }
    else if(this.ball.position.x > 1400){
      global.Body.setPosition(this.ball, {x: this.x, y: this.y});
      global.Body.setVelocity(this.ball, {x: 0, y: 0});
      return true;
    }
    return false;
  }

  get_info(){
    //console.log(this.ball.position.x, this.ball.velocity);
    //return {x: this.x, y: this.y, xvel: this.xvel, yvel: this.yvel, accel: this.accel};
    return {
      x: this.ball.position.x,
      y: this.ball.position.y,
      radius: this.radius,
      index: this.index,
      angle: this.ball.angle};
  }
}

module.exports = Ball;
