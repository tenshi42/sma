class Meteor {
  constructor(speed) {
    this.posX = canvasWidth / 2;
    this.posY = 0;
    this.dirY = speed;
    this.width = imagesSizes / 3;
    this.height = imagesSizes;
    this.img = new Image();
    this.img.src = "images/meteor.png";
    // TODO : modify image
  }

  draw() {
    ctx.drawImage(this.img, this.posX, this.posY, this.width, this.height);
  }

  move() {
    //while (this.posY < meteorImpactPoint){
    this.posY += this.dirY;
    //}
    if(this.posY > meteorImpactPoint){
      console.log("Impact !");
      this.dirY = 0;
      // TODO : destruct meteor.
    }
  }

  impact() {
    // TODO
  }
}