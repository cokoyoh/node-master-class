// Library for storing and editing data
const fs = require('fs');
const path = require('path');

// container for module
const lib = {}; 

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// write data to a file
lib.create = (dir, file, data, callback) => {
  // open file for writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (error, fileDescriptor) => {
    if (!error && fileDescriptor) {
      // convert data to a string
      const stringData = JSON.stringify(data);

      // write to to the file and close it
      fs.writeFile(fileDescriptor, stringData, (error) => {
        if (!error) {
          fs.close(fileDescriptor, (error) => {
            if (!error) {
              callback(false);
            } else {
              callback('Error closing new file')
            }
          })
        } else {
          callback('Error writting to the new file');
        }
      })
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
};

// read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (error, data) => {
    callback(error, data);
  })
}

//update data inside a file
lib.update = (dir, file, data, callback) => {
  // open file for writting
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (error, fileDescriptor) => {
    if (!error && fileDescriptor) {
        // convert data to a string
      const stringData = JSON.stringify(data);
      
      //truncate the content of the file
      fs.ftruncate(fileDescriptor, (error) => {
        if (!error) {
          // write to the file and closs it
          fs.writeFile(fileDescriptor, stringData, (error) => {
            if (!error) {
              fs.close(fileDescriptor, (error) => {
                if (!error) {
                  callback(false);
                } else {
                  callback('Error closing the file');
                }
              })
            } else {
              callback('Error writting to existing file');
            }
          })
          
        } else {
          callback('Error truncating file');
        }
      })
      
    } else {
      callback('Could not open the file for updating, it may not exist yet');
    }
  })
};

lib.delete = (dir, file, callback) => {
  // unlink the file 
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (error) => {
    if (!error) {
      callback(false);
    } else {
      callback('Error deleting the file.');
    }
  })
}

module.exports = lib;


