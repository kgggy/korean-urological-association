var DataTypes = require("sequelize").DataTypes;
var _certification = require("./certification");

function initModels(sequelize) {
  var certification = _certification(sequelize, DataTypes);


  return {
    certification,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
