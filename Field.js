var Boost = require('./Boost.js');
var BigBoost = require('./BigBoost.js');

class Field {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cs = 128;  //corner size
    this.options = { isStatic: true };

    var wall1 = Bodies.rectangle(this.width/2, 23, this.width, 46, this.options);
    var wall2a = Bodies.rectangle(87, 181+47, 174, 362, this.options);
    var wall2b = Bodies.rectangle(87, this.height-47-181, 174, 362, this.options);
    var goal1 = Bodies.rectangle(40, this.height/2, 80, 220, this.options);
    var wall3a = Bodies.rectangle(this.width-87, 181+47, 174, 362, this.options);
    var wall3b = Bodies.rectangle(this.width-87, this.height-47-181, 174, 362, this.options);
    var wall4 = Bodies.rectangle(this.width/2, this.height-23, this.width, 46, this.options);
    var goal2 = Bodies.rectangle(this.width-40, this.height/2, 80, 220, this.options);

    var cornerTL = Bodies.fromVertices(218, 90, global.Vertices.create([{x: 0, y: 0}, {x: this.cs, y: 0}, {x: 0, y: this.cs}]), this.options);
    var cornerTR = Bodies.fromVertices(this.width-218, 90, global.Vertices.create([{x: 0, y: 0}, {x: this.cs, y: 0}, {x: this.cs, y: this.cs}]), this.options);
    var cornerBL = Bodies.fromVertices(218, this.height-90, global.Vertices.create([{x: 0, y: 0}, {x: this.cs, y: this.cs}, {x: 0, y: this.cs}]), this.options);
    var cornerBR = Bodies.fromVertices(this.width-218, this.height-90, global.Vertices.create([{x: 0, y: 0}, {x: this.cs, y: -this.cs}, {x: this.cs, y: 0}]), this.options);

    this.objects = [wall1, wall2a ,wall2b, wall3a, wall3b, wall4, cornerTL, cornerTR, cornerBL, cornerBR, goal1, goal2 ];

    global.world_objects.push(this.objects);
    World.add(engine.world, this.objects);

    this.boosts = [];
    this.boosts.push(new Boost(655, 280));    //small centre square
    this.boosts.push(new Boost(897, 280));
    this.boosts.push(new Boost(655, 760));
    this.boosts.push(new Boost(897, 760));

    this.boosts.push(new Boost(504, 308));    //large centre square
    this.boosts.push(new Boost(1048, 308));
    this.boosts.push(new Boost(504, 731));
    this.boosts.push(new Boost(1048, 731));

    this.boosts.push(new Boost(448, 519));    //centre line
    this.boosts.push(new Boost(657, 519));
    this.boosts.push(new Boost(898, 519));
    this.boosts.push(new Boost(1107, 519));
    this.boosts.push(new Boost(278, 519));
    this.boosts.push(new Boost(1273, 519));

    this.boosts.push(new Boost(776, 402));    //verticle line
    this.boosts.push(new Boost(776, 638));

    this.boosts.push(new Boost(284, 310));    //left goal
    this.boosts.push(new Boost(387, 410));
    this.boosts.push(new Boost(387, 629));
    this.boosts.push(new Boost(284, 731));

    this.boosts.push(new Boost(1270, 310));    //right goal
    this.boosts.push(new Boost(1164, 410));
    this.boosts.push(new Boost(1164, 629));
    this.boosts.push(new Boost(1270, 731));

    this.boosts.push(new Boost(484, 102));    //outline
    this.boosts.push(new Boost(484, 938));
    this.boosts.push(new Boost(1070, 102));
    this.boosts.push(new Boost(1070, 938));

    this.big_boosts = [];
    this.big_boosts.push(new BigBoost(294, 160));    //Big Boosts
    this.big_boosts.push(new BigBoost(294, 880));
    this.big_boosts.push(new BigBoost(1258, 160));
    this.big_boosts.push(new BigBoost(1258, 880));
    this.big_boosts.push(new BigBoost(776, 82));
    this.big_boosts.push(new BigBoost(776, 958));
  }

  get_boost_info(){
    var boost_info = [];
    for(let i = 0; i < this.boosts.length; i++)
      boost_info.push(this.boosts[i].get_info());
    var big_boost_info = [];
    for(let i = 0; i < this.big_boosts.length; i++)
      big_boost_info.push(this.big_boosts[i].get_info());
    return {regular: boost_info, big: big_boost_info};
  }

  update(players){
    for(let i = 0; i < this.boosts.length; i++){
      var temp = this.boosts[i];
      this.boosts[i].update();        //update boosts
      Object.keys(players).forEach(function(player) {
        temp.collided(players[player]);    //check if player has taken active boost
      });
    }

    for(let i = 0; i < this.big_boosts.length; i++){
      var temp = this.big_boosts[i];
      //console.log(temp)
      this.big_boosts[i].update();        //update boosts
      Object.keys(players).forEach(function(player) {
        temp.collided(players[player]);    //check if player has taken active boost
      });
    }
  }
}

module.exports = Field;
