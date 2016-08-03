const glob = require('glob');
const path = require('path');
const generateRunner = require('./generateRunner');

module.exports = function(app, config) {
  const bridgeBase = config.bridgeBase;

  app.use('/mirage/ls', function(req, res, next) {
    if (req.method !== 'GET') {
      return next();
    }

    var files = glob.sync(`{packages,jsapp}/**/*.js`, {
      cwd: bridgeBase,
      nosort: true,
      stat: false,
      noext: true,
      nodir: true,
      ignore: [ '**/__tests__/**/*', '**/vendor/**/*', '**/dist/**/*' ],
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(files), 'utf-8');
  });

  app.use('/mirage/activate', function(req, res, next) {
    if (req.method !== 'POST') {
      next();
    }
    else if (!req.body) {
      res.writeHead(400);
      res.end();
    }
    else {
      generateRunner({
        profile: req.body.profile,
        subject: path.resolve(bridgeBase, req.body.filePath),
        subjectPath: req.body.filePath,
        params: req.body.params,
        paramsFile: req.body.paramsFile,
      });

      res.writeHead(204);
      res.end();
    }
  });
};
