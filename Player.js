class Player {
  constructor(xpos, ypos, width, height, angle) {
    this.options = {
      restitution: 0.1,
      friction: 0.5,
      frictionAir: 0.02
    };
    this.initials = {x: xpos, y: ypos, angle: angle}
    this.car = global.Bodies.rectangle(xpos, ypos, width, height, this.options);
    global.World.add(global.engine.world, this.car);
    this.MAX_SPEED = 10;
    this.BOOST_SPEED = 15;
    this.width = width;
    this.height = height;
    this.car_angle = angle;         //way car is pointing
    this.travelling_angle = angle;  //way car is travelling. say in air
    this.boost_amount = 33;
    this.jump_still_held = false;   //needs to know difference between holding jump and dashing
    this.has_dashed = false;        //only dash once per jump
    this.in_air = 0;
    this.is_alive = true;
    this.is_boosting = false;
    this.is_drifting = false;
    this.velocity = 0;
    global.Body.setMass(this.car, 4);
  }

  manage_controller_input(data){
    //console.log(data.joystick_angle);
    this.drifting = data.drift;
    if(this.in_air == 0)
      this.has_dashed = false;
    if(!data.jump)
      this.jump_still_held = false;

    if(data.jump && this.in_air == 0 && !this.jump_still_held){   //initial jump
      this.in_air = 20;
      this.jump_still_held = true;
    }
    else if(data.jump && this.in_air > 0 && !this.jump_still_held && !this.has_dashed){   //dashing
      this.has_dashed = true;
      this.in_air += 10;     //Dashing velocity is affected by current velocity
        //let xspeed = -Math.cos(this.travelling_angle / (180 / Math.PI));
        //let yspeed = -Math.sin(this.travelling_angle / (180 / Math.PI));
        console.log(data.joystick_angle);
        //this.travelling_angle = data.joystick_angle;
        console.log(this.car.velocity);
        global.Body.setVelocity(this.car, {x: this.car.velocity.x + data.joystick_angle.x*5, y: this.car.velocity.y + data.joystick_angle.y*5});
        console.log(this.car.velocity);
        console.log("-")
        this.travelling_angle = Math.atan2(this.car.velocity.y, this.car.velocity.x) * (180 / Math.PI) + 180;//]; / (180 / Math.PI));

      //console.log(data.joystick_angle);
    }
  }

  manage_boost(data){
    if(data.is_boosting && this.boost_amount > 0){
      this.is_boosting = true;
      this.boost_amount-=2;
      if(this.boost_amount < 0)
        this.boost_amount = 0;
    }
    else
      this.is_boosting = false;
  }

  manage_angle(data){
    if(this.in_air)
      this.car_angle += data.lr_stick*8;
    else
      this.car_angle += data.lr_stick*this.velocity/2;

    if(this.in_air == 0 && !this.drifting)
      this.travelling_angle = this.car_angle;
    let xspeed = -Math.cos(this.travelling_angle / (180 / Math.PI));
    let yspeed = -Math.sin(this.travelling_angle / (180 / Math.PI));
    //console.log(this.travelling_angle)
    global.Body.setAngle(this.car, this.car_angle*Math.PI/180);
    this.travelling_angle = this.travelling_angle % 360;
    this.car_angle = this.car_angle % 360;
    return {x: this.velocity*xspeed, y: this.velocity*yspeed};
  }

  manage_velocity(data){
    let vel = Math.sqrt((this.car.velocity.x * this.car.velocity.x) + (this.car.velocity.y * this.car.velocity.y));  //get velocity of body
    if(this.velocity < 0)
      this.velocity = -vel;
    else
      this.velocity = vel;

    if(this.in_air == 0){
      if(this.drifting){
        this.decelerate(0, 0.15);
      }
      else{
        let change = data.pedal;    //amount to accelerate by

        if(change > 0){       //player controlled acceleration
          if(this.is_boosting)
            this.accelerate(this.BOOST_SPEED, change);
          else
            this.accelerate(this.MAX_SPEED, change);
        }
        else if(change < 0)
          this.decelerate(-this.MAX_SPEED, -change);
      }
    }
    global.Body.setVelocity(this.car, this.manage_angle(data));
  }

  update_player(data){
    if(this.in_air > 0)
      this.in_air--;
    this.manage_controller_input(data);
    this.manage_boost(data);
    this.manage_velocity(data);
  }

  reset_position(){
    global.Body.setPosition(this.car, {x: this.initials.x, y: this.initials.y});
    this.velocity = 0;
    this.car_angle = this.initials.angle;
    this.boost_amount = 33;
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
