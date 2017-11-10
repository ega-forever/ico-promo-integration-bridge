const config = require('./config'),
  bunyan = require('bunyan'),
  Connection = require('sequelize-connect'),
  Sequelize = require('sequelize'),
  path = require('path'),
  request = require('request-promise'),
  bitcoinBalanceService = require('./services/bitcoinBalanceService'),
  ethBalanceService = require('./services/ethBalanceService'),
  erc20BalanceService = require('./services/erc20BalanceService'),
  watchAccountsChangesService = require('./services/watchAccountsChangesService'),
  updateAccountRest = require('./utils/updateAccountRest'),
  log = bunyan.createLogger({name: 'core.icoPromo'}),
  amqp = require('amqplib');

/**
 * @module entry point
 * @description update balances for addresses, which were specified
 * in received transactions from blockParser via amqp
 */

let init = async () => {

  let dbConnection = await new Connection(config.db.database,
    config.db.login, config.db.pass, {
      dialect: config.db.dialect,
      port: config.db.port,
      host: config.db.host
    },
    [path.join(__dirname, 'models')]
  );

  let conn = await amqp.connect(config.rabbit.url)
    .catch(() => {
      log.error('rabbitmq is not available!');
      process.exit(0);
    });
  let channel = await conn.createChannel();
  channel.on('close', () => {
    log.error('rabbitmq process has finished!');
    process.exit(0);
  });

  watchAccountsChangesService();

  let accounts = await dbConnection.models.addresses.findAll({
      where: {
        hash: {
          [Sequelize.Op.ne]: null
        },
        name: config.type === 'SNT' ? 'ETH' : config.type,
        active: 1
      }
    }) || [];

  log.info('registering accounts on middleware');
  for (let account of accounts)
    await updateAccountRest('post', account.hash);

  log.info('listening to balance changes...');

  try {
    await channel.assertExchange('events', 'topic', {durable: false});
    await channel.assertQueue(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`);

    await channel.bindQueue(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`, 'events',
      `${config.rabbit.serviceName}_${['BTC'].includes(config.type) ? 'balance' : 'transaction'}.*`);
  } catch (e) {
    log.error(e);
    channel = await conn.createChannel();
  }

  channel.prefetch(2);

  if (config.type === 'ETH')
    return channel.consume(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`, async data => ethBalanceService(data, channel, dbConnection));

  if (['BTC'].includes(config.type))
    channel.consume(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`, async data => bitcoinBalanceService(data, channel, dbConnection));

  if (config.type === 'SNT')
    channel.consume(`app_${config.rabbit.icoServiceName}.balance_watcher.${config.type}`, async data => erc20BalanceService(data, channel, dbConnection));

};

module.exports = init();
