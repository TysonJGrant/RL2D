class Particle {
  constructor(xpos, ypos) {
    this.x = xpos;
    this.y = ypos;
    this.opacity = 1;
    this.size = 8;
  }

  update(){
    this.opacity/=1.2;
    this.size-=0.4;
    if(this.size < 0)
      this.size = 0;
  }

  get_info(){
    return{x: this.x, y: this.y, size: this.size, opacity: this.opacity};
  }
}
