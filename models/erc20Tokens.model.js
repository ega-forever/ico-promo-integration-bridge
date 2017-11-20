/*eslint camelcase:0*/

const config = require('../config');

module.exports = (sequelize, DataTypes) => {

  return sequelize.define(config.db.tables.erc20_tokens, {
    id: {type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true},
    address: DataTypes.INTEGER(11),
    name: DataTypes.STRING(64)
  }, {
    timestamps: true,
    underscored : true
  });

};


