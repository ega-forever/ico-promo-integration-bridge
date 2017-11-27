"use strict";

const _ = require('lodash'),
  path = require('path'),
  Sequelize = require('sequelize'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.icoPromo'}),
  requireAll = require('require-all');

let instance = null;

class Connection {

  constructor (database, username, password, options = {}, discover = '/model') {

    if (instance) return instance;

    this.database = database;
    this.username = username;
    this.password = password;
    this.options = options;
    this.discover = discover;

    this.models = {};
    this.Sequelize = Sequelize;

    instance = this._connect();

    let originalQuery = Sequelize.prototype.query;
    return instance.then(function (connection) {
      Sequelize.prototype.query = function () {
        return originalQuery.apply(this, arguments).catch(function (err) {
          log.error('tables don\'t exist in db!');
          process.exit(1);
        });
      };
      return instance = connection;
    });
  }

  /**
   * Connect to the db
   * @return {Object} A database object containing sequelize and models
   */
  async _connect () {

    if (instance) return instance;

    log.info(`Connecting to: ${this.database} as: ${this.username}`);
    let sequelize = new this.Sequelize(this.database, this.username, this.password, this.options);
    let models = {};

    let modelsDiscovered = requireAll({
      dirname: this.discover,
      map: (name, path) => path
    });

    _.chain(modelsDiscovered)
      .keys()
      .forEach(path => {
        let model = sequelize["import"](path);
        if (model)
          models[model.name] = model;
      })
      .value();

    _.chain(models)
      .keys()
      .forEach(modelName => {
        if ("associate" in models[modelName])
          models[modelName].associate(models);
      })
      .value();

    if (this.options.sync)
      await sequelize.sync();

    log.info(`Finished synchronizing ${this.database}`);
    // Expose objects
    this.sequelize = sequelize;
    this.models = models;

    return this;
  }

}

module.exports = Connection;