class Plane {
  constructor(posY, x, id){
    this.img = new Image();
    if(x >= 0) {
      this.posX = imagesSizes;
      console.log(this.posX);
      this.dirX = 2;
      this.img.src = "images/a380_2.png";
    }
    else {
      this.posX = canvasWidth + 20;
      this.dirX = -2;
      this.img.src = "images/a380.png";
    }
    this.x = x;
    this.isCrashing = false;
    this.crashingSpeed = 5;
    this.id = id;
    this.posY = posY;
    this.width = imagesSizes*2;
    this.height = imagesSizes*2;
  }

  draw() {
    ctx.drawImage(this.img, this.posX, this.posY, this.width, this.height);
  }

  move() {
    this.posX += this.dirX;

    if((this.x >= 0 && this.posX > canvasWidth) ||
      (this.x < 0 && this.posX < -this.width)) {
      planesToDelete.push(this.id);
    }

    for(var i in planes){
      var other = planes[i];
      if(this.id === other.id) {
        continue;
      }

      if(this.posX + this.width < other.posX || this.posX > other.posX + other.width ||
         this.posY + this.height < other.posY || this.posY > other.posY + other.height){
        // No colision
      }
      else{
        console.log("I SAY CRASH !!!!");
        this.isCrashing = true;
        other.isCrashing = true;
      }
    }

    if(this.isCrashing){
      if(this.posY <= canvasMinY) {
        this.posY += this.crashingSpeed;
      }
    }
  }
}