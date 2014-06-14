// board
var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 10,
  padding: 20
};

var gameStats = {
  score: 0,
  bestScore: 0,
  collisions: 0
};

var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
};


var gameBoard = d3.select('.container').append('svg:svg')
                .attr('width', gameOptions.width)
                .attr('height', gameOptions.height);

// '<defs><pattern id="img1" patternUnits="userSpaceOnUse" width="100" height="100"><image xlink:href="shuriken.png" x="0" y="0" width="100" height="100" /></pattern></defs>'
d3.select('svg').append('defs')
d3.select('defs').append('pattern')
d3.select('pattern').attr('id', 'img')
                    .attr('patternUnits', 'objectBoundingBox')
                    .attr('width', '30')
                    .attr('height', '30')
                    .append('image')
                    .attr('xlink:href','shuriken.png')
                    .attr('x', '0')
                    .attr('y', '0')
                    .attr('width','30')
                    .attr('height', '30');


var updateScore = function(){
  d3.select('.current span')
    .text(gameStats.score.toString());

  d3.select('.collisions span').text(gameStats.collisions.toString());
};

var updateBestScore = function(){
  gameStats.bestScore = _.max([gameStats.bestScore, gameStats.score]);
  d3.select('.high span').text(gameStats.bestScore.toString());
};

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
players.push(new Player(gameOptions));
_(players).each(function(player){player.render(gameBoard);});

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

  var checkCollision = function (enemy, collidedCallback){
    _(players).each(function (player) {
      var radiusSum =  parseFloat(enemy.attr('r')) + player.r;            // <= r ≠ defined
      var xDiff = parseFloat(enemy.attr('x')) - player.x;
      var yDiff = parseFloat(enemy.attr('y')) - player.y;

      var separation = Math.sqrt( Math.pow(xDiff,2) + Math.pow(yDiff,2) );
      if (separation < radiusSum) {
        collidedCallback(player, enemy);
      }
    });
  };

  var tweenWithCollisionDetection = function (endData){
    var enemy = d3.select(this);                              // <= Wrong This

    var startPos = {
      x: parseFloat(enemy.attr('x')),
      y: parseFloat(enemy.attr('y'))
    };

    var endPos ={
      x: axes.x(endData.x),
      y: axes.y(endData.y)
    };

    return function (t) {
      checkCollision(enemy, onCollision);

      var enemyNextPos = {
        x: startPos.x + (endPos.x - startPos.x)*t,
        y: startPos.y + (endPos.y - startPos.y)*t
      };

      enemy.attr('x', enemyNextPos.x)
            .attr('y', enemyNextPos.y);
    };
  };


  var enemies = gameBoard.selectAll('rect.enemy')
    .data(enemyData, function (d) { return d.id;});

// <rect x="150" y="20" width="60" height="60" fill="blue">
//   <animateTransform attributeType="xml"
//                     attributeName="transform"
//                     type="rotate"
//                     from="0 180 50"
//                     to="360 180 50"
//                     dur="4s"
//                     repeatCount="indefinite"/>
// </rect>

  enemies.enter()
    .append('svg:rect')
      .attr('class', 'enemy')
      .attr('x', function (enemy){ return axes.x(enemy.x);})
      .attr('y', function (enemy){ return axes.y(enemy.y);})
      .attr('width', 30)
      .attr('height', 30)
      .attr('fill', 'url(#img)')
      .append('animateTransform')
      .attr('attributeType', 'xml')
      .attr('attributeName', 'transform')
      .attr('type','rotate')
      .attr('from', '0 0 0')
      .attr('to', '360 0 0')
      .attr('dur', '2s')
      .attr('repeatCount', 'indefinate');

  enemies.attr('class', 'enemy')
      .attr('x', function (enemy){ return axes.x(enemy.x);})
      .attr('y', function (enemy){ return axes.y(enemy.y);});

  enemies.exit()
    .remove();

  enemies.transition()
        .duration(500)
        .attr('width', 30)
        .attr('height', 30)
      .transition()
        .duration(2000)
        .tween('custom', tweenWithCollisionDetection);
};



var onCollision = function () {
  updateBestScore();
  gameStats.score = 0;
  gameStats.collisions++;
  updateScore();
};



var play = function () {
  var gameTurn = function () {
    var newEnemyPositions = createEnemies();
    render(newEnemyPositions);
  };

  gameTurn();

  var increaseScore = function(){
    gameStats.score += 1;
    updateScore();
  };

  setInterval(gameTurn, 2000);

  setInterval(increaseScore, 50);
};

play();
