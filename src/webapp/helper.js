import Duration from 'duration-js';
import { ContextMap } from '../common/context';
import MovieListing from '../common/movie-listing';
import Movie from '../common/movie';
import Showing from '../common/showing';
import Showtime from '../common/showtime';
import Theater from '../common/theater';

// The 'value' for listings, movies, showtimes and theaters are
// entry arrays ([ [k, v], [k, v], [k, v], ... ]).
export default function reviver(key, value) {
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
      retval = buildContextMap(MovieListing, value);
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
