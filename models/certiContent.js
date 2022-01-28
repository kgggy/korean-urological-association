const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('certiContent', {
    certiContentId: {
      type: DataTypes.STRING(35),
      allowNull: false,
      primaryKey: true,
      comment: "인증글번호"
    },
    certiTitleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "인증제목번호",
      references: {
        model: 'certification',
        key: 'certiTitleId'
      }
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "일련번호(사용자)",
      references: {
        model: 'user',
        key: 'uid'
      }
    },
    certiContentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "인증글작성일자"
    },
    certiImg: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "실천 이미지"
    }
  }, {
    sequelize,
    tableName: 'certiContent',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "certiContentId" },
        ]
      },
      {
        name: "certiTitleId",
        using: "BTREE",
        fields: [
          { name: "certiTitleId" },
        ]
      },
      {
        name: "certiContent_ibfk_2",
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
    ]
  });
};
