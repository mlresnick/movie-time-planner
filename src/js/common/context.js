import IdObject from './id-object';

/**
 * Augmented  {@link https://devdocs.io/javascript/global_objects/map Map} class.
 */
export class ContextMap extends Map {
  /**
   * @constructor
   * @param {*} [iterable] - Arguments for the
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Syntax Map class constructor}.
   */

  /**
   * Convenience method. A synonym for
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has Map#has}.
   *
   * @param {*} key - The key of the element to test for presence in the <code>Map</code> object.
   *
   * @returns {boolean} Returns <code>true</code> if an element with the specified key exists in
   *                    the <code>Map</code> object; otherwise <code>false</code>.
   */
  includes(key) { return this.has(key); }

  /**
   * The <code>set()</code> method adds an element with a specified <code>key</code> and value to a
   * <code>Map</code> object. If the key is already in the <code>Map</code>, this method does
   * nothing.
   *
   * @param {...*} args - If two arguments are passed in, they are treated as a
   *               <code>key</code>-<code>value</code> pair. If one argument is passed in, it is
   *               treated as an {@link IdObject}. The key will be set to the <code>id</code> member
   *               of the object.
   *
   * @returns {ContextMap} The <code>ContextMap</code> object.
   */
  set(...args) {
    let key;
    let value;

    if ((args.length === 1) && (args[0] instanceof IdObject)) {
      [value] = args;
      key = value.id;
    }
    else {
      [key, value] = args;
    }

    if (!this.has(key)) {
      super.set(key, value);
    }
    return this;
  }

  /**
   * Tests whether at least one value in the map passes the test implemented by the
   * provided function.
   *
   * @param {ContextMap~someCallback} callback - See the Array#some documentation.
   * @param {Object} [thisArg] - Object to use for <code>this</code> when
   *        executing <code>someCallback</code>.
   *
   * @returns {boolean} - <code>true</code> if the callback function returns a truthy value for any
   *          array element; otherwise, <code>false</code>.
   *
   * @memberof ContextMap
   */
  some(callback, thisArg) {
    const e1 = Array.from(this.values());
    const e2 = e1;
    // .map((entry) => {
    //   const retval = entry[1];
    //   return retval;
    // });
    const retval = e2.some(callback, thisArg);
    return retval;
    // return Array.from(this.entries())
    //   .map(entry => entry[1])
    //   .some(callback, thisArg);
  }

  /**
   * See the Array#some documentation.
   *
   * @callback ContextMap~someCallback
   *
   * @param {*} element - The current element being processed in the array.
   * @param {integer} [index] - The index of the current element being processed in the array.
   * @param {Array} [array] - The array some() was called upon.
   */

  /**
   * Called by {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify JSON.stringify} to serialize the this object.
   *
   * @returns {Array<*>} - The result of the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries Map.entries} call, as an array.
   */
  toJSON() { return Array.from(this.entries()); }
}

/**
 * Because this is an array, use the older style of inheritance.
 * AND set the new array object to inherit from the ContextArray class.
 *
 * @param  {...any} args - Either a list of elements or an array length.
 *
 * @class
 */
export function ContextArray(...args) {
  let contextArray = Object.create(Array.prototype);
  contextArray = (Array.apply(contextArray, ...args) || contextArray);

  /**
   * @function set
   * @param {*} key   - Ignored.
   * @param {*} value - Value appended to the end of the array.
   * @returns {ContextArray} The object to which the new value was added.
   * @memberof ContextArray
   * @instance
   */
  contextArray.set = function setImpl(key, value) { this.push(value); };
  return contextArray;
}

/**
 * A singleton object used by various parts of the applicaton.
 */
class Context {
  /**
   * @private
   * @memberof Context
   */
  constructor() {
    if (!Context.instance) {
      /**
       * @member {Object} - Time durations used to calculatetime needed between movies.
       *
       * @property {integer} entrance - Expected time it takes to geet from car to auditorium.
       * @property {integer} preview  - Expected length of movie previews.
       * @property {integer} exit     - Expected time it taqkes to get from auditorium
       */
      this.durations = {
        entrance: 5,
        preview: 20,
        exit: 5,
      };

      /**
       * @member {ContextMap<string, Listing>} - Movie listings found for the requested
       *                                              theaters and movies. It is an array of
       *                                              {@link Listing} objects.
       */
      this.listings = new ContextMap();

      /**
       * @member {ContextMap<string, Movie>} - All movies in the requested area.
       */
      this.movies = new ContextMap();

      /**
       * @member {Date} - Requested date of listings.
       */
      this.requestedDate = undefined;

      /**
       * @member {Object} - Sets containing IDs of items that still hve remaining showings.
       * @property {Set} listingIds - Listings that still have showings left.
       * @property {Set} movieIds - Movies that still have showings left.
       * @property {Set} theaterIds - Theaters that still have showings left.
       */
      this.remaining = {
        listingIds: new Set(),
        movieIds: new Set(),
        theaterIds: new Set(),
        /**
         * Clean up contents.
         *
         * @memberof Context#remaining
         */
        clear() {
          ['listingIds', 'movieIds', 'theaterIds']
            .forEach(property => this[property].clear());
        },
      };

      /**
       * @member {ContextMap<string, Theater>} - List of theaters requested. A theater's URL is used
       *                                         as the key with a value of a {@link Theater}
       *                                         object.
       */
      this.theaters = new ContextMap();

      /**
        * @member {Context} - The singleton object itself.
        * @private
        */
      Context.instance = this;
    }

    return Context.instance;
  }

  /** Empty the singleton of its values. */
  clear() {
    ['movies', 'theaters', 'listings', 'remaining']
      .forEach(property => this[property].clear());
  }
}

const context = new Context();

export default context;