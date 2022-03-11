const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('certification', {
    certiTitleId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "인증제목번호"
    },
    certiDivision: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: "인증구분(챌린지,실천)"
    },
    certiTitle: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "인증제목명"
    },
    certiDetail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "인증세부내용"
    },
    certiPoint: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "지급포인트"
    },
    certiDiff: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: "단계"
    },
    certiImage: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    certiAuth: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "지역, 나이, 학교 등 권한이 필요한 챌린지 구분"
    },
    certiShow: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "0"
    },
    certiSubDivision: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    certiStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    certiEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    certiExamImg1: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "예시사진1"
    },
    certiExamImg2: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "예시사진2"
    }
  }, {
    sequelize,
    tableName: 'certification',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "certiTitleId" },
        ]
      },
    ]
  });
};
