
/**
 * Debugging settings - to enable these values set `enableDebugging` to `true`. Optionally set
 * `nowDate` and `nowTime`.
 *
 * @property {?Object} nowValues - The six values passed to {@link Date}() and
 *           {@link Date} constructors.
 * @property {number[]} nowValues.date - Array of [year, month, date]
 * @property {number[]} nowValues.time - Array of [hours, minutes, seconds, milliseconds]
 * @property {?Date} now - The value created by using the {@link nowVals} property.
 * @property {?boolean} addDumpToArray - If true, a method called dump will be added to the
 *           {@link Array} prototype.
 */
const debug = { };

/*
 * Turn on debugging and optionally set now values.
 */
const enableDebugging = true;
let nowDate = null;
let nowTime = null; // eslint-disable-line prefer-const
// nowDate = [2019, 4, 30];
// nowTime = [23, 59, 0, 0];

if (enableDebugging) {
  debug.autoFillLists = true;
  debug.now = null;

  if (nowDate || nowTime) {
    if (!nowDate) {
      const now = new Date();
      nowDate = [now.getFullYear(), now.getMonth(), now.getDate()];
    }
    const dateArgs = nowDate.concat(nowTime);
    debug.now = new Date(...dateArgs);
  }

  // eslint-disable jsdoc/check-examples
  /**
   * Within a chain of calls, dump the array in its current state.
   *
   * <em>This method is onooy available if {@link debug}.addDumpToArray
   * is `true`.</em>
   *
   * <strong>This method should not be in production code.</strong>
   *
   * @param {string} texts - One or more text arguments to be written to the console before the
   *        current version of the array is written.
   *
   * @returns {Array} - `this`
   *
   * @example
   * const result = ['a', 2, 'iii']
   *   .dump('before map')              // Look at info before the map...
   *   .map(entry => `mapped ${entry}`)
   *   .dump('after map');              // ... and again after.
   * //
   * // Result:
   * //   before map ["a", 2, "iii"]
   * //   after map ["mapped a", "mapped 2", "mapped iii"]
   * //
   *
   * @memberof Array
   */
  // eslint-enable jsdoc/check-examples
  // eslint-disable-next-line no-extend-native
  Array.prototype.dump = function arrayDump(...texts) {
    // eslint-disable-next-line no-console
    console.log.apply(
      console,
      [...texts, `array[${this.length}])=${JSON.stringify(this, null, 2)}`]
    );
    return this;
  };
}

export default debug;
