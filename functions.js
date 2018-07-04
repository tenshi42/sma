var canvasWidth = 600;
var canvasHeight = 400;
var imagesSizes = 35;
var distanceMax = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
var canvas = null;
var ctx = null;
var rate = 30;
var loopHandler = null;
var lapinId = 0;
var renardId = 0;
var lapins = {};
var renards = {};
var reproductionDelay = 1;
var frame = 0;
var running = false;
var visionRange = 300;
var foxDieTime = 10000;
var foxToDie = [];
var eatDistance = 10;

var unsafeZone = {};
var unsafeZoneId = 0;
var unsafeRadius = 200;
var timeToSafe = 5;

var lapinsToDie = [];

var spawn = false;

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
    return this.posX >= 0 && this.posX <= (canvasWidth - this.width) && this.posY >= 0 && this.posY <= (canvasHeight - this.height);
  }
}

class Lapin extends Animal {
  constructor(posX, posY, id) {
    super(posX, posY, "images/lapin1.png", id);
  }

  die() {
    if (lapinsToDie.indexOf(this.id) < 0) {
      unsafeZone[unsafeZoneId] = {x: this.getPosX(), y: this.getPosY()};
      lapinsToDie.push(this.id);
      var a = unsafeZoneId;
      setTimeout(function () {
        delete unsafeZone[a];
        console.log("delete : " + unsafeZoneId);
      }, timeToSafe * 1000);
      unsafeZoneId++;
    }
  }

  move() {
    this.inUnsafeZone();
    super.move();
  }

  inUnsafeZone() {
    for (var i in unsafeZone) {
      var a = unsafeZone[i].x - this.posX;
      var b = unsafeZone[i].y - this.posY;
      var distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
      if (distance < unsafeRadius) {
        this.dirX = -a / distance;
        this.dirY = -b / distance;
      }
    }
  }
}


class Renard extends Animal{
  constructor(posX, posY, visionRange, id){
    super(posX, posY, "images/renard1.png", id);
    // TODO : declare somewhere else ??
    this.visionRange = visionRange;
    var _id = id;
    this.handler = setTimeout(function(){
      foxToDie.push(_id);
    }, foxDieTime);
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
      var a = lapins[i].getPosX() - this.getPosX();
      var b = lapins[i].getPosY() - this.getPosY();

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
    var a = lapins[i].getPosX() - this.getPosX();
    var b = lapins[i].getPosY() - this.getPosY();

    var distance = Math.sqrt(a*a + b*b);

    if(distance < eatDistance)
      this.eat(i);

    this.dirX = a / distance;
    this.dirY = b / distance;



    // Max speed movement
    this.posX += this.dirX;
    this.posY += this.dirY;
    // TODO : ad continuity ?
  }

  eat(i){
    lapins[i].die();
    clearTimeout(this.handler);
    var _id = this.id;
    this.handler = setTimeout(function(){
      foxToDie.push(_id);
    }, foxDieTime);
    console.log("new : fox die time : " + foxDieTime);
  }

}

function addLapin() {
  var x = Math.floor(Math.random() * (canvasWidth - imagesSizes));
  var y = Math.floor(Math.random() * (canvasHeight - imagesSizes));
  lapins[lapinId] = new Lapin(x, y, lapinId);
  lapinId++;
}

function addRenard() {
  var x = Math.floor(Math.random() * (canvasWidth - imagesSizes));
  var y = Math.floor(Math.random() * (canvasHeight - imagesSizes));
  renards[renardId] = new Renard(x, y, visionRange, renardId);
  renardId++;
}

function draw() {
  drawInterface();

  for(var i in lapins){
    lapins[i].draw();
  }

  for(var i in renards){
    renards[i].draw();
  }

  drawUnsafeZones();
}

function drawDebug() {
  ctx.beginPath();
  ctx.arc(canvasWidth, canvasHeight, 30, 0, 2 * Math.PI);
  ctx.stroke();
}

function move() {
  for(var i in renards){
    var y = renards[i].detectRabbit();
    if (y !== null){
      renards[i].chaseRabbit(y[0]);
    } else {
      renards[i].move();
    }
  }

  for(var i in lapins){
    lapins[i].move();
  }
  die();
}

function die(){
  for(var i=0;i<foxToDie.length;i++){
    delete renards[foxToDie[i]];
  }
  for(var i=0;i<lapinsToDie.length;i++){
    delete lapins[lapinsToDie[i]];
  }
  foxToDie = [];
  lapinsToDie = [];
}

function drawInterface() {
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,canvasWidth,canvasHeight);
  document.getElementById('lapin_compte').innerHTML = "Lapins restants : " + Object.keys(lapins).length;
  document.getElementById('renard_compte').innerHTML = "Renards restants : " + Object.keys(renards).length;
}

function drawUnsafeZones(){
  ctx.fillStyle = "rgba(200, 30, 40, 0.6)";
  for(var i in unsafeZone){
    ctx.beginPath();
    ctx.arc(unsafeZone[i].x, unsafeZone[i].y, unsafeRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}

function init() {
  var nbLapinsToSpawn = parseInt(document.getElementById('lapin').value);
  var nbRenardsToSpawn = parseInt(document.getElementById('renard').value);
  reproductionDelay = parseFloat(document.getElementById('lap_app').value) * rate;
  foxDieTime = parseFloat(document.getElementById('renard_mort').value) * 1000;

  console.log('init');

  for(var i = 0 ; i < nbLapinsToSpawn ; i++){
    addLapin();
  }

  for(var i = 0 ; i < nbRenardsToSpawn ; i++){
    addRenard();
  }

  draw();
}

function run() {
  running = !running;
  if(running)
    document.getElementById('run').value = "Pause";
  else
    document.getElementById('run').value = "Run";
}

function enableSpawn(){
  spawn = !spawn;
  if(spawn){
    document.getElementById('spawn').value = "Disable spawn";
  }
  else {
    document.getElementById('spawn').value = "Enable spawn";
  }
}

window.onload = function () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  console.log("Ready !");
  ctx.width = canvasWidth;
  ctx.height = canvasHeight;

  drawDebug();

  loopHandler = setInterval(function () {
    if(!running)
      return;
    frame++;
    if(running) {
      move();
      die();
    }
    draw();
    if(spawn) {
      if (frame % reproductionDelay === 0 && Object.keys(lapins).length > 0)
        addLapin();
      if (frame % (reproductionDelay * 10) === 0 && Object.keys(renards).length > 0)
        addRenard();
    }
  }, 1000/rate);
};
