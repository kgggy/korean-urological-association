const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comment', {
    cmtId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "댓글번호"
    },
    writId: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "글번호",
      references: {
        model: 'post',
        key: 'writId'
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
    cmtContent: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: "댓글내용"
    },
    cmtDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "댓글작성일자"
    },
    certiContentId: {
      type: DataTypes.STRING(35),
      allowNull: true,
      comment: "인증글번호",
      references: {
        model: 'certiContent',
        key: 'certiContentId'
      }
    },
    cmtUpdDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "댓글수정일자"
    }
  }, {
    sequelize,
    tableName: 'comment',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cmtId" },
        ]
      },
      {
        name: "comment_ibfk_3",
        using: "BTREE",
        fields: [
          { name: "certiContentId" },
        ]
      },
      {
        name: "comment_ibfk_4",
        using: "BTREE",
        fields: [
          { name: "writId" },
        ]
      },
      {
        name: "comment_ibfk_2",
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
    ]
  });
};
