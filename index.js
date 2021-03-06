const config = require('./config'),
  bunyan = require('bunyan'),
  Connection = require('./controllers/SequilizeController'),
  Sequelize = require('sequelize'),
  path = require('path'),
  _ = require('lodash'),
  bitcoinBalanceService = require('./services/bitcoinBalanceService'),
  ethBalanceService = require('./services/ethBalanceService'),
  erc20BalanceService = require('./services/erc20BalanceService'),
  watchAccountsChangesService = require('./services/watchAccountsChangesService'),
  amqp = require('amqplib'),
  logger = bunyan.createLogger({name: 'core.icoPromo'});

global.log = bunyan.createLogger({name: 'core.icoPromo'});

/**
 * @module entry point
 * @description update balances for addresses, which were specified
 * in received transactions from blockParser via amqp
 */

let init = async () => {

  let dbConnection = await new Connection(config.db.database,
    config.db.login, config.db.pass, {
      host: config.db.host,
      dialect: config.db.dialect,
      sync: config.db.sync
    },
    path.join(__dirname, 'models')
  );

  global.log = {
    info: (msg) => {
      logger.info(msg);
      dbConnection.models[config.db.tables.logs].create({
        type: config.type,
        level: 1,
        message: JSON.stringify(msg)
      })
    },
    error: async (msg) => {
      await dbConnection.models[config.db.tables.logs].create({
        type: config.type,
        level: 0,
        message: JSON.stringify(msg)
      });
      logger.error(msg);
    },
    parent: logger
  };

  let conn = await amqp.connect(config.rabbit.url)
    .catch(async () => {
      await log.error('rabbitmq is not available!');
      process.exit(0);
    });
  let channel = await conn.createChannel();
  channel.on('close', async () => {
    await log.error('rabbitmq process has finished!');
    process.exit(0);
  });

  watchAccountsChangesService(channel);

  let accounts = await dbConnection.models[config.db.tables.addresses].findAll({
      where: {
        hash: {
          [Sequelize.Op.ne]: null
        },
        name: config.type === 'SNT' ? 'ETH' : config.type,
        active: 1
      }
    }) || [];

  let tokens = config.type === 'SNT' ? await dbConnection.models[config.db.tables.settings].findAll({
      where: {
        eth_ico_address: {
          [Sequelize.Op.ne]: null
        }
      }
    }) || [] : [];

  let addresses = _.chain(accounts)
    .map(account => account.hash)
    .union(tokens.map(token => token.eth_ico_address))
    .value();

  log.info('registering accounts on middleware');
  for (let address of addresses)
    await channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify({
      address: address
    })));

  log.info('listening to balance changes...');

  try {
    await channel.assertExchange('events', 'topic', {durable: false});
    await channel.assertQueue(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`);

    await channel.bindQueue(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`, 'events',
      `${config.rabbit.serviceName}_${['BTC', 'LTC'].includes(config.type) ? 'balance' : 'transaction'}.*`);
  } catch (e) {
    log.error(e);
    channel = await conn.createChannel();
  }

  channel.prefetch(2);

  if (config.type === 'ETH')
    return channel.consume(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`, async data => ethBalanceService(data, channel, dbConnection));

  if (['BTC', 'LTC'].includes(config.type))
    channel.consume(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`, async data => bitcoinBalanceService(data, channel, dbConnection));

  if (config.type === 'SNT')
    channel.consume(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`, async data => erc20BalanceService(data, channel, dbConnection));

};

module.exports = init();
