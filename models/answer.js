const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('answer', {
    ansId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "답변번호"
    },
    optId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "옵션번호",
      references: {
        model: 'calOption',
        key: 'optId'
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
    ansDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "계산기답변일자"
    },
    chkNum: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "선택값"
    }
  }, {
    sequelize,
    tableName: 'answer',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ansId" },
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
        name: "optId_idx",
        using: "BTREE",
        fields: [
          { name: "optId" },
        ]
      },
    ]
  });
};
