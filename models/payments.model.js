/*eslint camelcase:0*/

const config = require('../config');

module.exports = (sequelize, DataTypes) => {

  return sequelize.define(config.db.tables.payments, {
    id: {type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true},
    user_id: DataTypes.INTEGER(11),
    type: {type: DataTypes.STRING(64), unique: 'compositeIndex'},
    amount: DataTypes.DOUBLE,
    address: DataTypes.STRING(128),
    txid: {type: DataTypes.STRING(512), unique: 'compositeIndex'},
    data: DataTypes.TEXT('long')
  }, {
    timestamps: true,
    underscored : true
  });

};


