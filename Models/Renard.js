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