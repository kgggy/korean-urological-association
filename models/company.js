const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('company', {
    comId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    comNick: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "기업 아이디"
    },
    comPwd: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "기업 패스워드"
    },
    comName: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "회사명"
    },
    comNum: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "사업자등록번호"
    },
    comPresiName: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "대표자명"
    },
    comManagerName: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "담당자명"
    },
    comPhoneNum: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "전화번호"
    },
    comEmail: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "이메일"
    },
    comRegDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "가입일"
    },
    comAgree: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: "0",
      comment: "약관동의여부"
    },
    salt: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    comAdres1: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "주소1"
    },
    comAdres2: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "주소2(상세주소)"
    }
  }, {
    sequelize,
    tableName: 'company',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "comId" },
        ]
      },
    ]
  });
};
