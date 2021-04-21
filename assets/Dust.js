class Dust {
  constructor(xpos, ypos) {
    this.x = xpos;
    this.y = ypos;
    this.particles = [];
    this.col = "150, 75, 0";
  }

  update(pos, is_drifting){
    if(is_drifting){
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
