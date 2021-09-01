const MemoryStream = require('memorystream');
const { Crypto } = require('@telios/client-sdk');
const { File } = require('../models/file.model');

module.exports.saveEmailToDrive = async opts => {
  return new Promise((resolve, reject) => {
    const readStream = new MemoryStream();
    readStream.end(JSON.stringify(opts.email));

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
  return new Promise((resolve, reject) => {
    const readStream = new MemoryStream();
    readStream.end(Buffer.from(opts.content));

    opts.drive.writeFile(opts.file.path, readStream, { encrypted: true })
      .then(file => {
        opts.file.contentType = file.mimetype;
        opts.file.key = file.key.toString('hex');
        opts.file.header = file.header.toString('hex');
        opts.file.drive = file.discoveryKey;

        File.create(opts.file)
          .then(() => {
            resolve()
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        reject(err)
      });
  });
};

module.exports.saveFileFromEncryptedStream = async (writeStream, opts) => {
  return new Promise((resolve, reject) => {
    opts.drive.readFile(opts.path, { key: opts.key, header: opts.header })
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
