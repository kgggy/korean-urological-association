const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  var calculator = sequelize.define('calculator', {
    calcId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "계산기구분번호"
    },
    calcName: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "계산기명"
    }
  }, {
    sequelize,
    tableName: 'calculator',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "calcId" },
        ]
      },
    ]
  });
  calculator.associate = function (models) {
    calculator.belongsTo(models.question, {
      foreignKey: "calcId"
    });

  };
  return calculator;
};