/*eslint camelcase:0*/

const config = require('../config');

module.exports = (sequelize, DataTypes) => {

  return sequelize.define(config.db.tables.logs, {
    id: {type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true},
    type: {type: DataTypes.STRING(64)},
    level: {type: DataTypes.BOOLEAN},
    data: DataTypes.TEXT
  }, {
    timestamps: true,
    underscored : true
  });

};


