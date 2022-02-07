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
    writContent: {
      type: DataTypes.STRING(5000),
      allowNull: false,
      comment: "게시글 내용"
    },
    writTitle: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "게시글 제목"
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
    },
    writRank: {
      type: DataTypes.STRING(2),
      allowNull: true,
      unique: "writRank_UNIQUE"
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
        name: "writRank_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "writRank" },
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
