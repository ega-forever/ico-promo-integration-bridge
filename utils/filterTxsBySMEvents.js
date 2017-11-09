const _ = require('lodash'),
  solidityEvent = require('../node_modules/web3/lib/web3/event.js');

module.exports = async (tx, smEvents) => {

  if (_.get(tx, 'logs', []).length === 0)
    return [];

  return _.chain(tx.logs)
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
