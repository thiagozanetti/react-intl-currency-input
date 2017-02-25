const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());

const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .map(resolveApp);

module.exports = {
  appBuild: resolveApp('example/dist'),
  appPublic: resolveApp('example/public'),
  appHtml: resolveApp('example/public/index.html'),
  appIndexJs: resolveApp('example/src/index.jsx'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('example/src'),
  componentSrc: resolveApp('src'),
  appNodeModules: resolveApp('node_modules'),
  ownNodeModules: resolveApp('node_modules'),
  nodePaths: nodePaths
};
