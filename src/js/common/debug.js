/**
 * DEBUG
 *
 * @member {Object} debug
 * @property {?Object} nowValues - The six values passed to {@link Date}() and
 *           {@link Date} constructors.
 * @property {number[]} nowValues.date - Array of [year, month, date]
 * @property {number[]} nowValues.time - Array of [hours, minutes, seconds, milliseconds]
 * @property {?Date} now - The value created by using the {@link nowVals} property.
 * @property {?booleann} addDumpToArray - If true, a method called dump will be added to the
 *           {@link Array} prototype.
 */
// Comment out what is not to be used.
const debug = {
  // nowValues: {
  //   // date: [2019, 2, 11], // If commented out, today's dated will be used.
  //   time: [12, 0, 0, 0],
  // },
  // autoFillLists: true,
  // addDumpToArray: true,
};

if (debug.addDumpToArray) {
  // eslint-disable jsdoc/check-examples
  /**
   * Within a chain of calls, dump the array in its current state.
   *
   * <em>This method is onooy available if <code>{@link debug}.addDumpToArray</code>
   * is <code>true</code>.</em>
   *
   * <strong>This method should not be in production code.</strong>
   *
   * @param {string} texts - One or more text arguments to be written to the console before the
   *        current version of the array is written.
   *
   * @returns {Array} - <code>this</code>
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

if (debug.nowValues) {
  let nowDate = debug.nowVals.date;
  if (!nowDate) {
    const now = new Date();
    nowDate = [now.getFullYear(), now.getMonth(), now.getDate()];
  }
  [].concat();
  debug.now = new Date(...nowDate.concat(debug.nowVals.time));
}

export default debug;
