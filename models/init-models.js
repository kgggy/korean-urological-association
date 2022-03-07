var DataTypes = require("sequelize").DataTypes;
var _company = require("./company");

function initModels(sequelize) {
  var company = _company(sequelize, DataTypes);


  return {
    company,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
