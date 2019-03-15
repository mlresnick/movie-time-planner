/**
 * DEBUG
 *
 * @member {Object} debug
 * @property {?boolean} showtimeFilterOff - If falsey , only showtimes after now will be
 *           inclouded in the results, otherewise all showtimes for a film will be incuded.
 * @property {?Object} nowVals - The six values passed to {@link Date}() and
 *           {@link Date} constructors.
 * @property {number[]} nowVals.date - Array of [year, month, date]
 * @property {number[]} nowVals.time - Array of [hours, minutes, seconds, milliseconds]
 * @property {?Date} now - The value created by using the {@link nowVals} property.
 */
// Comment out what is not to be used.
const debug = {
  // showtimeFilterOff: true,
  nowVals: {
    // date: [2019, 2, 11],
    time: [22, 0, 0, 0],
  },
  // autoFillLists: true,
};
if (debug.nowVals) {
  let nowDate = debug.nowVals.date;
  if (!nowDate) {
    const now = new Date();
    nowDate = [now.getFullYear(), now.getMonth(), now.getDate()];
  }
  [].concat();
  debug.now = new Date(...nowDate.concat(debug.nowVals.time));
}

export default debug;
