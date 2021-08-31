import path from 'path';
import { execSync } from 'child_process';
import fs, { readdirSync } from 'fs';
import { dependencies } from '../../app/package.json';

const nodeModulesPath = path.join(__dirname, '..', '..', 'app', 'node_modules');

const getModules = (source, exclude) =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !exclude.includes(dirent.name))
    .map(dirent => dirent.name);

if (
  Object.keys(dependencies || {}).length > 0 &&
  fs.existsSync(nodeModulesPath)
) {
  // Skip modules that are already prebuilt
  const exclude = ['sodium-native', 'utp-native', '.bin'];
  const modules = getModules(nodeModulesPath, exclude);

  const electronRebuildCmd = `../node_modules/.bin/electron-rebuild --parallel --types prod,dev,optional --only ${modules.toString()} --module-dir .`;

  const cmd =
    process.platform === 'win32'
      ? electronRebuildCmd.replace(/\//g, '\\')
      : electronRebuildCmd;
  execSync(cmd, {
    cwd: path.join(__dirname, '..', '..', 'app'),
    stdio: 'inherit'
  });
}
