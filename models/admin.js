const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('admin', {
    adminNo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    adminId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "아이디"
    },
    adminPwd: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "패스워드"
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
