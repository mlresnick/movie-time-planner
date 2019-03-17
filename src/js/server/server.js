import fetch from 'cross-fetch';
import context from '../common/context';
import Moviefone from './moviefone';
import Util from '../common/util';

<<<<<<< HEAD
const root = path.resolve(`${__dirname}/../..`);

const app = express();

// Routes
app.use(express.static(root));

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
      `key=${process.env.googleAPIKey}`,
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

const port = 8080;
app.listen(port, () => Util.log(`Listening on port #${port}`));
=======
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
>>>>>>> 01016fe... Switch to webpack-dev-server (may be boken)
