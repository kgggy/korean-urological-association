const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('file', {
    certiContentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "인증글번호",
      references: {
        model: 'certiContent',
        key: 'certiContentId'
      }
    },
    writId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "게시글번호",
      references: {
        model: 'post',
        key: 'writId'
      }
    },
    fileRoute: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
      comment: "파일경로"
    },
    fileType: {
      type: DataTypes.STRING(45),
      allowNull: false
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
          { name: "fileRoute" },
        ]
      },
      {
        name: "file_ibfk_1",
        using: "BTREE",
        fields: [
          { name: "certiContentId" },
        ]
      },
      {
        name: "file_ibfk_2",
        using: "BTREE",
        fields: [
          { name: "writId" },
        ]
      },
    ]
  });
};
