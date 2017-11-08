const config = require('../config'),
  _ = require('lodash'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'services.bitcoinBalanceService'});

module.exports = async (data, channel, dbConnection) => {
  try {
    let payload = JSON.parse(data.content.toString());
    let account = dbConnection.models.addresses.findOne({
      where: {hash: payload.address}
    });

    if (account) {
      let tx = await dbConnection.models.transactions.findOne({
        where: {
          hash: payload.tx.txid
        }
      });

      if (_.get(payload, 'tx.confirmations', 0) > 0)
        tx ?
          tx.update({
            balance: _.get(payload, 'balances.confirmations6') ||
            _.get(payload, 'balances.confirmations3') ||
            _.get(payload, 'balances.confirmations0', 0)
          }) :
          dbConnection.models.transactions.create({
            address_id: account.id,
            hash: payload.tx.txid,
            block_number: payload.tx.block,
            balance: _.get(payload, 'balances.confirmations6') ||
            _.get(payload, 'balances.confirmations3') ||
            _.get(payload, 'balances.confirmations0', 0)
          });
    }

  } catch (e) {
    log.error(e);
  }

  channel.ack(data);
};