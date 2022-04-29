const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('blame', {
    blaId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    targetContentId: {
      type: DataTypes.STRING(35),
      allowNull: false,
      comment: "신고한 게시물\/댓글 아이디"
    },
    targetUid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "신고 당한 회원아이디"
    },
    targetType: {
      type: DataTypes.STRING(1),
      allowNull: false,
      comment: "0이면 게시글, 1이면 댓글"
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "신고한 회원 아이디"
    },
    blaDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "신고 날짜"
    },
    blaContent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "신고사유"
    }
  }, {
    sequelize,
    tableName: 'blame',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "blaId" },
        ]
      },
    ]
  });
};
