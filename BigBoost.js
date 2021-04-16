var Boost = require('./Boost.js');

class BigBoost extends Boost {
  constructor(xpos, ypos) {
    super(xpos, ypos);
    this.timer_increment = 200;
    this.size = 6;
    this.boost_amount = 100;
  }
}

module.exports = BigBoost;
