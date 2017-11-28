const config = require('../config'),
  request = require('request-promise');


module.exports = async (action, hash)=>{

  return await request({
    url: `${config.rest}/addr`,
    method: action,
    body: {
      address: hash
    },
    json: true
  });

};