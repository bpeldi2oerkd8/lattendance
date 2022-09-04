'use strict';
const Sequelize = require('sequelize');
let sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/lattendance'
);

// DBにSSL接続を行う場合
if (process.env.DATABASE_SSL) {
  sequelize = new Sequelize(
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/lattendance',
    {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  );
}

module.exports = {
  Sequelize : Sequelize,
  database : sequelize
};