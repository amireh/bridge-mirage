#!/usr/bin/env node

const path = require('path');
const connect = require('connect');
const proxy = require('proxy-middleware');
const url = require('url');
const webpack = require('webpack');
const bodyParser = require('body-parser');
const api = require('./server/api');
const contentBase = path.resolve(__dirname);
const bridgeBase = getSetting('BRIDGE_ROOT', require('./server/resolveBridgeRoot')());
const bridgeHost = getSetting('BRIDGE_HOST', 'http://bridgelearning.dev:3000');
const port = getSetting('PORT', 9999);
const webpackConfig = loadAndMonkeyPatchWebpackConfig(port);

const app = connect();
const compiler = webpack(webpackConfig);

app.use('/api', proxy(url.parse(`${bridgeHost}/api`)));

app.use(bodyParser.json());
app.use(require('webpack-dev-middleware')(compiler, {
  contentBase: contentBase,
  publicPath: webpackConfig.output.publicPath,
  hot: false,
  quiet: false,
  noInfo: process.env.PROFILE !== '1',
  lazy: false,
  inline: false,
  profile: process.env.PROFILE === '1',
  historyApiFallback: false,
  watchOptions: {
    aggregateTimeout: 300,
  },

  stats: {
    colors: true,
    hash: true,
    version: true,
    timings: process.env.PROFILE === '1',
    assets: process.env.PROFILE === '1',
    chunks: true,
    modules: process.env.PROFILE === '1',
    reasons: process.env.PROFILE === '1',
    children: process.env.PROFILE === '1',
    source: false,
    errors: true,
    errorDetails: true,
    warnings: true,
    publicPath: process.env.PROFILE === '1',
  },
}));
app.use(require('webpack-hot-middleware')(compiler));

// mirage API endpoints:
api(app, { bridgeBase: bridgeBase });

// serve Mirage index.html:
app.use(require('serve-static')(contentBase));

// forward to bridge's public/ directory for static assets like fonts/,
// locales/, etc.:
app.use(require('serve-static')(path.join(bridgeBase, 'public')));

console.log(Array(80).join('='));
console.log('Mirage [Bridge]');
console.log(Array(80).join('*'));
console.log('Mirage: Running initial Webpack build, hold your horses...');

compiler.plugin('done', fnOnce(function() {
  console.log('Mirage: OK, all set for play.');
}));

app.listen(port, function() {
  console.log('Mirage: HTTP server listening at %d', port);
});

function fnOnce(fn) {
  let called = false;

  return function() {
    if (!called) {
      called = true;
      fn.apply(null, arguments);
    }
  }
}

function getSetting(key, defaultValue) {
  let userConfig;

  try {
    userConfig = require('./config');
  }
  catch(e) {
    userConfig = {};
  }

  return process.env[key] || userConfig[key] || defaultValue;
}

function loadAndMonkeyPatchWebpackConfig(port) {
  const config = Object.assign({}, require('./webpack.config'));

  config.entry.bundle = [
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`
  ].concat( config.entry.bundle );

  config.output.publicPath = '/build/';
  config.plugins = (config.plugins || []).concat([
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]);

  return config;
}
