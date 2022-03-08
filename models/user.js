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
      allowNull: true,
      defaultValue: 0
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
      allowNull: true,
      defaultValue: 0
    },
    userStatus: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: "0"
    },
    userToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "소셜로그인 회원가입 토큰"
    },
    userNick: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: "userNick_UNIQUE"
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

    // userAuth: {
    //   type: DataTypes.STRING(1),
    //   allowNull: false,
    //   defaultValue: "0"
    // },
    userRegDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    userSocialDiv: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "소셜로그인 구분(네이버, 카카오, 애플, 구글)"
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
      {
        name: "userNick_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userNick" },
        ]
      },
    ]
  });
};
