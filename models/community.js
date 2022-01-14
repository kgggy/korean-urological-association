const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('community', {
    boardId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "게시판번호"
    },
    boardName: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "게시판명"
    }
  }, {
    sequelize,
    tableName: 'community',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "boardId" },
        ]
      },
    ]
  });
};
