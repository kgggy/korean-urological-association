const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    uid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userPwd: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    userSchool: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    userAge: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userAdres1: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    userAdres2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    userPoint: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    userImg: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    userScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userStatus: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: "0"
    },
    userToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userNick: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    userEmail: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    userAgree: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "0"
    },
    salt: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    userAuth: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "0"
    },
    usercol: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
    ]
  });
};
