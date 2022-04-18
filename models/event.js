const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('event', {
    eventId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "행사번호"
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "투표 시작 날짜"
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "투표 마감 날짜"
    },
    eventTitle: {
      type: DataTypes.STRING(300),
      allowNull: false,
      comment: "행사제목"
    },
    eventContent: {
      type: DataTypes.STRING(3000),
      allowNull: false,
      comment: "행사내용"
    },
    eventFileRoute: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "첨부파일"
    },
    eventDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "행사날짜"
    },
    eventPlace: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "행사장소주소"
    },
    eventPlaceDetail: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "상세주소"
    },
    eventStatus: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "0",
      comment: "0이면 진행중, 1이면 마감"
    }
  }, {
    sequelize,
    tableName: 'event',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "eventId" },
        ]
      },
    ]
  });
};
