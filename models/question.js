const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  var question = sequelize.define('question', {
    qtnId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "문제번호"
    },
    calcId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "계산기구분번호",
      references: {
        model: 'calculator',
        key: 'calcId'
      }
    },
    qtnNum: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: "문제순서"
    },
    qtnContent: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "문제내용"
    }
  }, {
    sequelize,
    tableName: 'question',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "qtnId" },
        ]
      },
      {
        name: "calcId",
        using: "BTREE",
        fields: [
          { name: "calcId" },
        ]
      },
    ]
  });
  question.associate = function (models) {
    question.belongsTo(models.calOption, {
      foreignKey: "qtnId"
    });

  };
  return question;
};