const config = require('../config');

module.exports = async (data, channel, dbConnection) => {
  try {
    let payload = JSON.parse(data.content.toString());

    let account = await dbConnection.models[config.db.tables.addresses].findOne({
      where: {
        hash: payload.to,
        name: config.type
      }
    });

    if (account && payload.value > 0) {
      dbConnection.models[config.db.tables.payments].create({
        user_id: account.user_id, // eslint-disable-line
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