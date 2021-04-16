class Trail {
  constructor(xpos, ypos, col) {
    this.x = xpos;
    this.y = ypos;
    this.particles = [];
    this.col = "0, 0, 255";
  }

  update(pos, is_boosting){
    if(is_boosting){
      this.particles.push(new Particle(pos.x, pos.y));
      if(this.particles.length > 40)
        this.particles.shift();
    }
    for(let i = 0; i < this.particles.length; i++){
      this.particles[i].update();
    }
  }

  get_particles(){
    temp = [];
    for(let i = 0; i < this.particles.length; i++){
      temp.push(this.particles[i].get_info());
    }
    return temp;
  }
}
