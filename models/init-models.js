var DataTypes = require("sequelize").DataTypes;
var _SequelizeMeta = require("./SequelizeMeta");
var _admin = require("./admin");
var _gallery = require("./gallery");
var _notice = require("./notice");
var _reference = require("./reference");
var _user = require("./user");

function initModels(sequelize) {
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var admin = _admin(sequelize, DataTypes);
  var gallery = _gallery(sequelize, DataTypes);
  var notice = _notice(sequelize, DataTypes);
  var reference = _reference(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);


  return {
    SequelizeMeta,
    admin,
    gallery,
    notice,
    reference,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
