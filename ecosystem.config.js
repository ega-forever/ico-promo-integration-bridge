module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'SNT',
      script: 'index.js',
      env: {
        TYPE: 'SNT',
        REST: 'http://localhost:8082',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_NAME: 'data',
        DB_USER: 'root',
        DB_PASS: 123,
        RABBIT_URI: 'amqp://localhost:5672',
        RABBIT_SERVICE_NAME: 'app_eth',
        RABBIT_ICO_SERVICE_NAME: 'ico-promo'
      }
    },
    {
      name: 'BTC',
      script: 'index.js',
      env: {
        TYPE: 'BTC',
        REST: 'http://localhost:8082',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_NAME: 'data',
        DB_USER: 'root',
        DB_PASS: 123,
        RABBIT_URI: 'amqp://localhost:5672',
        RABBIT_SERVICE_NAME: 'app_bitcoin',
        RABBIT_ICO_SERVICE_NAME: 'ico-promo'
      }
    },
    {
      name: 'ETH',
      script: 'index.js',
      env: {
        TYPE: 'ETH',
        REST: 'http://localhost:8082',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_NAME: 'data',
        DB_USER: 'root',
        DB_PASS: 123,
        RABBIT_URI: 'amqp://localhost:5672',
        RABBIT_SERVICE_NAME: 'app_eth',
        RABBIT_ICO_SERVICE_NAME: 'ico-promo'
      }
    }
  ]
};
