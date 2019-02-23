import express from 'express';
import { fetch } from 'cross-fetch';
import path from 'path';
import Moviefone from './moviefone';

const root = path.resolve(`${__dirname}/../..`);

const app = express();

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
      'key=***REMOVED***',
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
app.listen(8080);
