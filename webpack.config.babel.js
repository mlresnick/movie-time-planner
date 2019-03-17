import '@babel/polyfill';
import '@babel/register';
// const path = require("path");

import initMTPRoutes from './src/js/server/server';

export const mode = 'development';
export const devtool = 'source-map';
export const module = {
  rules: [{
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: { loader: 'babel-loader' },
  },
  {
    test: /\.scss$/,
    use: [
      'style-loader',
      'css-loader',
      'sass-loader',
    ],
  }],
};
export const devServer = { before: initMTPRoutes };
