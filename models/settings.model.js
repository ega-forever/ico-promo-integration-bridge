/*eslint camelcase:0*/

const config = require('../config');

module.exports = (sequelize, DataTypes) => {

  return sequelize.define(config.db.tables.settings, {
    id: {type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true},
    eth_ico_address: DataTypes.STRING(255)
  }, {
    timestamps: true,
    underscored : true
  });

};


