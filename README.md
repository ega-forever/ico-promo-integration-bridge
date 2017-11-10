# ico-promo-integration-bridge

Integration bridge between ico promo and middleware services

### Installation

In order to install it, follow these instractions:
1) clone repo and run ```npm install```
2) setup your env (via .env of pm2 - ecosystem.config.js)
3) run service with pm2 or just by typing ```node .```

#### About
This module is used for tracking and saving txs of registered users on platform.


#### How does it work?

The bridge register active users (taken from addresses table) and subscribes to appropiate events and listen to them. When new tx arrives - we validate it and safe to payments table.

##### сonfigure your .env

To apply your configuration, create a .env file in root folder of repo (in case it's not present already).
Below is the expamle configuration:

```
RABBIT_URI=amqp://localhost:5672
RABBIT_SERVICE_NAME=app_eth
RABBIT_ICO_SERVICE_NAME=ico-promo
TYPE=SNT
REST=http://localhost:8082
DB_HOST=localhost
DB_PORT=3306
DB_NAME=data
DB_USER=root
DB_PASS=123
```

The options are presented below:

| name | description|
| ------ | ------ |
| RABBIT_URI   | rabbitmq URI connection string
| RABBIT_SERVICE_NAME   | namespace for all rabbitmq queues, like 'app_eth_transaction'
| TYPE   | currency type. Can be (BTC, ETH, SNT)
| DB_HOST   | database host
| DB_PORT   | database port
| DB_NAME   | database name
| DB_USER   | username
| DB_PASS   | password

License
----

MIT