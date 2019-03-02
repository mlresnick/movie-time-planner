const path = require('path');
// const webpack = require('webpack');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = {
  mode: 'development',
  entry: [
    // XXX RINN
    // 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    './src/webapp/index.js',
  ],
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: '/',
    // XXX RINN
    // // Following 2 lines fix 404 errors during hot module replacement updates.
    // hotUpdateChunkFilename: 'hot-update.js',
    // hotUpdateMainFilename: 'hot-update.json',
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
    // XXX RINN
    // new webpack.HotModuleReplacementPlugin(),
    new WebpackCleanupPlugin(),
  ],
};
