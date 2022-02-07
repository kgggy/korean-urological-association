const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('banner', {
    bannerId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "배너번호"
    },
    bannerRoute: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "배너이미지경로"
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "시작날짜"
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "끝날짜"
    },
    showYN: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "0",
      comment: "노출유무(0 노출, 1 비노출)"
    },
    showNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "노출순서"
    },
    bannerDiv: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "0",
      comment: "배너 위치(팝업창, 메인 슬라이드배너)"
    }
  }, {
    sequelize,
    tableName: 'banner',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bannerId" },
        ]
      },
    ]
  });
};
