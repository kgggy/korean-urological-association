const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    uid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    userType: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "구분(개원, 근무, 휴직...)"
    },
    userName: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "이름"
    },
    hosName: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "병원명"
    },
    hosPhone1: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "병원전화"
    },
    hosPhone2: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    hosPhone3: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    userPost: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "우편번호"
    },
    userAdres1: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "주소1(시)"
    },
    userAdres2: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "주소2(구)"
    },
    userAdres3: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "상세주소"
    },
    userPosition: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "호칭(원장, 병원장, 선생..)"
    },
    userImg: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "프로필"
    },
    userEmail: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "이메일"
    },
    userFax: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "팩스"
    },
    userPhone1: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "휴대전화"
    },
    userPhone2: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    userPhone3: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    hosImg: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "병원사진"
    },
    userUrl: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: "홈페이지주소"
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
