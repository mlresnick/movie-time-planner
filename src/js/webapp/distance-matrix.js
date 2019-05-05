import { fetch } from 'cross-fetch';

import Util from '../common/util';

export default async function getDistanceMatrix(origins, destinationsArg) {
  let retval = null;

  const destinations = destinationsArg || origins;
  if (arguments.length === 0) {
    throw new Error('Must be called with at least one parameter');
  }

  const query = [
    `origins=${origins.join('|')}`,
    `destinations=${destinations.join('|')}`,
  ];

  // XXX
  const rootURL = 'http://localhost:8080';
  const url = `${rootURL}/distancematrix?${query.join('&')}`;

  try {
    const response = await fetch(url/* , { mode: 'no-cors' } */);
    if (response.status !== 200) {
      Util.logError(`Looks like there was a problem. Status Code: ${response.status}`);
    }
    else {
      retval = await response.json();
    }
  }
  catch (err) {
    Util.logError(`Looks like there was a problem.\n${err}`);
  }

  return retval;
}
