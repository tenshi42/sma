var canvasWidth = 600;
var canvasHeight = 400;
var distanceMax = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
var canvas = null;
var ctx = null;
var rate = 30;
var loopHandler = null;
var lapinId = 0;
var renardId = 0;
var lapins = [];
var renards = [];
var reproductionDelay = 1;
var frame = 0;
var running = false;
var visionRange = 300;
var foxDieTime = 10 000;
var foxtodie = [];

class Animal {
  constructor(posX, posY, image, id) {
    this.id = id;
    this.posX = posX;
    this.posY = posY;
    this.dirX = 0;
    this.dirY = 0;
    this.continuity = 0;
    this.width = 35;
    this.height = 35;
    this.img = new Image();
    this.img.src = image;
  }

  getPosX(){
    return this.posX;
  }

  getPosY(){
    return this.posY;
  }

  move(){
    if(this.continuity <= 0){
      this.setDir();
    }
    this.posX += this.dirX;
    this.posY += this.dirY;
    if(!this.isInBox()){
      this.posX -= this.dirX;
      this.posY -= this.dirY;
      this.setDir();
    }
    this.continuity--;
  }

  draw() {
    ctx.drawImage(this.img, this.posX, this.posY, this.width, this.height);
  }

  setDir() {
    this.continuity = Math.floor(Math.random() * 100);
    this.dirX = Math.random() * 2 - 1;
    this.dirY = Math.random() * 2 - 1;
  }

  isInBox() {
    return this.posX >= 0 && this.posX <= canvasWidth - this.width && this.posY >= 0 && this.posY <= canvasWidth - this.height;
  }
}

class Lapin extends Animal{
  constructor(posX, posY){
    super(posX, posY, "images/lapin1.png");
  }
}

class Renard extends Animal{
  constructor(posX, posY, visionRange, id){
    var dieTime= foxDieTime;
    super(posX, posY, "images/renard_repro.png");
    // TODO : declare somewhere else ??
    this.visionRange = visionRange;
    this.id = id;
    setTimeout(function(){
      foxtodie[] = this.id;
    }, dieTime);
  }

  /**
   * Get position of each rabbit,
   * and returns nearest's indice.
   *
   * @returns {*}
   */

  detectRabbit(){
    /*
      var a = x1 - x2;
      var b = y1 - y2;
      var c = Math.sqrt( a*a + b*b );
     */
    var distances = [];
    var distanceMin = distanceMax +1;
    var iMin = 0;

    for (var i in lapins){
      var a = lapins[i].getPosX - this.posX;
      var b = lapins[i].getPosY - this.posY;

      distances[i] = Math.sqrt(a*a + b*b);

      if (distances[i] < distanceMin){
        distanceMin = distances[i];
        iMin = i;
      }
    }

    if (distanceMin < this.visionRange){
      return [iMin, distanceMin];
    } else {
      return null;
    }
  }

  /**
   * Renard movement towards targeted Lapin
   *
   * @param i indice of Lapin in lapins[]
   */
  chaseRabbit(i) {
    var xL = lapins[i].posX;
    var yL = lapins[i].posY;

    // TODO : calculate distance to avoid strange movement behavior

    if (xL < this.posX) {
      this.dirX = -1;
    } else if (xL > this.posX) {
      this.dirX = 1;
    } else {
      // ??
    }

    if (yL < this.posY) {
        this.dirY = -1;
    } else if (yL > this.posY) {
        this.dirY = 1;
    } else {
      // ??
    }

    // Max speed movement
    this.posX += this.dirX;
    this.posY += this.dirY;
    // TODO : ad continuity ?
  }

}

function addLapin() {
  var x = Math.floor(Math.random() * canvasWidth);
  var y = Math.floor(Math.random() * canvasHeight);
  lapins[lapinId++] = new Lapin(x, y);
}

function addRenard() {
  var x = Math.floor(Math.random() * canvasWidth);
  var y = Math.floor(Math.random() * canvasHeight);
  renards[renardId++] = new Renard(x, y, visionRange);
}

function draw() {
  drawInterface();

  for(var i in lapins){
    lapins[i].draw();
  }

  for(var i in renards){
    renards[i].draw();
  }
}

function move() {
  for(var i in renards){
    var y = renards[i].detectRabbit();
    if (y >= 0){
      renards[i].chaseRabbit(y);
    } else {
      renards[i].move();
    }
  }

  for(var i in lapins){
    lapins[i].move();
  }
}

function die(){
  for(i=0;i<foxtodie.count;i++){
    renards[i].
  }
}

function drawInterface() {
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,canvasWidth,canvasHeight);
}

function run() {
  running = !running;
  if(running)
    document.getElementById('run').value = "Pause";
  else
    document.getElementById('run').value = "Run";
}

window.onload = function () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  console.log("Ready !");
  ctx.width = canvasWidth;
  ctx.height = canvasHeight;

  loopHandler = setInterval(function () {
    if(!running)
      return;
    frame++;
    move();
    draw();
    if(frame%reproductionDelay === 0)
      addLapin();
    if(frame%(reproductionDelay*10) === 0)
      addRenard();
  }, 1000/rate);
};
