/*eslint camelcase:0*/


module.exports = (sequelize, DataTypes) => {

  return sequelize.define('addresses', {
    id: { type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING(64),
    hash: DataTypes.STRING(256),
    user_id: DataTypes.INTEGER(11),
    active: {type: DataTypes.BOOLEAN, defaultValue: 0},
    created_at: {type: DataTypes.DATE},
    updated_at: {type: DataTypes.DATE},
    created_by: DataTypes.INTEGER(11),
    updated_by: DataTypes.INTEGER(11),
    hash_old: DataTypes.STRING(256)
  }, {
    timestamps: false
  });

};


