const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('post', {
    writId: {
      type: DataTypes.STRING(35),
      allowNull: false,
      primaryKey: true,
      comment: "글번호"
    },
    boardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "게시판 번호",
      references: {
        model: 'community',
        key: 'boardId'
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
    writTitle: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "게시글 제목"
    },
    writContent: {
      type: DataTypes.STRING(3000),
      allowNull: false,
      comment: "게시글 내용"
    },
    writUpdDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "게시글 수정일자"
    },
    writDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "게시글 작성일자"
    },
    writHit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "게시글 조회수"
    }
  }, {
    sequelize,
    tableName: 'post',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "writId" },
        ]
      },
      {
        name: "uid_idx",
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
      {
        name: "boardId",
        using: "BTREE",
        fields: [
          { name: "boardId" },
        ]
      },
    ]
  });
};
