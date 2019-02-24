import express from 'express';
import { fetch } from 'cross-fetch';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import * as webpackConfigContainer from '../../webpack.config';
import Moviefone from './moviefone';

const webpackConfig = webpackConfigContainer.default;
const compiler = webpack(webpackConfig);
const root = path.resolve(`${__dirname}/../..`);

const app = express();

// HMR related plugins
app.use(
  webpackDevMiddleware(compiler, {
    hot: true,
    filename: 'main.js',
    publicPath: webpackConfig.output.publicPath,
    stats: { colors: true },
    historyApiFallback: true,
  })
);

app.use(
  webpackHotMiddleware(compiler, {
    log: console.log, // eslint-disable-line no-console
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000,
  })
);

// Routes
app.use(express.static(root));

app.get('/zip-code/:zipCode', async (req, res) => {
  try {
    const moviefone = new Moviefone(req.params.zipCode, req.query['max-distance']);
    const result = await moviefone.collectListings();
    res.json(result);
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error collecting listing: ${error}\n\nContinuing...\n`);
  }
});

app.get('/distancematrix', async (req, res) => {
  try {
    const query = [
      `origins=${req.query.origins}`,
      `destinations=${req.query.destinations}`,
      'units=imperial',
      `key=${process.env.googleAPIKey}`,
    ];

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${query.join('&')}`;

    const response = await fetch(url);
    const distanceMatrix = await response.json();
    res.json(distanceMatrix);
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error getting distance matrix: ${error}\n\nContinuing...\n`);
  }
});

const port = 8080;
app.listen(port, () => console.log(`Listening on port #${port}`)); // eslint-disable-line no-console
