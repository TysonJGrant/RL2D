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
    this.MAX_ANGULAR_VELOCITY = 20;
    this.width = width;
    this.height = height;
    this.jump_still_held = false;   //needs to know difference between holding jump and dashing
    this.has_dashed = false;        //only dash once per jump
    this.in_air = 0;
    this.waiting_to_land = false;   //waiting to hit the ground or stop drifting
    this.is_alive = true;
    this.is_boosting = false;
    this.reset_position();
    global.Body.setMass(this.car, 4);
  }

  reset_position(){
    global.Body.setPosition(this.car, {x: this.initials.x, y: this.initials.y});
    global.Body.setVelocity(this.car, {x: 0, y: 0});
    this.velocity = 0;
    this.car_angle = this.initials.angle;         //way car is pointing
    this.travelling_angle = this.initials.angle;  //way car is travelling. say in air
    this.boost_amount = 33;
    this.angular_velocity = 0;
  }

  relative_to_screen(data){
    global.Body.setVelocity(this.car, {x: this.car.velocity.x + data.joystick_angle.x*8, y: this.car.velocity.y + data.joystick_angle.y*8});
    if(this.velocity < 0)
      this.travelling_angle = -Math.atan2(this.car.velocity.y, this.car.velocity.x) * (180 / Math.PI) + 180;//]; / (180 / Math.PI));
    else {
      this.travelling_angle = Math.atan2(this.car.velocity.y, this.car.velocity.x) * (180 / Math.PI) + 180;//]; / (180 / Math.PI));
    }
  }

  relative_to_car(data){
    let joystick_angle = Math.atan2(data.joystick_angle.y, data.joystick_angle.x) * (180 / Math.PI) + 90;//]; / (180 / Math.PI));    //do some maths
    let temp_angle = joystick_angle + this.car_angle;
    let xspeed = -Math.cos(temp_angle / (180 / Math.PI));
    let yspeed = -Math.sin(temp_angle / (180 / Math.PI));
    global.Body.setVelocity(this.car, {x: this.car.velocity.x + xspeed*8, y: this.car.velocity.y + yspeed*8});
    if(this.velocity < 0)
      this.travelling_angle = -Math.atan2(this.car.velocity.y, this.car.velocity.x) * (180 / Math.PI) + 180;//]; / (180 / Math.PI));
    else
      this.travelling_angle = Math.atan2(this.car.velocity.y, this.car.velocity.x) * (180 / Math.PI) + 180;//]; / (180 / Math.PI));
    this.angular_velocity = 0;
  }

  dash(data){
    this.has_dashed = true;
    this.in_air += 10;     //Dashing velocity is affected by current velocity
    //this.relative_to_screen(data);
    this.relative_to_car(data);
  }

  manage_controller_input(data){
    this.is_drifting = data.drift;

    if(this.is_drifting && this.in_air == 0)    //holding drift on ground
      this.waiting_to_land = true;

    if(!data.jump)                  //jump has been released, next jump is dash
      this.jump_still_held = false;

    if(data.jump && this.in_air == 0 && !this.jump_still_held){   //initial jump
      this.in_air = 20;
      this.jump_still_held = true;
      this.waiting_to_land = true;
    }
    else if(data.jump && this.in_air > 0 && !this.jump_still_held && !this.has_dashed){   //dashing
      this.dash(data);
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

    if(this.in_air == 0){           //on ground and not drifting
      this.angular_velocity = data.lr_stick*this.velocity/2;
      if(!this.is_drifting){
        //this.car_angle += data.lr_stick*this.velocity/2;
        if(this.waiting_to_land){                //just landed or stopped drfting
          this.angular_velocity = 0;
          this.has_dashed = false;
          this.waiting_to_land = false;
          let difference = (this.travelling_angle - this.car_angle);
          this.velocity *= Math.cos(difference / (180 / Math.PI));
        }
        this.car_angle += this.angular_velocity;
        this.travelling_angle = this.car_angle;
      }
      else
        this.car_angle += this.angular_velocity;
    }
    else{
      if(data.lr_stick == 0)      //naturally slow spin if not using joystick_angle
        this.angular_velocity /= 1.2;

      this.angular_velocity += data.lr_stick
      if(this.angular_velocity > this.MAX_ANGULAR_VELOCITY)
        this.angular_velocity = this.MAX_ANGULAR_VELOCITY;
      else if(this.angular_velocity < -this.MAX_ANGULAR_VELOCITY)
        this.angular_velocity = -this.MAX_ANGULAR_VELOCITY;

      this.car_angle += this.angular_velocity;
    }                                           //in air
    let xspeed = -Math.cos(this.travelling_angle / (180 / Math.PI));
    let yspeed = -Math.sin(this.travelling_angle / (180 / Math.PI));

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
      if(this.is_drifting){
        this.decelerate(0, 0.15);
      }
      else{
        let change = data.pedal*0.8;    //amount to accelerate by
        if(this.is_boosting)
          change += 0.4;

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
    //console.log(this.velocity)
    if(this.in_air > 0)
      this.in_air--;
    this.manage_controller_input(data);
    this.manage_boost(data);
    this.manage_velocity(data);
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
