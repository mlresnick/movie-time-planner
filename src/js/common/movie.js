import context from './context.js';
import Duration from './duration.js';
import IdObject from './id-object.js';
import Util from './util.js';

// Regular expression to see if the title ends with the current year in parentheses.
const titleExpr = new RegExp(
  `(.+)(\\s+\\(${(new Date()).getFullYear().toString()}\\))`,
);

/**
 * Information about a movie being shown.
 *
 * @param {HTMLElement} moviedataEl - Element scraped from a web page.
 */
class Movie extends IdObject {
  constructor(moviedataEl) {
    super(null);

    /** @member {string} - MPAA rating. */
    this.rating = '';

    /** @member {Duration} - Length of movie in minutes */
    this.runningTime = new Duration(0);

    /** @member {string} - Name of them movie. */
    this.title = '';

    /** @member {string} - Unique identifier for this movie. */
    this.url = '';

    let hours;
    let minutes;
    let fullMatch;

    if (typeof moviedataEl !== 'undefined') {
      // Get the element containg both the movie's running time and rating.
      const movieRatingRuntime = Util.innerHTML(
        moviedataEl.querySelector('.movierating-runtime'),
      );

      // Parse the string into meaningful bits.
      const results = movieRatingRuntime.match(/^(.*) \| (\d+) hr (\d+) min$/);
      if (Array.isArray(results)) {
        [fullMatch, this.rating, hours, minutes] = results;
        if (fullMatch) {
          this.runningTime = new Duration(`${hours || 0}h${minutes || 0}m`);
        }
      }
      else {
        this.rating = movieRatingRuntime;
      }

      this.title = Movie.removeThisYear(
        Util.innerHTML(moviedataEl.querySelector('.movietitle a')),
      );
      this.url = moviedataEl.querySelector('.movietitle a').getAttribute('href');

      if (!context.movies.includes(this.id)) {
        context.movies.set(this);
      }
    }
  }

  /**
   * Remove the year in parentheses at the end of the title if it is the current year.
   *
   * @param {string} title - Movie name to be searched.
   *
   * @returns {string} The filtered movie name.
   *
   * @memberof Movie
   *
   * @private
   */
  static removeThisYear(title) {
    const result = titleExpr.exec(title);
    return (result ? result[1] : title);
  }

  /**
   * Unique ID for this movie.
   *
   * @readonly
   * @memberof Movie
   */
  get id() { return this.url; }

  /**
   * Synonym for {@linkcode title}.
   *
   * @type {string}
   * @memberof Movie
   * @instance
   */
  get name() { return this.title; }

  /**
   * Text to be displayed as a list item footer in the Movies tab.
   *
   * @type {string}
   * @readonly
   * @memberof Movie
   */
  get footer() { return `${this.rating} | ${this.runningTimeString}`; }

  get runningTimeString() {
    const { hours, minutes } = this.runningTime;
    return `${hours ? `${hours} hr ` : ''}${minutes} min`;
  }

  toString() {
    const [, hours, minutes] = this.runningTime.toString().match(/^(\d+)h(\d+)m$/);
    return `${this.title} - ${hours}:${minutes.padStart(2, '0')} | ${this.rating}`;
  }
}

export default Movie;
