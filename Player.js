class Player {
  constructor(xpos, ypos, width, height, angle) {
    this.options = {
      restitution: 0.8,
      friction: 0.5
    };
    this.initials = {x: xpos, y: ypos, angle: angle}
    this.car = global.Bodies.rectangle(xpos, ypos, width, height, this.options);
    global.World.add(global.engine.world, this.car);
    this.MAX_SPEED = 10;
    this.BOOST_SPEED = 15;
    this.xpos = xpos;
    this.ypos = ypos;
    this.width = width;
    this.height = height;
    this.car_angle = angle;         //way car is pointing
    this.travelling_angle = 0;  //way car is travelling. say in air
    this.boost_amount = 0;
    this.in_air = false;
    this.is_alive = true;
    this.velocity = 10;
  }

  update_player(data){
    this.travelling_angle = this.car_angle;
    if(this.velocity != 0)
      this.car_angle += data.lr_stick*this.velocity/2;
    /*
    let max_speed = data.pedal*5; //max speed depends on how far trigger is held
    let change = data.pedal/2;    //amount to accelerate by
    console.log(change);
    if(this.velocity < max_speed){
      if(max_speed < 0)          //if needs to go slower
        this.decelerate(max_speed, change);
      else                      //if needs to go faster
        this.accelerate(max_speed, change);
    }
    else{
      if(max_speed < 0)          //if needs to go faster
        this.accelerate(max_speed, change);
      else                      //if needs to go slower
        this.decelerate(max_speed, change);
    }
    */
    //this.travelling_angle = this.car_angle;
    //if(data.pedal < 0)
      //this.travelling_angle - this.car_angle;   //player reversing

    //this.velocity += data.pedal;
    if(this.velocity > 0)       //standard deceleration based on friction
      this.decelerate(0, 0.2);
    else if(this.velocity < 0)
      this.accelerate(0, 0.2);

    let change = data.pedal;    //amount to accelerate by

    if(change > 0)       //player controlled acceleration
      this.accelerate(this.MAX_SPEED, change);
    else if(change < 0)
      this.decelerate(-this.MAX_SPEED, -change);

    let xspeed = -Math.cos(this.car_angle / (180 / Math.PI));
    let yspeed = -Math.sin(this.car_angle / (180 / Math.PI));
    this.xpos += this.velocity*xspeed;
    this.ypos += this.velocity*yspeed;
    //global.Body.setPosition(this.car, {x: this.xpos, y: this.ypos});
    global.Body.setVelocity(this.car, {x: this.velocity*xspeed, y: this.velocity*yspeed});
    //console.log(this.car.velocity)
    global.Body.setAngle(this.car, this.car_angle*Math.PI/180);
    //console.log(this.velocity*xspeed);
  }

  reset_position(){
    global.Body.setPosition(this.car, {x: this.initials.x, y: this.initials.y});
    this.velocity = 0;
    this.car_angle = this.initials.angle;
    //console.log(this.car.velocity)
    //global.Body.setAngle(this.car, this.car_angle*Math.PI/180);
  }

  accelerate(max, change){
    if(this.velocity > max){    //post boosting
      this.velocity -= 0.2;     //ignore acceleration until back to normal speed
      if(this.velocity < max)
        this.velocity = max;
    }
    else{                       //normal
      this.velocity += change;
      if(this.velocity > max)
        this.velocity = max;
    }
  }

  decelerate(goal, change){
    if(this.velocity < goal){    //post boosting
      this.velocity += 0.2;     //ignore acceleration until back to normal speed
      if(this.velocity > goal)
        this.velocity = goal;
    }
    else{                       //normal
      this.velocity -= change;
      if(this.velocity < goal)
        this.velocity = goal;
    }
  }

  increment_boost(num){
    this.boost_amount += num;
    if(this.boost_amount > 100)
      this.boost_amount = 100;
  }

  get_info(){
    return{
      x: this.car.position.x,
      y: this.car.position.y,
      width: this.width,
      height: this.height,
      car_angle: this.car_angle,
      boost_amount: this.boost_amount,
      in_air: this.in_air,
      is_alive: this.is_alive,
      velocity: this.velocity
    }
  }
}

module.exports = Player;
