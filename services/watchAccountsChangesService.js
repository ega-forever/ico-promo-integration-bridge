const MySQLEvents = require('mysql-events'),
  _ = require('lodash'),
  request = require('request-promise'),
  updateAccountRest = require('../utils/updateAccountRest'),
  updateERC20Rest = require('../utils/updateERC20Rest'),
  config = require('../config');

module.exports = () => {

  let dbConnection = MySQLEvents({
    host: config.db.host,
    user: config.db.login,
    password: config.db.pass
  });

  dbConnection.add(
    `${config.db.database}.${config.db.tables.addresses}`,
    async function (oldRow, newRow) {

      if (newRow === null || ( //remove
        _.get(oldRow, 'fields.hash') &&
        _.get(newRow, 'fields.hash'))
      ) {
        await updateAccountRest('delete', {address: _.get(oldRow, 'fields.hash')});
      }

      if (oldRow === null || (
          _.get(oldRow, 'fields.hash') &&
          _.get(newRow, 'fields.hash') &&
          _.get(newRow, 'fields.active', 1) === 1
        )) {
        return await updateAccountRest('post', {address: _.get(newRow, 'fields.hash')});
      }
    });

  dbConnection.add(
    `${config.db.database}.${config.db.tables.settings}`,
    async function (oldRow, newRow) {

      if (newRow === null || ( //remove
        _.get(oldRow, 'fields.eth_ico_address') &&
        _.get(newRow, 'fields.eth_ico_address'))
      ) {
        await updateERC20Rest('delete', {erc20tokens: [_.get(oldRow, 'fields.eth_ico_address')]});
      }

      if (oldRow === null || (
          _.get(oldRow, 'fields.eth_ico_address') &&
          _.get(newRow, 'fields.eth_ico_address')
        )) {
        return await updateERC20Rest('post', {erc20tokens: [_.get(oldRow, 'fields.eth_ico_address')]});

      }
    });

};