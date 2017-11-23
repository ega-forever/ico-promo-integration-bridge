require('dotenv').config();
const _ = require('lodash');

/**
 * @factory config
 * @description base app's configuration
 * @returns {{
 *    type: (*),
 *    rest: (*),
 *    db: {
 *      dialect: string,
 *      host: (*),
 *      port: (*),
 *      database: (*),
 *      login: (*),
 *      pass: (*)},
 *      rabbit: {
 *        url: (*),
 *        serviceName: (*),
 *        icoServiceName: (*)
 *        }
 *      }
 *    }
 */

module.exports = {
  type: process.env.TYPE || 'SNT', //BTC, ETH, SNT
  rest: process.env.REST || 'http://localhost:8082',
  db: {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'data',
    login: process.env.DB_USER || 'root',
    pass: _.isString(process.env.DB_PASS) ? process.env.DB_PASS : '123',
    tables: {
      addresses: process.env.DB_TABLE_ADDRESSES || 'addresses',
      payments: process.env.DB_TABLE_PAYMENTS || 'payments',
      erc20_tokens: process.env.DB_TABLE_ERC20 || 'erc20_tokens'
    },
    sync: process.env.DB_SYNC || false
  },
  rabbit: {
    url: process.env.RABBIT_URI || 'amqp://localhost:5672',
    serviceName: process.env.RABBIT_SERVICE_NAME || 'app_eth',
    icoServiceName: process.env.RABBIT_ICO_SERVICE_NAME || 'ico-promo'
  }
};
