const crypto = require('crypto');
const config = require('./config')

const helpers = {};

// create a sha256 hash
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  }  

  return false;
}

// parse a json string to an object in all cases without throwing an error in any case
helpers.parseJsonToObject = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return {};
  }
}

module.exports = helpers;