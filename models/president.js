const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('president', {
    psdId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    psd: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "1대, 23대.."
    },
    psdName: {
      type: DataTypes.STRING(7),
      allowNull: false,
      comment: "이름"
    },
    psdDate: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "취임기간"
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'president',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "psdId" },
        ]
      },
    ]
  });
};
