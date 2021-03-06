const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vote', {
    voteId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "행사번호"
    },
    choose: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "0",
      comment: "선택결과(0이면 참여, 1이면 불참)"
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "회원번호"
    }
  }, {
    sequelize,
    tableName: 'vote',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "voteId" },
        ]
      },
    ]
  });
};
