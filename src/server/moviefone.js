import { fetch } from 'cross-fetch';
import jsdom from 'jsdom';
import context from '../common/context';
import Theater from '../common/theater';
import Util from '../common/util';

const { JSDOM } = jsdom;

/**
 * Fetch a web page from moviefone.com and scrape it for listings.
 *
 * @param {string} location    - may be a zip code or address of the location to search for movie
 *                               listings.
 * @param {number} maxDistance - radius from the center of <kbd>location</kbd>, in miles, to
 *                               search.
 */
class Moviefone {
  constructor(location, maxDistance) {
    /** @member {string} location - see constructor doc. */
    this.location = location;
    /** @member {number} maxDistance - see constructor doc. */
    this.maxDistance = (typeof maxDistance !== 'undefined') ? maxDistance : 10;
  }

  /**
   * Perform the actual fetch.
   *
   * @param {string} [location] -    see constructor doc.  If provided, it overrides the value given
   *                                 to the constructor.
   * @param {number} [maxDistance] - see constructor doc.  If provided, it overrides the value given
   *                                 to the constructor.
   *
   * @returns {context} Object containing all of the fetched information.
   *
   * @memberof Moviefone
   */
  async collectListings(location, maxDistance) {
    context.clear();

    if (typeof location !== 'undefined') {
      this.location = location;
    }
    if (typeof maxDistance !== 'undefined') {
      this.maxDistance = maxDistance;
    }
    let done = false;
    const url = `https://www.moviefone.com/set-location/?location=${this.location}`;
    let page = 1;
    let theatersOnPage;
    let filteredTheaters;
    // const theaters = [];
    let response;
    let baseURL;
    const initialRequestOpts = { redirect: 'manual' };
    try {
      response = await fetch(url, initialRequestOpts);
      // Is it a redirect?
      if (response.status === 302) {
        response = await fetch(response.headers.get('location'), initialRequestOpts);
        if (response.status === 301) {
          baseURL = response.headers.get('location');
        }
      }

      /* eslint-disable no-await-in-loop */
      while (!done) {
        response = await fetch(`${baseURL}?page=${page}`);
        // TODO error checking
        const text = await response.text();
        const doc = await new JSDOM(text).window.document;

        if (!context.requestedDate) {
          const requestedDateString = doc
            .querySelector('#date-display .controls-date')
            .lastChild
            .textContent
            .trim()
            .replace(/\s+/g, ' ');
          context.requestedDate = new Date(requestedDateString);
        }

        // Each object parses their own bit of the page.
        theatersOnPage = Array.from(doc.querySelectorAll('.theater'))
          .map(theaterEl => new Theater(theaterEl));

        filteredTheaters = theatersOnPage
          .filter(theater => (theater.distance <= this.maxDistance));

        // Create the list of theaters in the context object.
        filteredTheaters.forEach((theater) => {
          context.theaters.set(theater.url, theater);
        });

        page += 1;
        done = (theatersOnPage.length !== filteredTheaters.length);
      }
      /* eslint-enable no-await-in-loop */
    }
    catch (err) {
      Util.logError(`Exception caught in Moviefone.collectListings\n${err}\n${err.stack}`);
    }
    return context; // TODO remove this and make sure calling function uses the context singleton
  }

  toString() {
    return JSON.stringify({
      location: this.location,
      maxDistance: this.maxDistance,
    });
  }
}
export default Moviefone;
