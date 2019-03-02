import context from './context';
import Movie from './movie';
import Theater from './theater';
/**
 * The specific time of a movie at a theater.
 *
 * @param {string} theaterURL
 * @param  {string} movieURL
 * @param {Showtime} showtime
 * @class Showing
 */
class Showing {
  constructor(theaterURL, movieURL, showtime) {
    /**
     * @member {string}
     * @private
     */
    this.theaterURL = theaterURL;

    /**
     * @member {string}
     * @private
     */
    this.movieURL = movieURL;

    /** @member {Showtime} */
    this.showtime = showtime;
  }

  /**
   * @member {Movie}
   * @memberof Showing
   * @readonly
   */
  get movie() { return context.movies.get(this.movieURL); }

  /**
   * @member {Theater}
   * @memberof Showing
   * @readonly
   */
  get theater() { return context.theaters.get(this.theaterURL); }
}

export default Showing;
