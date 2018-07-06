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

var canvasMinY = null;
var canvasMaxY = null;
var distanceViewRatio = 15;

var planes = {};
var planeId = 0;
var meteors = [];
var meteorSpeed = 4;
var meteorImpactPoint = canvasMinY;

var isControlBoxOpen = true;

var planesToDelete = [];

function addLapin() {
  var notOk = true;
  while(notOk) {
    notOk = false;
    var x = Math.floor(Math.random() * (canvasWidth - imagesSizes));
    var y = Math.floor(Math.random() * (canvasMaxY - imagesSizes - canvasMinY)) + canvasMinY;
    lapins[lapinId] = new Lapin(x, y, lapinId);
    if(lapins[lapinId].isTreesCollisions())
      notOk = true;
  }
  lapinId++;
}

function addRenard() {
  var x = Math.floor(Math.random() * (canvasWidth - imagesSizes));
  var y = Math.floor(Math.random() * (canvasMaxY - imagesSizes - canvasMinY)) + canvasMinY;
  renards[renardId] = new Renard(x, y, visionRange, renardId);
  renardId++;
}

function addTree() {
  var x = Math.floor(Math.random() * (canvasWidth - imagesSizes*2));
  var y = Math.floor(Math.random() * (canvasMaxY - imagesSizes*2 - canvasMinY)) + canvasMinY;
  trees.push(new Tree(x, y));
}

function addPlane() {
  var y = Math.floor(Math.random() * (canvasMinY - 70));
  var x = Math.floor(Math.random() * 200) - 100;
  planes[planeId] = new Plane(y, x, planeId);
  planeId++;
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
    debugDrawPlanes();
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
  for(var i=0;i<planesToDelete.length;i++){
    delete planes[planesToDelete[i]];
  }
  foxToDie = [];
  lapinsToDie = [];
  planesToDelete = [];
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

function debugDrawPlanes() {
  for(var i in planes){
    ctx.beginPath();
    ctx.fillStyle = "rgba(25, 45, 200, 0.7)";
    ctx.fillRect(planes[i].posX, planes[i].posY, planes[i].width, planes[i].height)
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

  for(var i in renards){
    renards[i].pauseTimer(!running);
  }

  if(running) {
    document.getElementById('run').value = "Pause";
  }
  else {
    document.getElementById('run').value = "Run";
  }
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

function openControlBox(){
  isControlBoxOpen = !isControlBoxOpen;

  if(isControlBoxOpen){
    document.getElementById("controls-box-trigger").innerHTML = "Close";
    //document.getElementById("controls-box-sub").style.height = "160px";
    document.getElementById("controls-box").style.height = "175px";
  }
  else {
    document.getElementById("controls-box-trigger").innerHTML = "Open";
    //document.getElementById("controls-box-sub").style.height = "0";
    document.getElementById("controls-box").style.height = "25px";
  }
}

window.onload = function () {
  canvas = document.getElementById("canvas");
  canvasWidth = canvas.width = window.innerWidth * 0.8;
  canvasHeight = canvas.height = window.innerHeight * 0.8;
  ctx = canvas.getContext("2d");

  var table = document.getElementsByTagName("table")[0];
  console.log((window.innerHeight - (table.offsetTop + table.offsetHeight)));
  document.getElementById("controls-box").style.bottom = (window.innerHeight - (table.offsetTop + table.offsetHeight) + 6) + "px";
  document.getElementById("controls-box").style.width = (window.innerWidth * 0.8) + "px";

  canvasMinY = canvasHeight * 0.4;
  canvasMaxY = canvasHeight - 25;

  /*try {
    canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  }
  catch (e){
    console.log("nok : " + e);
  }

  try {
    canvas.mozRequestFullScreen();
  }
  catch (e){
    console.log("nok : " + e);
  }*/

  console.log("Ready !");
  ctx.width = canvasWidth;
  ctx.height = canvasHeight;

  initTrees();

  backgroundImage = new Image();
  backgroundImage.src = "images/herbe2.jpg";

  step();
};