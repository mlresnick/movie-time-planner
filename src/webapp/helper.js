import Duration from 'duration-js';
import { ContextArray, ContextMap } from '../common/context';
import MovieListing from '../common/movie-listing';
import Movie from '../common/movie';
import Showing from '../common/showing';
import Showtime from '../common/showtime';
import Theater from '../common/theater';

// The 'value' for listings, movies, showtimes and theaters are
// arrays.
/* eslint-disable import/prefer-default-export */
export function reviver(key, value) {
  function buildContextMap(clazz, list) {
    const retval = new ContextMap();
    list.forEach((entry) => {
      const [k, props] = entry;
      const v = Object.setPrototypeOf(props, clazz.prototype);
      retval.set(k, v);
    });
    return retval;
  }

  let retval;

  switch (key) {
    case 'listings':
      retval = new ContextArray();
      value.forEach((v) => {
        const listing = Object.setPrototypeOf(v, MovieListing.prototype);
        retval.push(listing);
      });
      break;

    case 'movieListings':
      retval = [];
      value.forEach((v) => {
        const listing = Object.setPrototypeOf(v, MovieListing.prototype);
        retval.push(listing);
      });
      break;

    case 'movies':
      retval = buildContextMap(Movie, value);
      break;

    case 'runningTime':
      retval = new Duration(value._milliseconds); // eslint-disable-line no-underscore-dangle
      break;

    case 'showings':
      retval = value.map(showingString => new Showing(showingString));
      break;

    case 'showtime':
      retval = value.map(showtimeString => new Showtime(showtimeString));
      break;

    case 'theaters':
      retval = buildContextMap(Theater, value);
      break;

    default:
      retval = value;
  }

  return retval;
}
