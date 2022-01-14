const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('admin', {
    adminId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "아이디"
    },
    adminName: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "이름"
    },
    adminPwd: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "패스워드"
    },
    adminAuth: {
      type: DataTypes.STRING(1),
      allowNull: false,
      comment: "0이면 관리자, 1이면 기업 (잘 모르겠음)"
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
          { name: "adminId" },
        ]
      },
    ]
  });
};
