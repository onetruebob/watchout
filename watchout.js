// board
var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 30,
  padding: 20
};


// accepts the choices obj for the game board
var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
};


var gameBoard = d3.select('.container').append('svg:svg')
                .attr('width', gameOptions.width)
                .attr('height', gameOptions.height);


var Player = function (gameOptions) {
  this._gameOptions = gameOptions;

  this.path = 'm-7.5,1.62413c0,-5.04095 4.08318,-9.12413 9.12414,-9.12413c5.04096,0 9.70345,5.53145 11.87586,9.12413c-2.02759,2.72372 -6.8349,9.12415 -11.87586,9.12415c-5.04096,0 -9.12414,-4.08318 -9.12414,-9.12415z';

  this.fill = '#ff6600';
  this.x =  0;
  this.y = 0;
  this.angle = 0;
  this.r = 5;



};

Player.prototype.render = function (to) {
  this.el = to.append('svg:path')
          .attr('d', this.path)
          .attr('fill', this.fill);

  this.transform ({
    x: this._gameOptions.width * 0.5,
    y: this._gameOptions.height * 0.5
  });

  this.setupDragging();
};


Player.prototype.getX = function(){
  return this.x;
};

Player.prototype.setX = function (x){
  var minX = this._gameOptions.padding;
  var maxX = this._gameOptions.width - this._gameOptions.padding;
  if(x <= minX) {
    x = minX;
  }
  if(x >= maxX){
    x = maxX;
  }
  this.x = x;
};


Player.prototype.getY = function(){
  return this.y;
};

Player.prototype.setY = function (y){
  var minY = this._gameOptions.padding;
  var maxY = this._gameOptions.height - this._gameOptions.padding;
  if (y <= minY){
    y = minY;
  }
  if (y >= maxY) {
    y = maxY;
  }
  this.y = y;
};

Player.prototype.transform = function(opts){
  this.angle = opts.angle || this.angle;
  this.setX(opts.x || this.x);
  this.setY(opts.y || this.y);
  this.el.attr("transform",
      "rotate(" + this.angle + " " + this.getX() + " " + this.getY() + ") "+
      "translate(" + this.getX() + " " + this.getY() + ")");
};

Player.prototype.moveAbsolute = function(x,y){
  this.transform({x: x, y: y});
};

Player.prototype.moveRelative = function (dx, dy){
  this.transform({
    x: this.getX()+dx,
    y: this.getY()+dy,
    angle: 360 * (Math.atan2(dy,dx)/(Math.PI*2))
  });
};

Player.prototype.setupDragging = function(){
  var dragMove = function(){
    this.moveRelative(d3.event.dx, d3.event.dy);
  };
  var drag = d3.behavior.drag()
          .on('drag', dragMove.bind(this));
  this.el.call(drag);
};


var players = [];
players.push(new Player(gameOptions).render(gameBoard));

var createEnemies = function () {
  return _.range(0,gameOptions.nEnemies).map(function (i) {
    return {
      id: i,
      x: Math.random()*100,
      y: Math.random()*100,
    };
  });
};


var render = function (enemyData) {

  var enemies = gameBoard.selectAll('circle.enemy')
    .data(enemyData, function (d) { return d.id;});

  enemies.enter()
    .append('svg:circle')
      .attr('class', 'enemy')
      .attr('cx', function (enemy){ return axes.x(enemy.x);})
      .attr('cy', function (enemy){ return axes.y(enemy.y);})
      .attr('r', 10);

  enemies.attr('class', 'enemy')
      .attr('cx', function (enemy){ return axes.x(enemy.x);})
      .attr('cy', function (enemy){ return axes.y(enemy.y);});

  enemies.exit()
    .remove();
};

var play = function () {
  var gameTurn = function () {
    var newEnemyPositions = createEnemies();
    render(newEnemyPositions);
  };

  gameTurn();
  /*increaseScore = ->
    gameStats.score += 1
    updateScore()

  */
  setInterval(gameTurn, 2000);

    //setInterval increaseScore, 50
};

play();
