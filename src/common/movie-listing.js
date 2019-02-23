/* global Theater */ // To avoid ciurular import dependencies.
import Movie from './movie';
import Showtime from './showtime';
import context from './context';

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
    this.movieURL = '';
    this.showtimes = [];
    this.theaterURL = theaterURL || '';
    if (typeof movieListingEl !== 'undefined') {
      const moviedataEl = movieListingEl.querySelector('.moviedata');
      const movieURL = moviedataEl.querySelector('.movietitle a').getAttribute('href');


      if (!context.movies.includes(movieURL)) {
        context.movies.set(movieURL, new Movie(moviedataEl));
      }

      this.movieURL = movieURL;
      // DEBUG
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
   * Set the movie for this listing.
   *
   * @param {(Movie|string)} movieArg - Either a Movie object to be stored, or a string
   *                                    containing the URL for the movie.
   */
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

  /** @type {Movie} */
  get movie() {
    return context.movies.get(this.movieURL);
  }


  /**
   * The theater for this movie listing.
   *
   * @type {Theater}
   * @instance
   * @readonly
   * @memberof MovieListing
   */
  get theater() {
    return context.theaters.get(this.theaterURL);
  }
}

export default MovieListing;
