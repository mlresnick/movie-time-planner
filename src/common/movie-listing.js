/* global Theater */ // To avoid ciurular import dependencies.
import Movie from './movie';
import context from './context';
import Showtime from './showtime';

/**
 * The list of show times for a given movie at a given theater.
 *
 * Maps the contents of an HTML element into a more convenient representation.
 *
 * @param {HTMLElement} movieListingEl - Movie listing from the web page.
 * @param {string} theaterURL - Theater at which this listing is appearing.
 */
class MovieListing {
  constructor(movieListingEl, theaterURL) {
    /** @member {string} */
    this.movieURL = '';

    /** @member {Showtime[]} - List of showtimes for this.movie at this.theater. */
    this.showtimes = [];

    /** @member {string} - ID of theater for this list. */
    this.theaterURL = theaterURL || '';

    if (typeof movieListingEl !== 'undefined') {
      const moviedataEl = movieListingEl.querySelector('.moviedata');
      const movieURL = moviedataEl.querySelector('.movietitle a').getAttribute('href');

      if (!context.movies.includes(movieURL)) {
        context.movies.set(movieURL, new Movie(moviedataEl));
      }

      this.movieURL = movieURL;

      this.showtimes = Array.from(movieListingEl
        .querySelectorAll('.showtimes-list .stDisplay.future, .showtimes-list .showtime-display a'))
        .map(showtimeEl => new Showtime(showtimeEl));
      this.showtimes.forEach((showtime, index, showtimes) => {
        // Does the previous showtime in the list appear to be after this one?
        // If so, then it's really a time for tomorrow.
        if ((index > 0) && (Showtime.compare(showtimes[index - 1], showtime) > 1)) {
          // Add a day to the current showtime.
          showtime.addDays(1);
        }
      });

      context.listings.set(null, this);
    }
  }

  /**
   * @member {Movie} - Movie for this listing. It may assigned to either a {@linkcode Movie} or a
   *                   {@linkcode string}. When refrerenced the vallue is always
   *                   a {@linkcode Movie}.
   * @memberof MovieListing
   * @instance
   */
  get movie() { return context.movies.get(this.movieURL); }

  set movie(movieArg) {
    if ((typeof movieArg === 'string') || (movieArg instanceof String)) {
      this.movieURL = movieArg;
    }
    else if (movieArg instanceof Movie) {
      this.movieURL = movieArg.url;
    }
    else {
      throw Error(`Unexpected movie value "${movieArg.constructor.name}"`);
    }
  }

  /**
   * The theater for this movie listing.
   *
   * @type {Theater}
   * @memberof MovieListing
   * @instance
   * @readonly
   */
  get theater() { return context.theaters.get(this.theaterURL); }

  showtimesAfter(timeArg) {
    return this.showtimes
      .filter(showtime => (Showtime.compare(new Showtime(timeArg), showtime) < 0));
  }
}

export default MovieListing;
