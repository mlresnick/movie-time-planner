/* global Movie,MovieListing,Theater */
import context from './context';
import IdObject from './id-object';
import Showtime from './showtime';

/**
 * The specific time for a movie at a given theater.
 */
class Showing extends IdObject {
  /**
   * @param {MovieListing} listing - The movie listing of which this is a part.
   * @param {HTMLElement} showtimeEl - The element containing the time of the showing.
   */
  constructor(listing, showtimeEl) {
    if (!listing) {
      throw new Error('listing argument is required for Showing constructor');
    }

    if (!showtimeEl) {
      throw new Error('showing argument is required for Showing constructor');
    }

    super(listing);

    /**
     * @member {Showtime} showtime - When the movie is being shown.
     * @memberof Showing
     * @instance
     */
    this.showtime = new Showtime(showtimeEl);
  }

  /**
   * Compare two showing objects for sorting.
   *
   * @param {Showing} lhs - Left hand side of comparison.
   * @param {Showing} rhs - Right hand side of comparison.
   *
   * @returns {number} A negative value if <kbd>lhs</kbd> collates before <kbd>rhs</kbd>. A
   *                   positive value if <kbd>lhs</kbd> collates after <kbd>rhs</kbd>. 0 if the
   *                   two values are equal.
   */
  static compare(lhs, rhs) { return Showtime.compare(lhs.showtime, rhs.showtime); }

  /**
   * @member {string} id - Unique identifier for this object.
   * @memberof Showing
   * @instance
   * @readonly
   */
  get id() { return `${this.parentId},${this.showtime.toISOString()}`; }

  /**
   * @member {MovieListing} listing - Listing under which this showing appears.
   * @memberof Showing
   * @instance
   * @readonly
   */
  get listing() { return context.listings.get(this.parentId); }

  /**
   * @member {Movie}
   * @memberof Showing
   * @instance
   * @readonly
   */
  get movie() { return this.listing.movie; }

  /**
   * @member {Theater}
   * @memberof Showing
   * @instance
   * @readonly
   */
  get theater() { return this.listing.theater; }

  /**
   * Standard toDString.
   *
   * @returns {string} A readable version of this object.
   */
  toString() {
    return `'${this.theater.name}' showing '${this.movie.name}' at ${this.showtime.toISOString()}`;
  }
}

export default Showing;
