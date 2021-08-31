// Check if the renderer and main bundles are built
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

const mainPath = path.join(__dirname, '..', '..', 'app', 'main.prod.js');
const mainWindow = getRendererPath('main');
const loginWindow = getRendererPath('login');
// const composerWindow = getRendererPath('composer');

if (!fs.existsSync(mainPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The main process is not built yet. Build it by running "yarn build-main"'
    )
  );
}

if (!fs.existsSync(mainWindow)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The main window renderer process is not built yet. Build it by running "yarn build-renderer"'
    )
  );
}

if (!fs.existsSync(loginWindow)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The login window renderer process is not built yet. Build it by running "yarn build-renderer"'
    )
  );
}

// if (!fs.existsSync(composerWindow)) {
//   throw new Error(
//     chalk.whiteBright.bgRed.bold(
//       'The composer window renderer process is not built yet. Build it by running "yarn build-renderer"'
//     )
//   );
// }

function getRendererPath(name) {
  return path.join(
    __dirname,
    '..',
    '..',
    'app',
    'dist',
    `${name}.renderer.prod.js`
  );
}
