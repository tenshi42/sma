class Lapin{

}

window.onload = function () {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  console.log("Ready !");
  ctx.fillStyle = "blue";
  ctx.width = 600;
  ctx.height = 400;
  ctx.fillRect(0,0,600,400);
};