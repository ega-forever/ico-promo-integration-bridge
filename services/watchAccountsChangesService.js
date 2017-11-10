const MySQLEvents = require('mysql-events'),
  _ = require('lodash'),
  request = require('request-promise'),
  updateAccountRest = require('../utils/updateAccountRest'),
  config = require('../config');

module.exports = () => {

  let dbConnection = MySQLEvents({
    host: config.db.host,
    user: config.db.login,
    password: config.db.pass
  });

  dbConnection.add(
    `${config.db.database}.addresses`,
    async function (oldRow, newRow) {

      if (newRow === null || ( //remove
        _.get(oldRow, 'fields.hash') &&
        _.get(newRow, 'fields.hash'))
      ) {
        await updateAccountRest('delete', _.get(oldRow, 'fields.hash'));
      }

      if (oldRow === null || (
          _.get(oldRow, 'fields.hash') &&
          _.get(newRow, 'fields.hash') &&
          _.get(newRow, 'fields.active', 1) === 1
        )) {
        return await updateAccountRest('post', _.get(newRow, 'fields.hash'));
      }
    });

};