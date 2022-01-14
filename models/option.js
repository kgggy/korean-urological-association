const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('option', {
    optId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "옵션번호"
    },
    qtnId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "문제번호",
      references: {
        model: 'question',
        key: 'qtnId'
      }
    },
    optContent: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "옵션내용\n먹음, 안먹음(깊이1)\n과일, 빵, 우유(깊이2)"
    },
    optValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "계산될 값(이산화탄소량\/점수)"
    },
    optDepth: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "0",
      comment: "깊이"
    }
  }, {
    sequelize,
    tableName: 'option',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "optId" },
        ]
      },
      {
        name: "qtnId_idx",
        using: "BTREE",
        fields: [
          { name: "qtnId" },
        ]
      },
    ]
  });
};
