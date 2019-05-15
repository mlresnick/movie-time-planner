/* global Theater */ // To avoid ciurular import dependencies.
import IdObject from './id-object.js';
import Movie from './movie.js';
import context from './context.js';
import Showing from './showing.js';
import Showtime from './showtime.js';

/**
 * The list of show times for a given movie at a given theater.
 *
 * Maps the contents of an HTML element into a more convenient representation.
 *
   * @param {Theater} theater - Theater at which this listing is appearing.
   * @param {HTMLElement} movieListingEl - Movie listing from the web page.
   *
   * @extends IdObject
   */
class Listing extends IdObject {
  constructor(theater, movieListingEl) {
    super(theater);

    /**
     * @type {string}
     * @private
     */
    this.movieURL = '';

    /**
     * List of showtimes for this.movie at this.theater.
     *
     * @type {Showing[]}
     */
    this.showings = [];

    if (typeof movieListingEl !== 'undefined') {
      const moviedataEl = movieListingEl.querySelector('.moviedata');
      this.movieURL = moviedataEl.querySelector('.movietitle a').getAttribute('href');

      if (!context.movies.includes(this.movieURL)) {
        context.movies.set(new Movie(moviedataEl));
      }

      movieListingEl
        // Get all showtimes - easier for debugging wiot a debug.now value.
        .querySelector('.showtimes-list')
        .querySelectorAll('.stDisplay, .showtime-display a')
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

      if (!context.listings.includes(this.id)) {
        context.listings.set(this);
      }
    }
  }

  /**
   * Movie for this listing. It may assigned to either a {@link Movie} or a
   *                   {@link string}. When refrerenced the vallue is always
   *                   a {@link Movie}.
   *
   * @type Movie
   * @memberof Listing
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
   * @memberof Listing
   * @instance
   * @readonly
   */
  get theater() {
    return context.theaters.get(this.parentId);
  }

  /**
   * Get an {@link Array} of {@link Showing} objects that have showtimes after a given time.
   *
   * @param {Showtime} showtime - Earliest time for showings to be returned.
   *
   * @returns {Showing[]} - Filtered list of showings.
   *
   * @instance
   * @memberof Listing
   */
  showingsAfter(showtime) {
    return this.showings
      .filter(showing => (Showtime.compare(showtime, showing.showtime) <= 0));
  }

  /**
   * Answers the question "Are there any showings left for this listing?"
   *
   * @param {Showtime} showtime - Earliest time for showings to be returned.
   *
   * @returns {boolean} - `true` if there are any showings left. Otherwise `false`.
   *
   * @instance
   * @memberof Listing
   */
  areShowingsAfter(showtime) { return this.showingsAfter(showtime).length !== 0; }

  /**
   * @member {string} id - Unique identifier for this object.
   * @memberof Listing
   * @instance
   */
  get id() { return `${this.theater.id},${this.movie.id}`; }
}

export default Listing;
