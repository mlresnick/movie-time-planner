const path = require('path');
// const webpack = require('webpack');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = {
  mode: 'development',
  entry: [
    './src/webapp/index.js',
  ],
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: '/',
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        'style-loader', // creates style nodes from JS strings
        'css-loader', // translates CSS into CommonJS
        'sass-loader', // compiles Sass to CSS, using Node Sass by default
      ],
    }],
  },
  plugins: [
    new WebpackCleanupPlugin(),
  ],
};
