class Animal {
  constructor(posX, posY, image, id) {
    this.id = id;
    this.posX = posX;
    this.posY = posY;
    this.dirX = 0;
    this.dirY = 0;
    this.continuity = 0;
    this.width = imagesSizes;
    this.height = imagesSizes;
    this.img = new Image();
    this.img.src = image;
    this.size = imagesSizes;
  }

  getPosX(){
    return this.posX + this.width / 2;
  }

  getPosY(){
    return this.posY + this.height / 2;
  }

  move(){
    if(this.continuity <= 0){
      this.setDir();
    }
    this.posX += this.dirX;
    this.posY += this.dirY;
    if(!this.isInBox() || this.isTreesCollisions()){
      this.posX -= this.dirX;
      this.posY -= this.dirY;
      this.setDir();
    }
    this.continuity--;
  }

  draw() {
    var size = this.size - ((1-(this.posY - canvasMinY) / (canvasHeight - canvasMinY)) * distanceViewRatio);
    this.height = size;
    this.width = size;
    ctx.drawImage(this.img, this.posX, this.posY, this.width, this.height);
  }

  setDir() {
    this.continuity = Math.floor(Math.random() * 100);
    this.dirX = Math.random() * 2 - 1;
    this.dirY = Math.random() * 2 - 1;
  }

  isInBox() {
    return this.posX >= 0 && this.posX <= (canvasWidth - this.width) && this.posY >= canvasMinY && this.posY <= (canvasHeight - this.height);
  }

  isTreesCollisions(){
    var ret = false;
    for(var i = 0 ; i < trees.length ; i++){
      var col = this.posX <= trees[i].posX + (trees[i].width / 3 * 2) && this.posX + this.width >= trees[i].posX + (trees[i].width / 3) && this.posY <= trees[i].posY + trees[i].height && this.posY + this.height >= trees[i].posY + (trees[i].height / 4 * 3);
      if(col)
        return true;
    }
  }
}