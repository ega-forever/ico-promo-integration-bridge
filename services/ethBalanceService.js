const config = require('../config'),
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
          hash: payload.tx.hash
        }
      });

      tx ?
        tx.update({
          balance: payload.balance || 0
        }) :
        dbConnection.models.transactions.create({
          name: config.type,
          hash: payload.tx.hash,
          block_number: payload.tx.blockNumber,
          balance: payload.balance || 0
        });
    }

  } catch (e) {
    log.error(e);
  }

  channel.ack(data);
};