/* global Theater */ // To avoid ciurular import dependencies.
import IdObject from './id-object';
import Movie from './movie';
import context from './context';
import Showing from './showing';
import Showtime from './showtime';

/**
 * The list of show times for a given movie at a given theater.
 *
 * Maps the contents of an HTML element into a more convenient representation.
 */
class MovieListing extends IdObject {
  /**
   * @param {Theater} theater - Theater at which this listing is appearing.
   * @param {HTMLElement} movieListingEl - Movie listing from the web page.
   */
  constructor(theater, movieListingEl) {
    super(theater);

    /**
     * @member {string}
     * @private
     */
    this.movieURL = '';

    /**
     * @member {Showing[]} - List of showtimes for this.movie at this.theater.
     */
    this.showings = [];

    if (typeof movieListingEl !== 'undefined') {
      const moviedataEl = movieListingEl.querySelector('.moviedata');
      this.movieURL = moviedataEl.querySelector('.movietitle a').getAttribute('href');

      if (!context.movies.includes(this.movieURL)) {
        context.movies.set(new Movie(moviedataEl));
      }

      movieListingEl
        .querySelectorAll('.showtimes-list .stDisplay.future, .showtimes-list .showtime-display a')
        .forEach(function addShowing(showtimeEl, index) {
          const newShowing = new Showing(this, showtimeEl);

          if (index > 0) {
            // Does the previous showtime in the list appear to be after this one?
            // If so, then this one is really a showtime for tomorrow.
            const previousShowing = this.showings[this.showings.length - 1];
            if (Showing.compare(previousShowing, newShowing) > 1) {
              newShowing.showtime.addDays(1);
            }
          }
          this.showings.push(newShowing);
        }, this);
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
  get theater() {
    return context.theaters.get(this.parentId);
  }

  /**
   * Get an {@link Array} of {@link Showing} objects that have shoiwtimes after a given time.
   *
   * @param {Showtime} showtime - Earliest time for showngs to be returned.
   *
   * @returns {Showing[]} - Filtered list of showings.
   *
   * @memberof MovieListing
   */
  showingsAfter(showtime) {
    return this.showings
      .filter(showing => (Showtime.compare(showtime, showing.showtime) < 0));
  }

  /**
   * @member {string} id - Unique identifier for this object.
   * @memberof MovieListing
   * @instance
   */
  get id() { return `${this.theater.id},${this.movie.id}`; }
}

export default MovieListing;
