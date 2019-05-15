
/**
 * Debug settings - to enable these values set <kbd>debug.enableDebugging</kbd> to
 * <kbd>true</kbd>.
 *
 * <kbd>debug.nowDate</kbd> and <kbd>debug.nowTime</kbd> are input properties.
 * <kbd>debug.now</kbd> is an output property.
 *
 * The <kbd>dump</kbd> method will be added to the {@link Array} prototype when debugging is
 * turned on.
 *
 * @property {boolean} enableDebugging - If <kbd>true</kbd> the other properties in this object
 *           will be used during execution.
 * @property {Array<number>} nowDate - Array of [year, month, date]. Set this to force the date used
 *           for "now" to a specific value.
 * @property {Array<number>} nowTime - Array of [hours, minutes, seconds, milliseconds]. Set this to
 *           force the time used for "now" to a specific value.
 * @property {?Date} now - The value created by using the <kbd>nowDate</kbd> and
 *           <kbd>nowTime</kbd> properties as arguments to the {@link Date} constructor.
 */
const debug = { };

debug.enableDebugging = true;
debug.nowDate = null;
debug.nowTime = null;
// debug.nowDate = [2019, 4, 30];
// debug.nowTime = [23, 59, 0, 0];

if (debug.enableDebugging) {
  debug.now = null;

  if (debug.nowDate || debug.nowTime) {
    if (!debug.nowDate) {
      const now = new Date();
      debug.nowDate = [now.getFullYear(), now.getMonth(), now.getDate()];
    }
    const dateArgs = debug.nowDate.concat(debug.nowTime);
    debug.now = new Date(...dateArgs);
  }

  // eslint-disable jsdoc/check-examples
  /**
   * Within a chain of calls, dump the array in its current state.
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
   * @memberof debug
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
