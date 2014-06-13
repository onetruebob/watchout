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


var createEnemies = function () {
  return _.range(0,gameOptions.nEnemies).map(function (i) {
    return {
      id: i,
      x: Math.random()*100,
      y: Math.random()*100,
    };
  });
};


var render = function (enemy_data) {

  var enemies = gameBoard.selectAll('circle.enemy')
            .data(enemy_data, function (d) { return d.id;});

  enemies.enter()
    .append('svg:circle')
      .attr('class', 'enemy')
      .attr('cx', function (enemy){ return axes.x(enemy.x)})
      .attr('cy', function (enemy){ return axes.y(enemy.y)})
      .attr('r', 10);

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
























