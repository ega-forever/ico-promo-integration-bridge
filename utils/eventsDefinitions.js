const _ = require('lodash'),
  utils = require('web3/lib/utils/utils.js'),
  Web3 = require('web3'),
  web3 = new Web3();
/**
 * @module events Controller
 * @description initialize all events for smartContracts,
 * @param contracts - instances of smartContracts
 * @returns {{eventModels, signatures}}
 */

module.exports = (contracts) => {

  return _.chain(contracts) //transform event definition to the following object {encoded_event_signature: event_definition}
    .get('abi')
    .filter({type: 'event'})
    .transform((result, ev) => {
      result[web3.sha3(utils.transformToFullName(ev))] = ev;
    }, {})
    .value();

};
