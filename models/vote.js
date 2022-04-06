const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vote', {
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    choose: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "0"
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'vote',
    timestamps: false
  });
};
