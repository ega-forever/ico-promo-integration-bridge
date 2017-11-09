const config = require('../config'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'services.ethBalanceService'});

module.exports = async (data, channel, dbConnection) => {
  try {
    let payload = JSON.parse(data.content.toString());

    let account = await dbConnection.models.addresses.findOne({
      where: {
        hash: payload.to,
        name: config.type
      }
    });

    if (account && payload.value > 0) {
      dbConnection.models.payments.create({
        user_id: account.user_id,
        type: config.type,
        amount: payload.value,
        address: payload.to,
        txid: payload.hash,
        data: JSON.stringify(payload)
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