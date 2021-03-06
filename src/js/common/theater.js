import context from './context.js';
import Listing from './listing.js';
import Util from './util.js';
import IdObject from './id-object.js';

/**
 * A theater containing movie Listings.
 *
 * @class
 */
class Theater extends IdObject {
  /**
   * Creates an instance of Theater.
   *
   * @param {HTMLElement} theaterEl - Web page element for a theater and the movies shown there.
   *
   * @memberof Theater
   */
  constructor(theaterEl) {
    super();

    /** @member {string} */
    this.name = '';

    /** @member {string} */
    this.url = '';

    /** @member {string} */
    this.address = '';

    /** @member {string} */
    this.phone = '';

    this._distance = 0;
    this.distanceUnit = '';

    /** @member {Listing[]} */
    this.movieListings = [];

    if (typeof theaterEl !== 'undefined') {
      const nameEl = theaterEl.querySelector('a.theater-name');
      this.name = Util.innerHTML(nameEl);
      this.url = nameEl.href;
      this.address = Util.innerHTML(theaterEl.querySelector('.address a'));
      this.phone = Util.innerHTML(theaterEl.querySelector('.theater-phone'));
      this.distanceString = Util.innerHTML(theaterEl.querySelector('.mileage'));

      context.theaters.set(this);

      const self = this;
      theaterEl
        .querySelectorAll('.showtimes .movie-listing')
        .forEach((movieListingEl) => {
          const listing = new Listing(self, movieListingEl);
          self.movieListings.push(listing.id);
        });
    }
  }

  /**
   * @member {number} distance - The numeric distance of the theater from the requested location.
   * @memberof Theater
   * @instance
   * @readonly
   */
  get distance() { return this._distance; }

  /**
   * @member {string} distanceString - Distance of theater from the requested location. It is a
   *                                   string containing both the numrical distance and the units,
   *                                   separated by a space. For example, "6.5 mi.".
   * @memberof Theater
   * @instance
   */
  get distanceString() { return `${this._distance} ${this.distanceUnit}`; }

  set distanceString(distanceString) {
    [this._distance, this.distanceUnit] = distanceString.split(' ');
    this._distance = Number.parseFloat(this._distance, 10);
  }

  /**
   * Text to be displayed as a list item footer in the Theaters tab.
   *
   * @type {string}
   * @readonly
   * @memberof Movie
   */
  get footer() { return `${this.distanceString} | ${this.phone}<br>${this.address}`; }
}

export default Theater;
