const MemoryStream = require('memorystream');
const { Crypto } = require('@telios/client-sdk');
const { File } = require('../models/file.model');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

module.exports.saveEmailToDrive = async opts => {
  return new Promise((resolve, reject) => {
    const readStream = new MemoryStream();
    readStream.end(JSON.stringify(opts.email));

    if(!opts.email.path) {
      opts.email.path = `/email/${uuidv4()}.json`;
    }

    opts.drive.writeFile(opts.email.path, readStream, { encrypted: true })
      .then(data => {
        resolve(data)
      })
      .catch(err => {
        reject(err)
      });
  });
};

module.exports.saveFileToDrive = async opts => {
  return new Promise(async (resolve, reject) => {
    let readStream;

    // When file is over 25mb create readstream from file path
    if(opts.file.localPath) {
      readStream = fs.createReadStream(opts.file.localPath);
      opts.file.path = `/file/${opts.file.filename || opts.file.name}`
    }
    
    if(opts.content) {
      readStream = new MemoryStream();
      readStream.end(Buffer.from(opts.content, 'base64'));

      if(!opts.file.path) {
        opts.file.path = `/file/${opts.file.filename || opts.file.name}`
      }
    }

    if(opts.drive && opts.file.discoverykey && opts.file.hash) {
      try {
        readStream = await opts.drive.fetchFileByDriveHash(opts.file.discoveryKey, opts.file.hash, { key: opts.file.key, header: opts.file.header });
      } catch(e) {
        reject(e)
      }
    }

    if(readStream) {
      readStream.on('error', e => {
        process.send({ event: 'saveFileToDrive - Readstream Error', e: error.message, stack: e.stack })
        reject(e);
      })

      opts.drive.writeFile(opts.file.path, readStream, { encrypted: true })
        .then(file => {
          if(!opts.file.contentType && file.mimetype) {
            opts.file.contentType = file.mimetype;
          }
          
          opts.file.key = file.key.toString('hex');
          opts.file.header = file.header.toString('hex');
          opts.file.hash = file.hash;
          opts.file.discovery_key = file.discovery_key;

          File.create(opts.file)
            .then(() => {
              resolve(file)
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          reject(err)
        });
    } else {
      reject(`Unable to establish a readable stream for file ${opts.file.filename}`)
    }
  });
};

module.exports.saveFileFromEncryptedStream = async (writeStream, opts) => {
  return new Promise((resolve, reject) => {
    if(opts.discoveryKey && opts.drive.discoveryKey !== opts.discoveryKey) {
      opts.drive.fetchFileByDriveHash(opts.discoveryKey, opts.hash, { key: opts.key, header: opts.header })
        .then(stream => {
          stream.on('error', e => {
            reject(e);
          });
    
          stream.on('data', chunk => {
            writeStream.write(chunk);
          });
    
          stream.on('end', (data) => {
            writeStream.end();
          });
    
          writeStream.on('finish', () => {
            resolve();
          });
        })
        .catch(err => {
          reject(err);
          throw err;
        });
    } else {
      opts.drive.readFile(`/file/${opts.filename}`, { key: opts.key, header: opts.header })
        .then(stream => {
          stream.on('data', chunk => {
            writeStream.write(chunk);
          });

          stream.on('end', (data) => {
            writeStream.end();
          });

          writeStream.on('finish', () => {
            resolve();
          });
        })
        .catch(err => {
          reject(err);
          throw err;
        });
    }
  });
};

module.exports.readFile = (path, { drive, type }) => {
  return new Promise((resolve, reject) => {
    let content = '';
    
    drive.readFile(path)
      .then(stream => {
        stream.on('data', chunk => {
          if (type === 'email') {
            content += chunk.toString('utf8');
          } else {
            content += chunk.toString('base64');
          }
        });

        stream.on('end', (data) => {
          resolve(content);
        });

        stream.on('error', (err) => {
          reject(err);
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports.decodeB64 = (base64) => {
  return Buffer.from(base64, 'base64');
}
