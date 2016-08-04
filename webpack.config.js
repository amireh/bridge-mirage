'use strict';

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const webpack = require('webpack');
const jsonToSass = require('json-sass/lib/jsToSassString');
const BABEL_LOADER = 'babel?babelrc=false&presets[]=es2015&presets[]=react';

module.exports = function(mirageSettings) {
  const GET_SMART = mirageSettings.bridgeBase;

  const config = {
    cache: true,
    entry: {
      bundle: [
        path.resolve(__dirname, 'src/index.scss'),
        path.resolve(__dirname, 'src/index.js'),
      ],
    },

    context: path.resolve(GET_SMART),
    devtool: 'eval',

    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js'
    },

    resolve: {
      root: [
        path.resolve(__dirname, 'bandaids'),
        path.join(GET_SMART, 'jsapp/shimmed_modules'),
        path.join(GET_SMART, 'jsapp/shared'),
        path.join(GET_SMART, 'packages'),

        // This is needed for imports within the context file
        path.join(GET_SMART),
      ],

      fallback: path.resolve(__dirname),
      modulesDirectories: [ 'shared', 'node_modules', ],
      extensions: [ '.js', '', ],
      loaderExtensions: [ '.js', '' ],
      loaderPostfixes: [ '' ],
      postfixes: [ '' ],
      alias: {
        // TODO: remove when merging into get_smart
        'vendor/i18n$': path.join(GET_SMART, 'jsapp/vendor/i18n.js'),
        'vendor/i18n_js_extension$': path.join(GET_SMART, 'jsapp/vendor/i18n_js_extension.js'),
        'webpack-hot-middleware/client$': path.resolve(__dirname, 'node_modules/webpack-hot-middleware/client.js'),
      },
    },

    resolveLoader: {
      root: [
        path.resolve(__dirname, 'node_modules'),
        path.join(GET_SMART, 'node_modules'),
      ],

      alias: {
        'react-hot$': path.resolve(__dirname, 'node_modules/react-hot-loader/index.js')
      }
    },

    module: {
      noParse: [
        /vendor\//,
      ],
      loaders: [
        {
          id: 'js',
          test: /\.js$/,
          loader: BABEL_LOADER,
          include: [
            path.resolve(GET_SMART, 'jsapp'),
          ],
          exclude: [
            path.resolve(GET_SMART, 'jsapp/vendor'),
            path.resolve(GET_SMART, 'jsapp/shared/components'),
            path.resolve(GET_SMART, 'jsapp/screens')
          ]
        },

        {
          id: 'js-components',
          test: /\.js$/,
          loaders: [ 'react-hot', BABEL_LOADER ],
          include: [
            path.resolve(__dirname, 'src'),
          ].concat(
            // We can't just include "packages/" since it will also parse
            // any node_modules/ beneath it and other junk directories. Since
            // all packages are expected to place their sources under src/ we'll
            // just stick to the whitelist.
            glob.sync(path.resolve(GET_SMART, 'packages/*/src'))
          ).concat([
            path.resolve(GET_SMART, 'jsapp/shared/components'),
            path.resolve(GET_SMART, 'jsapp/screens'),
          ]),
        },

        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader?limit=100000',
          include: [
            path.resolve(GET_SMART, 'app/assets/fonts'),
            path.resolve(GET_SMART, 'app/assets/stylesheets'),
          ]
        },

        {
          id: 'scss',
          test: /\.scss$/,
          loader: 'style!css!sass',
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'runner'),
            path.resolve(GET_SMART, 'app/assets/stylesheets'),
          ]
        }
      ]
    },

    plugins: [
      new webpack.optimize.DedupePlugin(),
    ],

    sassLoader: {
      includePaths: [
        path.resolve(GET_SMART, 'node_modules'),
        path.resolve(GET_SMART, 'app/assets/stylesheets'),
      ],

      importer: function(url) {
        var filePath = path.join(GET_SMART, 'app/assets/stylesheets', url + '.json');

        if (fs.existsSync(filePath)) {
          var mapName = url.replace(/.*\//, '');

          return {
            contents: "$" + mapName + ": " + jsonToSass(JSON.parse(fs.readFileSync(filePath).toString())) + ";"
          };
        }
        else { // assume it's regular old s[ac]ss
          return { file: url };
        }
      }
    }
  };

  // DLL shizzle. Read more about this in /webpack/dlls/README.md
  if (mirageSettings.withDLLs === '1') {
    let manifest;

    manifest = loadDLLManifest(path.join(GET_SMART, 'webpack/dlls/manifests/vendor.json'));
    if (manifest) {
      console.warn('Webpack: will be using the vendor DLL.');

      config.plugins.push(new webpack.DllReferencePlugin({
        context: GET_SMART,
        manifest: manifest
      }));
    }
  }

  if (mirageSettings.happy === '1') {
    enableHappyPack(config);
  }

  return config;
};

function loadDLLManifest(filePath) {
  try {
    return require(filePath);
  }
  catch(e) {
    console.error(
      function() {/*
        ========================================================================
        Environment Error
        ------------------------------------------------------------------------
        You have requested to use webpack DLLs (env var WEBPACK_DLLS=1) but a
        manifest could not be found. This likely means you have forgotten to
        build the DLLs.

        You can do that by running:

            npm run build-dlls

        The request to use DLLs for this build will be ignored.
      */}.toString().slice(15,-4)
    );
  }

  return undefined;
}

function enableHappyPack(config) {
  const happypack = require('happypack');
  const happyThreadPool = happypack.ThreadPool({ size: 5 });

  config.module.loaders.forEach(function(loader) {
    const id = loader.id;

    if (id) {
      delete loader.loaders;
      delete loader.loader;
      delete loader.query;

      loader.loader = `happypack/loader?id=${id}`;
    }
  });

  config.plugins = config.plugins.concat([
    new happypack({
      id: 'js',
      enabled: true,
      threadPool: happyThreadPool,
      cache: true,
      loaders: [ BABEL_LOADER ],
    }),

    new happypack({
      id: 'js-components',
      enabled: true,
      threadPool: happyThreadPool,
      cache: true,
      loaders: [
        'react-hot',
        BABEL_LOADER
      ]
    }),

    new happypack({
      id: 'scss',
      enabled: true,
      threadPool: happyThreadPool,
      cache: true,
      loaders: [ 'style', 'css', 'sass' ]
    })
  ]);
}
