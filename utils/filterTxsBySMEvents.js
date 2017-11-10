const _ = require('lodash'),
  solidityEvent = require('../node_modules/web3/lib/web3/event.js');

module.exports = async (tx, smEvents, dbConnection) => {

  if (_.get(tx, 'logs', []).length === 0)
    return [];

  let addresses = await dbConnection.models.erc20_tokens.findAll({
    where: {
      address: {
        $in: _.chain(tx.logs)
          .map(log => log.address)
          .compact()
          .value()
      }
    }
  });

  return _.chain(tx.logs)
    .filter(log =>
      _.find(addresses, {address: log.address})
    )
    .map(ev => {
      let signatureDefinition = smEvents[ev.topics[0]];

      if (!signatureDefinition)
        return;

      _.pullAt(ev, 0);
      let resultDecoded = new solidityEvent(null, signatureDefinition).decode(ev);

      return _.chain(resultDecoded)
        .pick(['event', 'args'])
        .value();
    })
    .value();

};
