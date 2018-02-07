const MySQLEvents = require('mysql-events'),
  _ = require('lodash'),
  request = require('request-promise'),
  config = require('../config');

module.exports = (channel) => {

  let binlogServerId = Date.now();

  let dbConnection = MySQLEvents({
    host: config.db.host,
    user: config.db.login,
    password: config.db.pass,
  }, {
    serverId: Date.now()
  });

  log.info(`connected to binlog with the following id: ${binlogServerId}`);

  dbConnection.add(
    `${config.db.database}.${config.db.tables.addresses}`,
    async function (oldRow, newRow) {

      if ((_.get(oldRow, 'fields.name') || _.get(newRow, 'fields.name')) !== config.type)
        return;

      if (newRow === null || ( //remove
        _.get(oldRow, 'fields.hash') &&
        _.get(newRow, 'fields.hash'))
      ) {
        log.info(`removing address ${_.get(oldRow, 'fields.hash')}`);
        await channel.publish('events', `${config.rabbit.serviceName}.account.delete`, new Buffer(JSON.stringify({
          address: _.get(oldRow, 'fields.hash')
        })));

      }

      if (oldRow === null || (
          _.get(oldRow, 'fields.hash') &&
          _.get(newRow, 'fields.hash') &&
          _.get(newRow, 'fields.active', 1) === 1
        )) {
        log.info(`inserting address ${_.get(newRow, 'fields.hash')}`);
        return await channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify({
          address: _.get(newRow, 'fields.hash')
        })));
      }
    });

  dbConnection.add(
    `${config.db.database}.${config.db.tables.settings}`,
    async function (oldRow, newRow) {

      if (newRow === null || ( //remove
        _.get(oldRow, 'fields.eth_ico_address') &&
        _.get(newRow, 'fields.eth_ico_address'))
      ) {
        log.info(`removing address ${_.get(oldRow, 'fields.eth_ico_address')}`);
        await channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify({
          address: _.get(oldRow, 'fields.eth_ico_address')
        })));
      }

      if (oldRow === null || (
          _.get(oldRow, 'fields.eth_ico_address') &&
          _.get(newRow, 'fields.eth_ico_address')
        )) {
        log.info(`inserting address ${_.get(newRow, 'fields.eth_ico_address')}`);
        return await channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify({
          address: _.get(newRow, 'fields.eth_ico_address')
        })));

      }
    });

};