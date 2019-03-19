import fetch from 'cross-fetch';

import context from '../common/context';
import Util from '../common/util';

import Moviefone from './moviefone';

export default function initMTPRoutes(app/* , server */) {
  app.get('/zip-code/:zipCode', async (req, res) => {
    try {
      const moviefone = new Moviefone(req.params.zipCode, req.query['max-distance']);
      await moviefone.collectListings();
      res.json(context);
    }
    catch (error) {
      Util.logError(`Error collecting listing: ${error}\n\nContinuing...\n`);
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
      Util.logError(`Error getting distance matrix: ${error}\n\nContinuing...\n`);
    }
  });
}
