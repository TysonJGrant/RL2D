class Boost {
  constructor(xpos, ypos) {
    this.x = xpos;
    this.y = ypos;
    this.active = true;
    this.timer = 0;
    this.timer_increment = 80;
    this.size = 5;
    this.boost_amount = 12;
  }

  update(){
    if(this.timer > 0)
      this.timer--;
  }

  get_info(){
    return{x: this.x, y: this.y, size: this.size, active: (this.timer == 0)};
  }

  collided(player){
    if(this.timer == 0){
      var a = player.xpos - this.x;
      var b = player.ypos - this.y;
      var c = Math.sqrt( a*a + b*b );
      if(c < (this.size + player.width/2) && player.boost_amount < 100){  //basically if half car car length away from centre
        this.timer = this.timer_increment;
        player.increment_boost(this.boost_amount);
      }
    }
  }
}

module.exports = Boost;
