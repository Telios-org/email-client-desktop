const worker = require('../workers/main.worker');

class FileService {
  static async getFile(id) {
    worker.send({
      event: 'getFile',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      worker.once(`getFile${id}`, m => {
        const { data, error } = m;

        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static async saveFileToDrive(file) {
    worker.send({
      event: 'FILE_SERVICE::saveFile',
      payload: { file }
    });

    return new Promise((resolve, reject) => {
      worker.once(`FILE_WORKER::saveFile`, m => {
        const { data, error } = m;

        if (error) return reject(error);
        return resolve(data);
      });
    });
  }
}

module.exports = FileService;
