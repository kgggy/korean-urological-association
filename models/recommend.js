const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  var recommend = sequelize.define('recommend', {
    rcmdId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'uid'
      }
    },
    writId: {
      type: DataTypes.STRING(35),
      allowNull: true,
      references: {
        model: 'post',
        key: 'writId'
      }
    },
    certiContentId: {
      type: DataTypes.STRING(35),
      allowNull: true,
      references: {
        model: 'certiContent',
        key: 'certiContentId'
      }
    }
  }, {
    sequelize,
    tableName: 'recommend',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rcmdId" },
        ]
      },
      {
        name: "uid",
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
      {
        name: "writId",
        using: "BTREE",
        fields: [
          { name: "writId" },
        ]
      },
      {
        name: "recommend_ibfk_3",
        using: "BTREE",
        fields: [
          { name: "certiContentId" },
        ]
      },
    ]
  });
  recommend.associate = function (models) {
    recommend.belongsTo(models.user, {
      foreignKey: "uid"
    })
  };
  return recommend;
};
