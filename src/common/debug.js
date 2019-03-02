/**
 * DEBUG
 *
 * @member {Object} debug
 * @property {?boolean} showtimeFilterOff - If falsey , only showtimes after now will be
 *           inclouded in the results, otherewise all showtimes for a film will be incuded.
 * @property {?number[]} nowVals - The six values passed to {@link Date}() and
 *           {@link Date} constructors.
 * @property {?Date} now - The value created by using the {@link nowVals} property.
 *
 * @memberof Context
 * @instance
 */
// Comment out what is not to be used.
const debug = {
  // showtimeFilterOff: true,
  // nowVals: [2019, 2, 2, 0, 0, 0, 0],
  // autoFillLists: true,
  // requestedDate: new Date(2019, 2, 2),
};
if (debug.nowVals) {
  debug.now = new Date(...debug.nowVals);
}

export default debug;
