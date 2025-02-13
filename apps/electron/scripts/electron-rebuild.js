import {execSync} from 'child_process';
import fs from 'fs';
import {dependencies} from '../release/app/package.json';
import path from 'path';

const rootPath = path.join(__dirname, '../');
const releasePath = path.join(rootPath, 'release');
const appPath = path.join(releasePath, 'app');
const appNodeModulesPath = path.join(appPath, 'node_modules');

if (Object.keys(dependencies || {}).length > 0 && fs.existsSync(appNodeModulesPath)) {
  const electronRebuildCmd =
    '../node_modules/.bin/electron-rebuild --force --types prod,dev,optional --module-dir .';
  const cmd =
    process.platform === 'win32' ? electronRebuildCmd.replace(/\//g, '\\') : electronRebuildCmd;
  execSync(cmd, {
    cwd: appPath,
    stdio: 'inherit',
  });
}
