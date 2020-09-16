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

// create a string of random alphanumeric characters of a given length;
helpers.createRandomString = (length) => {
  stringLength = typeof (stringLength) == 'number' && stringLength > 0 ? stringLength : false;

  if (!stringLength) {
    return false;
  }

  // define all the possible characters that could go into a string
  const posssibleChacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';

  for (const index = 1; index <= stringLength; i++) {
    // get a random chacter from the possible charcters string and then append this character to the final string
    const randomCharacter = posssibleChacters.charAt(Math.floor(Math.random() * posssibleChacters.length));

      str += randomCharacter;
  }

  return str;
}

module.exports = helpers;