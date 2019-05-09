// const Duration = require('../../lib/js/duration.js');

import context, { ContextMap } from '../common/context.js';
import Duration from '../common/duration.js';
import Listing from '../common/listing.js';
import Movie from '../common/movie.js';
import Showing from '../common/showing.js';
import Showtime from '../common/showtime.js';
import Theater from '../common/theater.js';
import Util from '../common/util.js';

// The 'value' for listings, movies, showtimes and theaters are
// entry arrays ([ [k, v], [k, v], [k, v], ... ]).
function reviver(key, value) {
  function buildContextMap(clazz, list) {
    const retval = new ContextMap();
    list.forEach((entry) => {
      const [k, v] = entry;
      const typedV = Object.setPrototypeOf(v, clazz.prototype);
      retval.set(k, typedV);
    });
    return retval;
  }

  let retval;

  switch (key) {
    case 'listings':
      retval = buildContextMap(Listing, value);
      break;

    case 'movies':
      retval = buildContextMap(Movie, value);
      break;

    case 'runningTime':
      retval = new Duration(value._milliseconds); // eslint-disable-line no-underscore-dangle
      break;

    case 'showings':
      retval = [];
      value.forEach((v) => {
        const listing = Object.setPrototypeOf(v, Showing.prototype);
        retval.push(listing);
      });
      break;

    case 'showtime':
      retval = new Showtime(value);
      break;

    case 'theaters':
      retval = buildContextMap(Theater, value);
      break;

    default:
      retval = value;
  }

  return retval;
}

export function parseContext(contextJSON) {
  const localContext = JSON.parse(contextJSON, reviver);
  localContext.theaters.forEach((theater) => {
    // eslint-disable-next-line no-param-reassign
    theater.movieListings = theater.movieListings.map(
      listingId => localContext.listings.get(listingId)
    );
    // TODO create context.remaining.showings using method change just put into util
    // the Util method can probably be removed.
    // It doesn't belong here, it belongs wherever the other remaining lists are created.
  });
  return localContext;
}

export function getRemainingShowings(selected) {
  function compareShowings(lhs, rhs) {
    return Showtime.compare(lhs.showtime, rhs.showtime)
      || (rhs.theater.distance - rhs.theater.distance)
      || Util.compareWOArticles(lhs.movie.title, rhs.movie.title)
      || Util.compareWOArticles(lhs.theater.name, rhs.theater.name);
  }

  // Return only selected values, unless there are no selected values, then return all values.
  function selectedListingFilter(listing) {
    return (((selected.theaters.size === 0) || selected.theaters.has(listing.theater.url))
      && ((selected.movies.size === 0) || selected.movies.has(listing.movie.url)));
  }

  return Array
    // IDs for all of the remaining listings...
    .from(context.remaining.listingIds.values())
    // ... converted to listings...
    .map(listingId => context.listings.get(listingId))
    // ... use only selected movies and theaters...
    .filter(selectedListingFilter)
    // ... gete the remaining showings in the listings...
    .reduce((showings, listing) => showings.concat(listing.showingsAfter(Showtime.now)), [])
    // ... sorted by showtime, theater distance, title, and theater name...
    .sort(compareShowings);
}
