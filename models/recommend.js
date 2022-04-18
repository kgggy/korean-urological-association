const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recommend', {
    recommendId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "좋아요번호\\n"
    },
    boardId: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: "게시판번호"
    },
    uid: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "유저일련번호\n"
    }
  }, {
    sequelize,
    tableName: 'recommend',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "recommendId" },
        ]
      },
    ]
  });
};
