#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const connect = require('connect');
const proxy = require('proxy-middleware');
const url = require('url');
const webpack = require('webpack');
const bodyParser = require('body-parser');
const api = require('./server/api');
const generateRunner = require('./server/generateRunner');
const webpackConfig = Object.assign({}, require('./webpack.config'));
const app = connect();
const contentBase = path.resolve(__dirname);
const bridgeBase = path.resolve(__dirname, '..', '..');
const PORT = process.env.PORT || 9999;

webpackConfig.entry.bundle = [
  `webpack-hot-middleware/client?path=http://localhost:${PORT}/__webpack_hmr`
].concat( webpackConfig.entry.bundle );

webpackConfig.output.publicPath = '/build/';
webpackConfig.plugins = (webpackConfig.plugins || []).concat([
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
]);

const compiler = webpack(webpackConfig);

app.use('/api', proxy(url.parse('http://bridge.localhost.com:3000/api')));
// app.use('/fonts', proxy(url.parse('http://bridge.localhost.com:3000/fonts')));
// app.use('/images', proxy(url.parse('http://bridge.localhost.com:3000/images')));
// app.use('/locales', proxy(url.parse('http://bridge.localhost.com:3000/locales')));
// app.use('/fakes3-uploads', proxy(url.parse('http://bridge.localhost.com:3000/fakes3-uploads')));

app.use(bodyParser.json());
app.use(require('webpack-dev-middleware')(compiler, {
  contentBase: contentBase,
  publicPath: webpackConfig.output.publicPath,
  hot: false,
  quiet: false,
  noInfo: false,
  lazy: false,
  inline: false,
  profile: true,
  watchOptions: {
    aggregateTimeout: 300,
  },
  stats: process.env.PROFILE === '1' ? {
    colors: true,
    hash: true,
    version: true,
    timings: true,
    assets: true,
    chunks: true,
    modules: true,
    reasons: true,
    children: true,
    source: false,
    errors: true,
    errorDetails: true,
    warnings: true,
    publicPath: true
  } : { colors: true, version: true, hash: true, modules: false },
  historyApiFallback: false,
}));

app.use(require('webpack-hot-middleware')(compiler));

// mirage API endpoints:
api(app, { bridgeBase: path.resolve(__dirname, '../../') });

// serve Mirage index.html:
app.use(require('serve-static')(contentBase));

// forward to bridge's public/ directory for static assets like fonts/,
// locales/, etc.:
app.use(require('serve-static')(path.join(bridgeBase, 'public')));

app.listen(PORT);