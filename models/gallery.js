const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gallery', {
    galleryId: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
      comment: "일련번호"
    },
    galleryWritDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "작성일자"
    },
    galleryTitle: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "제목"
    },
    galleryContent: {
      type: DataTypes.STRING(3000),
      allowNull: false,
      comment: "내용"
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
