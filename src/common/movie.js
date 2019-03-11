import Duration from 'duration-js';
import context from './context';
import IdObject from './id-object';
import Util from './util';

/*
 * Regular expression to see if the title ends with the current year in parentheses.
 */
const titleExpr = new RegExp(
  `(.+)(\\s+\\(${(new Date()).getFullYear().toString()}\\))`,
);

/**
 * Remove the year in parentheses at the end of the title if it is the current year.
 *
 * Exported for unit testing.
 *
 * @param {string} title - Movie name to be searched.
 *
 * @returns {string} The filtered movie name.
 *
 * @private
 */
export function removeThisYear(title) {
  const result = titleExpr.exec(title);
  return (result ? result[1] : title);
}

/**
 * Information about a movie being shown.
 */
class Movie extends IdObject {
  /**
   * Collect information from an HTMLElement and put it into a more convenient format.
   *
   * @param {HTMLElement} moviedataEl - Element scraped from a web page.
   */
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

    if (typeof moviedataEl !== 'undefined') {
      // Get the element containg both the movie's running time and rating.
      const movieRatingRuntime = Util.innerHTML(
        moviedataEl.querySelector('.movierating-runtime'),
      );

      // Parse the string into meaningful bits.
      const results = movieRatingRuntime.match(/(.+) \|( *(\d+) hr)?( *(\d+) min)?/);
      if (Array.isArray(results)) {
        [, this.rating, , hours, , minutes] = results;
        this.runningTime = new Duration(`${hours || 0}h${minutes || 0}m`);
        this.title = removeThisYear(
          Util.innerHTML(moviedataEl.querySelector('.movietitle a')),
        );
        this.url = moviedataEl.querySelector('.movietitle a').getAttribute('href');
      }

      if (!context.movies.includes(this.id)) {
        context.movies.set(this);
      }
    }
  }

  /**
   * Unique ID for this movie.
   *
   * @readonly
   * @memberof Movie
   */
  get id() { return this.url; }

  /**
   * @member {string} name - Synonym for {@linkcode title}.
   * @memberof Movie
   * @instance
   */
  get name() { return this.title; }

  set name(title) { this.title = title; }

  /**
   * Generate human readable versn of object.
   *
   * @returns {string} - A readable version of this object.
   */
  toString() {
    const [, hours, minutes] = this.runningTime.toString().match(/^(\d+)h(\d+)m$/);
    return `${this.title} - ${hours}:${minutes.padStart(2, '0')} | ${this.rating}`;
  }
}

export default Movie;
