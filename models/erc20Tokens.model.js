/*eslint camelcase:0*/

module.exports = (sequelize, DataTypes) => {

  return sequelize.define('erc20_tokens', {
    id: {type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true},
    address: DataTypes.INTEGER(11),
    name: DataTypes.STRING(64)
  }, {
    timestamps: true,
    underscored : true
  });

};


