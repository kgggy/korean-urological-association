const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('file', {
    certiContentId: {
      type: DataTypes.STRING(35),
      allowNull: true,
      comment: "인증글번호",
      references: {
        model: 'certiContent',
        key: 'certiContentId'
      }
    },
    writId: {
      type: DataTypes.STRING(35),
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
    fileNo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fileOrgName: {
      type: DataTypes.STRING(255),
      allowNull: true
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
        name: "certiContentId",
        using: "BTREE",
        fields: [
          { name: "certiContentId" },
        ]
      },
      {
        name: "writId",
        using: "BTREE",
        fields: [
          { name: "writId" },
        ]
      },
    ]
  });
};
