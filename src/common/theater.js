import context from './context';
import MovieListing from './movie-listing';
import Util from './util';

/**
 * A theater containing movie Listings.
 *
 * @param {HTMLElement} theaterEl - Theater listing from the web page.
 */
class Theater {
  constructor(theaterEl) {
    /**  @property {string} name */
    this.name = '';
    /** @property {string} url */
    this.url = '';
    /** @property {string} address */
    this.address = '';
    /** @property {string} phone */
    this.phone = '';
    this._distance = 0;
    this.distanceUnit = '';
    /** @property {MovieListing[]} movieListings */
    this.movieListings = [];

    if (typeof theaterEl !== 'undefined') {
      const nameEl = theaterEl.querySelector('a.theater-name');
      this.name = Util.innerHTML(nameEl);
      this.url = nameEl.href;
      this.address = Util.innerHTML(theaterEl.querySelector('.address a'));
      this.phone = Util.innerHTML(theaterEl.querySelector('.theater-phone'));
      this.distanceString = Util.innerHTML(theaterEl.querySelector('.mileage'));

      context.theaters.set(this.url, this);

      this.movieListings = Array.from(theaterEl.querySelectorAll('.movie-listing'))
        .map(movieListingEl => new MovieListing(movieListingEl, this.url));
    }
  }

  /**
   * Distance of theater from the requested location. It is a string containing both the numrical
   * distance and the units, separated by a space. For example, "6.5 mi.".
   *
   * @param {string} distanceString - a string containing both the numrical distance and the
   *                                  units, separated by a space.
   *
   * @memberof Theater
   */
  set distanceString(distanceString) {
    [this._distance, this.distanceUnit] = distanceString.split(' ');
    this._distance = Number.parseFloat(this._distance, 10);
  }

  /**
   * The numeric distance of the theater from the requested location.
   *
   * @readonly
   * @memberof Theater
   */
  get distance() { return this._distance; }

  get distanceString() { return `${this._distance} ${this.distanceUnit}`; }
}

export default Theater;
