const _ = require('lodash'),
  accountModel = require('../models/accountModel');

const getBalance = async (instance, acc) => {
  const balance = await instance.balanceOf(acc);
  return balance.toNumber();
};

const updateBalance = async (Erc20Contract, erc20addr, payload) => {
  const from = _.get(payload, 'from') || _.get(payload, 'owner');
  const to = _.get(payload, 'to') || _.get(payload, 'spender');

  const accounts = await accountModel.find({
    address: {
      $in: [from, to]
    },
    [`erc20token.${erc20addr}`]: {
      $ne: null
    }
  });

  const instance = await Erc20Contract.at(erc20addr);

  return await Promise.all(
    accounts.map(async function (account) {
      let obj = {};
      let balance = await getBalance(instance, account.address);
      obj[`erc20token.${erc20addr}`] = await getBalance(instance, account.address);
      await accountModel.update({address: account.address}, {$set: _.set({}, `erc20token.${erc20addr}`, balance)});
      return {
        address: account.address,
        erc20token: erc20addr,
        balance: balance,
        event: payload
      };
    }));
};
module.exports = updateBalance;
