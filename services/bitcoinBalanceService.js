const config = require('../config'),
  _ = require('lodash'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'services.bitcoinBalanceService'});

module.exports = async (data, channel, dbConnection) => {
  try {
    let payload = JSON.parse(data.content.toString());
    let account = await dbConnection.models.addresses.findOne({
      where: {
        hash: payload.address,
        name: config.type
      }
    });

    if (account && _.get(payload, 'tx.confirmations', 0) > 0) {
      dbConnection.models.payments.create({
        user_id: account.user_id,
        address: account.hash,
        type: config.type,
        txid: payload.tx.txid,
        amount: _.get(payload, 'balances.confirmations6') ||
        _.get(payload, 'balances.confirmations3') ||
        _.get(payload, 'balances.confirmations0', 0),
        data: JSON.stringify(payload.tx)
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