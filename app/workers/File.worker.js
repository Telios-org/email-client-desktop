const { File } = require('../models/file.model');
const fileUtil = require('../utils/file.util');
const store = require('../Store');

module.exports = () => {
  process.on('message', async data => {
    const { event, payload } = data;

    if (event === 'getFile') {
      const { id } = payload;
      const drive = store.getDrive();

      try {
        const file = await File.findByPk(id, {
          attributes: ['id', 'drive', 'path', 'key', 'header'],
          raw: true
        });

        const fileContent = await fileUtil.readFile(file.path, { drive, key: file.key, header: file.header });

        return process.send({ event: `getFile${id}`, data: fileContent });
      } catch(e) {
        process.send({ event: 'getFile', error: e.message });
      }
    }

    if (event === 'FILE_SERVICE::saveFile') {
      const { file } = payload;
      const drive = store.getDrive();

      try {
        const _file = await fileUtil.saveFileToDrive({ file, content: file.content, drive });
        process.send({ event: 'FILE_WORKER::saveFile', data: _file });
      } catch(e) {
        process.send({ 
          event: 'FILE_WORKER::saveFile', 
          error: { 
            message: e.message, 
            stack: e.stack 
          } 
        });
      }
    }
  });
};

