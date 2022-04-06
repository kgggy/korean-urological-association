const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reference', {
    referId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    referWritDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "작성일자"
    },
    referTitle: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "제목"
    },
    referContent: {
      type: DataTypes.STRING(3000),
      allowNull: false,
      comment: "내용"
    },
    referHit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "조회수"
    }
  }, {
    sequelize,
    tableName: 'reference',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "referId" },
        ]
      },
    ]
  });
};
