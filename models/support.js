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
    supportUrl: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "홈페이지"
    },
    supportTitle: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "광고 제목"
    },
    supportDetail: {
      type: DataTypes.STRING(3000),
      allowNull: true,
      comment: "상세정보"
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
