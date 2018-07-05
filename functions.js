var canvasWidth = 600;
var canvasHeight = 400;
var imagesSizes = 35;
var distanceMax = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
var canvas = null;
var ctx = null;
var baseRate = 30;
var rate = 30;
var loopHandler = null;
var lapinId = 0;
var renardId = 0;
var lapins = {};
var renards = {};

var lapinsDead = 0;
var renardsDead = 0;

var reproductionDelay = 1;
var frame = 0;
var running = false;
var debugging = false;
var visionRange = 300;
var foxDieTime = 10000;
var foxToDie = [];
var eatDistance = 10;

var unsafeZone = {};
var unsafeZoneId = 0;
var unsafeRadius = 80;
var timeToSafe = 5;

var lapinsToDie = [];

var spawn = false;

var trees = [];

var backgroundImage = null;

var canvasMinY = 160;
var distanceViewRatio = 15;

var planes = [];
var meteors = [];
var meteorSpeed = 4;
var meteorImpactPoint = canvasHeight /3;

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

class Lapin extends Animal {
  constructor(posX, posY, id) {
    super(posX, posY, "images/lapin2.png", id);
  }

  die() {
    if (lapinsToDie.indexOf(this.id) < 0) {
      unsafeZone[unsafeZoneId] = {x: this.getPosX(), y: this.getPosY()};
      lapinsToDie.push(this.id);
      var a = unsafeZoneId;
      setTimeout(function () {
        delete unsafeZone[a];
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
    super(posX, posY, "images/renard2.png", id);
    this.width*=2;
    this.height*=2;
    this.size*=2;

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
  }

  eat(i){
    lapins[i].die();
    clearTimeout(this.handler);
    var _id = this.id;
    this.handler = setTimeout(function(){
      foxToDie.push(_id);
    }, foxDieTime);
  }

}

function addLapin() {
  var notOk = true;
  while(notOk) {
    notOk = false;
    var x = Math.floor(Math.random() * (canvasWidth - imagesSizes));
    var y = Math.floor(Math.random() * (canvasHeight - imagesSizes - canvasMinY)) + canvasMinY;
    lapins[lapinId] = new Lapin(x, y, lapinId);
    if(lapins[lapinId].isTreesCollisions())
      notOk = true;
  }
  lapinId++;
}

function addRenard() {
  var x = Math.floor(Math.random() * (canvasWidth - imagesSizes));
  var y = Math.floor(Math.random() * (canvasHeight - imagesSizes - canvasMinY)) + canvasMinY;
  renards[renardId] = new Renard(x, y, visionRange, renardId);
  renardId++;
}

function addTree() {
  var x = Math.floor(Math.random() * (canvasWidth - imagesSizes*2));
  var y = Math.floor(Math.random() * (canvasHeight - imagesSizes*2 - canvasMinY)) + canvasMinY;
  trees.push(new Tree(x, y));
}

function addPlane() {
  var y = Math.floor(Math.random() * (canvasMinY - 70));
  var x = Math.floor(Math.random() * 200) - 100;
  planes.push(new Plane(y, x));
}

function armageddon() {
  meteors.push(new Meteor(meteorSpeed));
}

function draw() {
  drawInterface();

  for(var i in lapins){
    lapins[i].draw();
  }

  for(var i in renards){
    renards[i].draw();
  }

  for(var i in planes){
    planes[i].draw();
  }

    for(var i in meteors){
        meteors[i].draw();
    }

  drawTrees();

  if(debugging) {
    drawUnsafeZones();
    debugDrawTree();
  }
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

  for(var i in planes){
    planes[i].move();
  }

  for(var i in meteors){
    meteors[i].move();
  }
}

function die(){
  for(var i=0;i<foxToDie.length;i++){
    delete renards[foxToDie[i]];
    renardsDead++;
  }
  for(var i=0;i<lapinsToDie.length;i++){
    delete lapins[lapinsToDie[i]];
    lapinsDead++;
  }
  foxToDie = [];
  lapinsToDie = [];
}

function drawInterface() {
//  ctx.fillStyle = "white";
  //ctx.fillRect(0,0,canvasWidth,canvasHeight);
  ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
  document.getElementById('lapin_compte').innerHTML = "Lapins restants : " + Object.keys(lapins).length;
  document.getElementById('renard_compte').innerHTML = "Renards restants : " + Object.keys(renards).length;
  document.getElementById('lapin_dead').innerHTML = "Lapins morts : " + lapinsDead;
  document.getElementById('renard_dead').innerHTML = "Renards morts : " + renardsDead;
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

function drawTrees() {
  for(var i in trees){
    trees[i].draw();
  }
}

function debugDrawTree() {
  for(var i in trees){
    ctx.beginPath();
    ctx.fillStyle = "rgba(25, 45, 200, 0.7)";
    ctx.fillRect(trees[i].posX + (trees[i].width / 3), trees[i].posY + (trees[i].height / 4 * 3), (trees[i].width / 3), trees[i].height / 4)
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

function initTrees() {
  for(var i = 0 ; i < 10 ; i++){
    addTree();
  }
}

function run() {
  running = !running;
  if(running) {
    document.getElementById('run').value = "Pause";
  }
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

function enableDebugging() {
  debugging = !debugging;
  if(debugging){
    document.getElementById('debug').value = "Disable debugging";
  }
  else {
    document.getElementById('debug').value = "Enable debugging";
  }
}

function changeSpeed(val) {
  rate = baseRate * val;
}

function step(){
  if(running) {
    frame++;
    if (running) {
      move();
      die();
    }
    draw();
    if (spawn) {
      if (frame % reproductionDelay === 0 && Object.keys(lapins).length > 0)
        addLapin();
      if (frame % (reproductionDelay * 10) === 0 && Object.keys(renards).length > 0)
        addRenard();
      if (frame % (reproductionDelay * 10) === 0)
        addPlane();
    }
  }

  setTimeout(function () {
    step();
  }, 1000/rate);
}

window.onload = function () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  console.log("Ready !");
  ctx.width = canvasWidth;
  ctx.height = canvasHeight;

  initTrees();

  backgroundImage = new Image();
  backgroundImage.src = "images/herbe2.jpg";

  step();
};
