'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Schedule = loader.database.define(
  'schedules',
  {
    scheduleId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    scheduleName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    //追加
    roomId: {
      type: Sequelize.STRING,
      allowNull: true
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['createdBy', 'roomId']
      }
    ]
  }
);

module.exports = Schedule;