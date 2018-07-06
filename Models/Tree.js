class Tree {
  constructor(posX, posY){
    this.posX = posX;
    this.posY = posY;
    this.width = imagesSizes*2;
    this.height = imagesSizes*2;
    this.img = new Image();
    this.img.src = "images/tree.png";
  }

  draw() {
    var size = imagesSizes*2 - ((1-(this.posY - canvasMinY) / (canvasHeight - canvasMinY)) * distanceViewRatio);
    this.height = size;
    this.width = size;
    ctx.drawImage(this.img, this.posX, this.posY, this.width, this.height);
  }
}