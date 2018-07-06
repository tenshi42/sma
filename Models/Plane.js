class Plane {
  constructor(posY, x){
    if(x >= 0) {
      this.posX = -20;
      this.dirX = 2;
    }
    else {
      this.posX = canvasWidth + 20;
      this.dirX = -2;
    }
    this.x = x;
    this.posY = posY;
    this.width = imagesSizes*2;
    this.height = imagesSizes*2;
    this.img = new Image();
    this.img.src = "images/a380.png";
  }

  draw() {
    if(this.x >= 0)
      ctx.scale(-1, 1);
    ctx.drawImage(this.img, this.posX, this.posY, this.width, this.height);
    if(this.x >= 0)
      ctx.scale(-1, 1);
  }

  move() {
    if(this.x >= 0)
      this.posX -= this.dirX;
    else
      this.posX += this.dirX;
  }
}