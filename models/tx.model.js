module.exports = (sequelize, DataTypes) => {

  return sequelize.define('transactions', {
    id: { type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true },
    address_id: DataTypes.INTEGER,
    hash: DataTypes.STRING(256),
    block_number: DataTypes.INTEGER,
    balance: DataTypes.INTEGER
  });

};


