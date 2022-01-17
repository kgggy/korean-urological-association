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
    certiAuth: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: "지역, 나이 등등 챌린지 참여할 수 있는 권한 구분 칼럼"
    },
    certiDiff: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: "단계"
    },
    certiImage: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    certificationcol: {
      type: DataTypes.STRING(45),
      allowNull: true
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
