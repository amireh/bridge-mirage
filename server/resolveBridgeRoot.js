var fs = require('fs');
var path = require('path');
var __cached;

module.exports = function() {
  if (__cached) {
    return __cached;
  }

  var currentDir = path.resolve(__dirname);

  while (true) {
    if (currentDir.length === 0 || currentDir === '/') {
      break;
    }
    else if (sniffPackage(currentDir)) {
      __cached = currentDir;

      if (process.env.DEBUG === '1') {
        console.log('eslint-plugin-bridge-symbiosis: bridge root:', __cached);
      }

      break;
    }

    currentDir = path.resolve(currentDir, '..');
  }

  return __cached;
};

module.exports.reset = function() {
  __cached = null;
};

function sniffPackage(directory) {
  var pkgPath = path.resolve(directory, 'package.json');

  return fs.existsSync(pkgPath) && require(pkgPath).name === 'get_smart';
}