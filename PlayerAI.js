var Player = require('./Player.js');

class PlayerAI extends Player {
  constructor(xpos, ypos, width, height, angle, colour) {
    super(xpos, ypos, width, height, angle, colour);
  }

  update_player(ball){
    let angle_to_ball = Math.atan2(this.car.position.y - ball.y, this.car.position.x - ball.x) * 180/Math.PI;
    let angle_offset = (angle_to_ball - this.car_angle + 540) % 360;
    let lr;
    let boosting = false;
    if(angle_offset > 180){
      if((angle_offset - 180) < 1){
        lr = angle_offset - 180;
        boosting = true;
      }
      else{
        lr = 1;
      }
    }
    else{
      if((angle_offset - 180) > -1){
        lr = angle_offset - 180;
        boosting = true;
      }
      else{
        lr = -1;
      }
    }
    //console.log(lr);
    let temp = {
      lr_stick: lr,
      joystick_angle: 0,
      jump: false,
      drift: false,
      is_boosting: boosting,
      pedal: 0.5
    }
    if(this.in_air > 0)
      this.in_air--;
    this.manage_controller_input(temp);
    this.manage_boost(temp);
    this.manage_velocity(temp);
  }
}

module.exports = PlayerAI;
