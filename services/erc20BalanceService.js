const config = require('../config'),
  bunyan = require('bunyan'),
  _ = require('lodash'),
  erc20token = require('../build/contracts/TokenContract.json'),
  smEvents = require('../utils/eventsDefinitions')(erc20token),
  filterTxsBySMEvents = require('../utils/filterTxsBySMEvents'),
  log = bunyan.createLogger({name: 'services.erc20BalanceService'});

module.exports = async (data, channel, dbConnection) => {
  try {
    let payload = JSON.parse(data.content.toString());

    if (payload.logs)
      console.log(payload)
    let filtered = await filterTxsBySMEvents(payload, smEvents, dbConnection);
    filtered = _.filter(filtered, {event: 'Transfer'});

    for (let event of filtered) {
      let account = await dbConnection.models.addresses.findOne({
        where: {
          hash: event.args.from,
          name: config.type
        }
      });

      if (account) {
        dbConnection.models.payments.create({
          type: config.type,
          address: account.hash,
          user_id: account.user_id, // eslint-disable-line
          txid: payload.hash,
          amount: event.args.value,
          data: JSON.stringify(event)
        }).catch(e => {
          if (!(e instanceof dbConnection.sequelize.UniqueConstraintError))
            return Promise.reject(e);
        });

      }
    }

  } catch (e) {
    log.error(e);
  }

  channel.ack(data);
};