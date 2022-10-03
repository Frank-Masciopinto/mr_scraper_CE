'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.js',
      content_Linkedin: PATHS.src + '/content_Linkedin.js',
      background: PATHS.src + '/background.js',
      api: PATHS.src + '/api.js',
    },
    devtool: 'cheap-module-source-map',
    //devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
