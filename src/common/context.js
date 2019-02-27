/**
 * Augmented  {@link https://devdocs.io/javascript/global_objects/map Map} class.
 */
export class ContextMap extends Map {
  /**
   * @constructor
   * @param {*} [iterable] - Arguments for the
   *                         {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Syntax Map class constructor}.
   */
  // constructor(iterable) { super(iterable); } // eslint-disable-line no-useless-constructor

  /**
   * Convenience method. A synonym for {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has Map#has}.
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
   * @param {*} key - The key of the element to add to the <code>Map</code> object.
   * @param {*} value - The value of the element to add to the <code>Map</code> object.
   *
   * @returns {ContextMap} The <code>ContextMap</code> object.
   */
  set(key, value) {
    if (!this.has(key)) {
      super.set(key, value);
    }
    return this;
  }


  /**
   * Called by {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify JSON.stringify} to serialize the this object.
   *
   * @returns {Array<*>} - The result of the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries Map.entries} call, as an array.
   */
  toJSON() { return Array.from(this.entries()); }
}

/**
 * @class
 *
 * Because this is an array, use the older style of inheritance.
 * AND set the new array object to inherit from the ContextArray class.
 *
 * @param  {...any} args - Either a list of elements or an array length.
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
  constructor() {
    if (!Context.instance) {
      /**
       *  @member  {ContextMap} - List of movies requested. The movie's URL is the key. A
       *                          {@link Movie} object is the value.
       */
      this.movies = new ContextMap();

      /**
       * @member {ContextArray} - Movie listings found for the requested theaters and movies. It is
       *                          an array of {@link Listing} objects.
       */
      this.listings = new ContextArray();

      /**
       * @member {ContextMap} - List of theaters requested. A theater's URL is used as the key
       *                        with a value of a {@link Theater} object.
       */
      this.theaters = new ContextMap();

      /** @member {Date} - Requested date of listings. */
      this.requestedDate = new Date();
      console.log(`this.requestedDate.toString()=${this.requestedDate.toString()}`);

      /**
       * @member {Object} - Time durations used to calculatetime needed between movies.
       *
       * @property {integer} durations.preview  - Expected length of movie previews.
       * @property {integer} durations.entrance - Expected time it takes to geet from car to
       *                                          auditorium.
       * @property {integer} durations.exit     - Expected time it taqkes to get from auditorium
       *                                          to car.
       */
      this.durations = {
        preview: 20,
        entrance: 5,
        exit: 5,
      };

      // DEBUG
      this.debug = {
        showtimeFilterOff: false,
        // showtimeFilterOff: true,
      };

      Context.instance = this;
    }

    return Context.instance;
  }

  /** Empty the singleton of its values. */
  clear() {
    this.movies.clear();
    this.theaters.clear();
    this.listings.length = 0;
    this.requestedDate = null;
  }
}

const context = new Context();

export default context;
