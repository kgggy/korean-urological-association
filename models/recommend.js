const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recommend', {
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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'post',
        key: 'writId'
      }
    },
    certiContentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
        name: "certiContentId",
        using: "BTREE",
        fields: [
          { name: "certiContentId" },
        ]
      },
    ]
  });
};
