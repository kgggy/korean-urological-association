const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('hitCount', {
    hcId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    boardId: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: "글번호"
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "회원번호"
    },
    hitDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "조회일자"
    }
  }, {
    sequelize,
    tableName: 'hitCount',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "hcId" },
        ]
      },
    ]
  });
};
