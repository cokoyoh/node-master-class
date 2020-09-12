/**
 * Request handlers
 */
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config')

const handlers = {};

handlers.ping = (data, callback) => {
  callback(200);
};

handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];

  if (acceptableMethods.includes(data.method)) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
}

// container for the users submethods
handlers._users = {};

//users post
// required data: firstName, lastName, phone, password, tosAgreement
// optional data: none
handlers._users.post = (data, callback) => {
  // chack that all required fields are filled out
  const firstName = (typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName.trim() : false;
  const lastName = (typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName.trim() : false;
  const phone = (typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10) ? data.payload.phone.trim() : false;
  const password = (typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;
  const tosAgreement = (typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true) ? data.payload.tosAgreement : false;


  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user doesn't already exist
    _data.read('users', phone, (error, data) => {
      if (error) {
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // create user object
          const user = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true
          }

          //store user
          _data.create('users', phone, user, (error) => {
            if (!error) {
              callback(200);
            } else {
              console.error(error);
              callback(500, { Error: 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { Error: 'Could not hash the user\'s password ' });
        }

      } else {
        callback(400, { Error: 'A user with that phone number already exists' });
      }
    })
  } else {
    callback(400, { Error: 'Missing required fields', firstName, lastName, phone, password, tosAgreement });
  }
}

handlers._users.get = (data, callback) => {

}

handlers._users.put = (data, callback) => {

}

handlers._users.delete = (data, callback) => {

}


// Not found controller
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;