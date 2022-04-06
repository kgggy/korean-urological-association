const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notice', {
    noticeId: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    noticeWritDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "작성일자"
    },
    noticeTitle: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "제목"
    },
    noticeContent: {
      type: DataTypes.STRING(3000),
      allowNull: false,
      comment: "내용"
    },
    noticeHit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "조회수"
    },
    noticeRank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "공지사항 우선순위"
    }
  }, {
    sequelize,
    tableName: 'notice',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "noticeId" },
        ]
      },
    ]
  });
};
