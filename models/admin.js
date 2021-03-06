const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('admin', {
    adminNo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "관리자 일련번호"
    },
    adminId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "관리자 아이디"
    },
    adminPwd: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "관리자 비밀번호"
    }
  }, {
    sequelize,
    tableName: 'admin',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "adminNo" },
        ]
      },
    ]
  });
};
