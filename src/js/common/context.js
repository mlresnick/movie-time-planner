import IdObject from './id-object.js';

/**
 * Augmented  {@link Map} class.
 *
 * @param {*} [iterable] - Argument for the {@link Map} constructor.
 */
export class ContextMap extends Map {
  /**
   * Convenience method. A synonym for {@link Map}#has.
   *
   * @param {*} key - The key of the element to test for presence in the {@link Map} object.
   *
   * @returns {boolean} Returns `true` if an element with the specified key exists in
   *                    the {@link Map} object; otherwise `false`.
   */
  includes(key) { return this.has(key); }

  /**
   * This method adds an element with a specified `key` and `value` to a {@link Map} object. If the
   * key is already in the {@link Map}, this method does nothing.
   *
   * @param {...*} args - If
   *                        * two arguments are passed in, they are treated as a `key`-`value` pair.
   *                        * one argument is passed in, it is treated as an {@link IdObject}. The
   *                          key will be set to the `id` member of the object.
   *
   * @returns {ContextMap} The modified `ContextMap` object.
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
   * Function dfefinition for callbacvk used by the {@link ContextMap}#some method.
   *
   * @callback someCallback
   *
   * @param {*}      element   - The current element being processed in the array.
   * @param {number} [index]   - The index of the current element being processed in the array.
   * @param {Array<*>}    [array]   - The array `some()` was called upon.
   * @param {Object} [thisArg] - Value to use as `this` when executing `callback`.
   */

  /**
   * Tests whether at least one value in the map passes the test implemented by the
   * provided function. See the {@link Array}#some documentation.
   *
   * @param {Context~someCallback} callback  - See the {@link Array}#some documentation.
   * @param {Object}               [thisArg] - Object to use for `this` when
   *                                           executing `someCallback`.
   *
   * @returns {boolean} - `true` if the callback function returns a truthy value for any
   *          array element; otherwise, `false`.
   */
  some(callback, thisArg) { return Array.from(this.values()).some(callback, thisArg); }

  /**
   * Called by {@link JSON}.stringify to serialize the this object.
   *
   * @returns {Array<*>} - The result of the {@link Map}#entries call, as an array.
   */
  toJSON() { return Array.from(this.entries()); }
}

/**
 * Because this is an array, use the older style of inheritance.
 * AND set the new array object to inherit from the ContextArray class.
 *
 * @param  {...*} args - Either a list of elements or an array length.
 *
 * @returns {ContextArray} - Newly allocated object.
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
   *
   * @returns {ContextArray} The object to which the new value was added.
   *
   * @memberof ContextArray
   * @instance
   */
  contextArray.set = function setImpl(key, value) { this.push(value); };
  return contextArray;
}

/**
 * A singleton object used by various parts of the applicaton.
 *
 * @class
 */
class Context {
  constructor() {
    if (!Context.instance) {
      /**
       * Time durations used to calculatetime needed between movies.
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
       * Movie listings found for the requested theaters and movies. It is an array of
       * {@link Listing} objects.
       *
       * @type {ContextMap<string, Listing>}
       */
      this.listings = new ContextMap();

      /**
       * All movies in the requested area.
       *
       * @type {ContextMap<string, Movie>}
       */
      this.movies = new ContextMap();

      /**
       * Requested date of listings.
       *
       * @type {Date}
       */
      this.requestedDate = undefined;

      /**
       * Sets containing IDs of items that still have remaining showings.
       *
       * @property {Set} listingIds - Listings that still have showings left.
       * @property {Set} movieIds - Movies that still have showings left.
       * @property {Set} theaterIds - Theaters that still have showings left.
       * @property {function} clear - Cleanup contents.
       */
      this.remaining = {
        listingIds: new Set(),
        movieIds: new Set(),
        theaterIds: new Set(),
        clear() {
          ['listingIds', 'movieIds', 'theaterIds'].forEach(property => this[property].clear());
        },
      };

      /**
       * List of theaters requested. A theater's URL is used as the key with a value of a
       * {@link Theater} object.
       *
       * @type {ContextMap<string, Theater>}
       */
      this.theaters = new ContextMap();

      /**
        * The singleton object itself.
        *
        * @type {Context}
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

/**
 * Global singleton context object.
 *
 * @type {Context}
 */
const context = new Context();

export default context;
