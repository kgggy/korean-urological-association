var DataTypes = require("sequelize").DataTypes;
var _admin = require("./admin");
var _comment = require("./comment");
var _event = require("./event");
var _file = require("./file");
var _gallery = require("./gallery");
var _greeting = require("./greeting");
var _history = require("./history");
var _hitCount = require("./hitCount");
var _notice = require("./notice");
var _president = require("./president");
var _recommend = require("./recommend");
var _reference = require("./reference");
var _support = require("./support");
var _user = require("./user");
var _vote = require("./vote");

function initModels(sequelize) {
  var admin = _admin(sequelize, DataTypes);
  var comment = _comment(sequelize, DataTypes);
  var event = _event(sequelize, DataTypes);
  var file = _file(sequelize, DataTypes);
  var gallery = _gallery(sequelize, DataTypes);
  var greeting = _greeting(sequelize, DataTypes);
  var history = _history(sequelize, DataTypes);
  var hitCount = _hitCount(sequelize, DataTypes);
  var notice = _notice(sequelize, DataTypes);
  var president = _president(sequelize, DataTypes);
  var recommend = _recommend(sequelize, DataTypes);
  var reference = _reference(sequelize, DataTypes);
  var support = _support(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var vote = _vote(sequelize, DataTypes);


  return {
    admin,
    comment,
    event,
    file,
    gallery,
    greeting,
    history,
    hitCount,
    notice,
    president,
    recommend,
    reference,
    support,
    user,
    vote,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
