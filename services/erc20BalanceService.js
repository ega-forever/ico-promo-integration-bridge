const config = require('../config'),
  bunyan = require('bunyan'),
  _ = require('lodash'),
  erc20token = require('../build/contracts/TokenContract.json'),
  smEvents = require('../utils/eventsDefinitions')(erc20token),
  filterTxsBySMEvents = require('../utils/filterTxsBySMEvents');

module.exports = async (data, channel, dbConnection) => {
  try {
    let payload = JSON.parse(data.content.toString());

    let filtered = await filterTxsBySMEvents(payload, smEvents, dbConnection);
    filtered = _.filter(filtered, {event: 'Transfer'});

    for (let event of filtered) {
      let account = await dbConnection.models[config.db.tables.addresses].findOne({
        where: {
          hash: event.args.from,
          name: 'ETH'
        }
      });

      dbConnection.models[config.db.tables.payments].create({
        type: config.type,
        address: event.args.from,
        user_id: _.get(account, 'user_id'), // eslint-disable-line
        txid: payload.hash,
        amount: event.args.value,
        data: _.merge({}, payload, {logs: [event]})
      }).catch(e => {
        if (!(e instanceof dbConnection.sequelize.UniqueConstraintError))
          return Promise.reject(e);
      });

    }

  } catch (e) {
    log.error(e);
  }

  channel.ack(data);
};