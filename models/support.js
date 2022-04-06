const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('support', {
    supportId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    supportImg: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "이미지"
    },
    supporter: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "업체명"
    }
  }, {
    sequelize,
    tableName: 'support',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "supportId" },
        ]
      },
    ]
  });
};
