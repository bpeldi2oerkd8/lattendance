'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Room = loader.database.define(
  'rooms',
  {
    roomId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: true
    },
    roomToken: {
      type: Sequelize.STRING,
      allowNull: true
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

module.exports = Room;