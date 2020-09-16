/**
 * Request handlers
 */
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

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

// required data: phone
//optional data: none
// @Todo only let an authenticated user access their object and no one elses
handlers._users.get = (data, callback) => {
  //check that the phone number provided is valid
  const phone = (typeof (data.query.phone) == 'string' && data.query.phone.trim().length == 10) ? data.query.phone.trim() : false;

  if (phone) {
    // look up the user
    _data.read('users', phone, (error, data) => {
      if (!error && data) {
        // remove the hashed password from the user object before returning it to the requester
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    })
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
}


// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
// @Todo only let authemnticated users update their own data
handlers._users.put = (data, callback) => {
  //check for the required field
  const phone = (typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10) ? data.payload.phone.trim() : false;

  // check the optional fields
  const firstName = (typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName.trim() : false;
  const lastName = (typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName.trim() : false;
  const password = (typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;
  
  // error if the phone is invalid
  if (phone) {
    if (firstName || lastName || password) {
      // look up the user
      _data.read('users', phone, (error, user) => {
        if (!error && user) {
          // update the fiels necessary
          if (firstName) {
            user.firstName = firstName;
          }

          if (lastName) {
            user.lastName = lastName;
          }

          if (password) {
            user.hashedPassword = helpers.hash(password);
          }

          // store the updated user
          _data.update('users', phone, user, (error) => {
            if (!error) {
              callback(200);
            } else {
              console.error(error);
              callback(500, { Error: 'Could not update the user' });
            }
          })
        } else {
          callback(400, { Error: 'The specified user does not exist' });
        }
      })
    } else {
      callback(400, { Error: 'Missing fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing requored field' });
  }
}


// required field: phone
// @Todo only let authenticated users delete their records and not any one elses
// @Todo Clean up (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
  //check that the phone number provided is valid
  const phone = (typeof (data.query.phone) == 'string' && data.query.phone.trim().length == 10) ? data.query.phone.trim() : false;

  if (phone) {
    // look up the user
    _data.read('users', phone, (error, data) => {
      if (!error && data) {
        // delete the user record
        _data.delete('users', phone, (error) => {
          if (!error) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete the specified user' });
          }
        })
      } else {
        callback(400, { Error: 'Could not find the specified user' });
      }
    })
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
}


// Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];

  if (acceptableMethods.includes(data.method)) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
}

// container for all the token methods
handlers._tokens = {};


//required data: phone, password
//optional: none
handlers._tokens.post = (data, callback) => {
  const phone = (typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10) ? data.payload.phone.trim() : false;
  const password = (typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;

  if (phone && password) {
    //look up the user that matches the password
    _data.read('users', phone, (error, user) => {
      if (!error && user) {
        // hash the sent password and compare it to the stored user object
        const hashedPassword = helpers.hash(password);

        if (hashedPassword == user.hashedPassword) {
          // create a new token with a random name and set expriration date one hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const token = {
            id: tokenId,
            phone,
            expires
          }

          // store token
          _data.create('tokens', tokenId, tokenObject, (error) => {
            if(!error) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: 'Could not create the new token' });
            }
          })
        } else {
          callback(400, { Error: 'Password did not match the specified users stored password' });
        }
      } else {
        callback(400, { Error: 'Could not find the specifed user' });
      }
    })
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
}

handlers._tokens.get = (data, callback) => {

}

handlers._tokens.put = (data, callback) => {

}

handlers._tokens.delete = (data, callback) => {

}


// Not found controller
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;