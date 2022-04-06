const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('history', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    year: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "년도"
    },
    date: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "날짜"
    },
    content: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "내용"
    }
  }, {
    sequelize,
    tableName: 'history',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
