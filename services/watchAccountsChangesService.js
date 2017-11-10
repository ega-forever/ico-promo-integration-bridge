const MySQLEvents = require('mysql-events'),
  _ = require('lodash'),
  request = require('request-promise'),
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
        return await request({
          url: `${config.rest}/addr`,
          method: 'delete',
          body: {
            address: _.get(oldRow, 'fields.hash')
          },
          json: true
        });
      }

      if (oldRow === null || (
        _.get(oldRow, 'fields.hash') &&
          _.get(newRow, 'fields.hash')
      )) {
        return await request({
          url: `${config.rest}/addr`,
          method: 'post',
          body: {
            address: _.get(newRow, 'fields.hash')
          },
          json: true
        });
      }
    });

};