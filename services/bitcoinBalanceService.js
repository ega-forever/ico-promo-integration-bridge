const config = require('../config'),
  _ = require('lodash');

module.exports = async (data, channel, dbConnection) => {
  try {
    let payload = JSON.parse(data.content.toString());

    let inputValue = _.chain(payload)
      .get('tx.inputs')
      .find(input => input.addresses.includes(payload.address))
      .get('value', 0)
      .value();

    let outputValue = _.chain(payload)
      .get('tx.outputs')
      .find(output => output.scriptPubKey.addresses.includes(payload.address))
      .get('value', 0)
      .value();

    let account = await dbConnection.models[config.db.tables.addresses].findOne({
      where: {
        hash: payload.address,
        name: config.type
      }
    });

    if (account && (inputValue || outputValue) && _.get(payload, 'tx.confirmations', 0) > 0) {
      await dbConnection.models[config.db.tables.payments].create({
        user_id: account.user_id, // eslint-disable-line
        address: account.hash,
        type: config.type,
        txid: payload.tx.txid,
        amount: Math.abs(outputValue - inputValue) / Math.pow(10, 8),
        withdraw: inputValue ? 1 : 0,
        data: JSON.stringify(payload.tx.inputs)
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