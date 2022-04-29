const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('file', {
    fileId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    fileRoute: {
      type: DataTypes.STRING(300),
      allowNull: false,
      comment: "파일경로"
    },
    fileOrgName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "원본명"
    },
    boardId: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: "공지사항, 자료실, 갤러리 pk"
    },
    supportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "후원광고pk"
    },
    fileType: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "파일종류"
    }
  }, {
    sequelize,
    tableName: 'file',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "fileId" },
        ]
      },
    ]
  });
};
