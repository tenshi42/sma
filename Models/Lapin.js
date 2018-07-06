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