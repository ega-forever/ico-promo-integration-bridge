const config = require('../config'),
  request = require('request-promise');


module.exports = async (action, payload)=>{

  return await request({
    url: `${config.rest}/addr/${payload.address}/token`,
    method: action,
    body: payload,
    json: true
  });

};