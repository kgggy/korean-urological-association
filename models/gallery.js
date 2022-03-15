const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gallery', {
    galleryId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "갤러리 글번호"
    },
    writDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "작성일자"
    },
    galleryTitle: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "제목"
    },
    galleryContent: {
      type: DataTypes.STRING(3000),
      allowNull: true,
      comment: "내용"
    },
    galleryHit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "조회수"
    }
  }, {
    sequelize,
    tableName: 'gallery',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "galleryId" },
        ]
      },
    ]
  });
};
