import debug from './debug';
import context, { ContextMap } from './context';
import Util from './util';

/**
 * The time and date of a single movie showing.
 */
class Showtime {
  /**
   * @param  {...*} args - If this is an {@linkcode HTMLElement} it is a node containing the
   *                       showtime as a string. Otherwise, it may be any set of arguments passed
   *                       to the JavaScript {@linkcode Date} constructor.
   *
   *                       <p>The seconds and milliseconds arguments are ignored. Those values are
   *                       set to 0.</p>
   */
  constructor(...args) {
    /** @member {Date} - The date and time of the showing. */
    this.date = null;
    let superArgs;
    const { requestedDate } = context;

    if ((args.length === 1)
        && (typeof args[0] === 'object')
        && (typeof args[0].constructor !== 'undefined')
        && /HTML.*Element/.test(args[0].constructor.name)) {
      const showtimeEl = args[0];
      const showtimeRE = /^(\d?\d):(\d\d)((a|p)m)$/;
      const timeString = Util.innerHTML(showtimeEl);
      if (!showtimeRE.test(timeString)) {
        const e = `Invalid showtime value "${timeString}"`;
        throw e;
      }
      const [, hoursStr, minutesStr, period] = showtimeRE.exec(timeString);
      let hours = Number.parseInt(hoursStr, 10);
      const minutes = Number.parseInt(minutesStr, 10);
      if ((period === 'pm') && (hours !== 12)) {
        hours = (hours + 12) % 24;
      }

      superArgs = [
        requestedDate.getFullYear(),
        requestedDate.getMonth(),
        requestedDate.getDate(),
        hours,
        minutes,
      ];
    }
    else {
      superArgs = Array.from(args);
    }

    this.date = new Date(...superArgs);
    this.date.setSeconds(0, 0);
  }

  /**
   * @summary Translates the internal format to an ISO 8601 formatted string for the GMT timezone.
   *
   * @returns {string} A string in the form "yyyy-mm-ddTmm:hh:ssZ".
   */
  toISOString() {
    return this.date.toISOString();
  }

  /**
   * Current time (encapsulates debug code).
   *
   * @returns {Date} - Either the current time or the time defined in debug.now.
   *
   */
  static now() {
    return (debug.now ? new Showtime(debug.now) : new Showtime());
  }


  /**
   * Get an ISO formatted datetime for the current timezone.
   */
  toLocalISOString() {
    const pad = num => num.toString().padStart(2, '0');

    const adjustedDate = new Date(this.date);
    const timezoneOffset = this.date.getTimezoneOffset();
    let timezone = '';

    adjustedDate.setMinutes(adjustedDate.getMinutes() - timezoneOffset);

    if (timezoneOffset === 0) {
      timezone = 'Z';
    }
    else {
      const sign = timezoneOffset < 0 ? '+' : '-';
      const tzo = Math.abs(timezoneOffset);
      const tzh = Math.floor(tzo / 60);
      const tzm = tzo % 60;
      timezone = `${sign}${pad(tzh)}:${pad(tzm)}`;
    }

    return adjustedDate.toISOString().replace('Z', timezone);
  }

  /**
   * An alias to <kbd>toISOString()</kbd>. This method is called by JSON.stringify.
   *
   * @returns {string} A string in the form "yyyy-mm-ddTmm:hh:ss".
   */
  toJSON() {
    return this.toLocalISOString();
  }

  /**
   * Compare two showtime objects for sorting.
   *
   * @param {Showtime} lhs - Left hand side of comparison.
   * @param {Showtime} rhs - Right hand side of comparison.
   *
   * @returns {number} A negative value if <kbd>lhs</kbd> collates before <kbd>rhs</kbd>. A
   *                   positive value if <kbd>lhs</kbd> collates after <kbd>rhs</kbd>. 0 if the
   *                   two values are equal.
   */
  static compare(lhs, rhs) { return Math.sign(lhs.date - rhs.date); }

  toString() {
    let period = 'am';

    const minutes = this.date.getMinutes().toString().padStart(2, '0');

    let hours = this.date.getHours();
    if (hours === 24) {
      hours = 0;
    }
    else if (hours >= 12) {
      period = 'pm';
      if (hours > 12) {
        hours -= 12;
      }
    }

    return `${hours}:${minutes}${period}`;
  }

  valueOf() { return this.date.valueOf(); }

  // TODO allow decimals in distance field

  /**
  * Sort and expand the showtimes in context.listing. The "expansion" is performed by taking the
  * list of times in a MovieListing and creating a separate listing for each showtime.
  *
  * @param {Object}     selected          - List of selected theaters and movies.
  * @param {ContextMap} selected.movies   - Map (string => {@link Movie}) of the movies selected by
  *                                         the user.
  * @param {ContextMap} selected.theaters - Map (string => {@link Theater}) of the theaters
  *                                         selected by the user.
  *
  * @returns {Showtime[]} A list of showtimes n the form of a movie llisting object.
  */
  static getSortedShowings(selected) {
    const now = this.now();

    const showtimes = context.listings
    // Is it a movie in a theater that were both selected?
      .filter(listing => selected.movies.has(listing.movieURL)
      && selected.theaters.has(listing.theaterURL)
      // Is there at least one showing left?
      && listing.showtimes.length
      && (Showtime.compare(now, listing.showtimes[listing.showtimes.length - 1]) <= 0))
      .reduce((showings, listing) => {
        // Look at the showtimes for each listing. For each showtime after
        // 'now', add a separate entry to the accumulator.
        listing.showtimes
          .filter(showtime => (Showtime.compare(now, showtime) <= 0))
          .forEach(showtime => showings.push({ showtime, listing }));
        return showings;
      }, [])
      .sort((lhs, rhs) => Showtime.compare(lhs.showtime, rhs.showtime)
      || rhs.listing.theater.distance - rhs.listing.theater.distance
      || Util.compareWOArticles(lhs.listing.movie.title, rhs.listing.movie.title)
      || Util.compareWOArticles(lhs.listing.theater.name, rhs.listing.theater.name));
    return showtimes;
  }
}

/**
 * @name Showtime#addYears
 * @method
 * @memberof Showtime
 *
 * @description Move a date forward or backward a specified number of years.
 *
 * @param {number} yearsValue - An integer representing the number of years to add (if positive)
 *                              or subtract (if negative) to the date represented by this object.
 */

/**
 * @name Showtime#addMonths
 * @method
 * @memberof Showtime
 *
 * @description Move a date forward or backward a specified number of months.
 *
 * @param {number} monthsValue - An integer representing the number of months to add (if positive)
 *                               or subtract (if negative) to the date represented by this object.
 */


/**
 * @name Showtime#addDays
 * @method
 * @memberof Showtime
 *
 * @description Move a date forward or backward a specified number of days.
 *
 * @param {number} daysValue - An integer representing the number of days to add (if positive) or
 *                             subtract (if negative) to the date represented by this object.
 */

/**
 * @name Showtime#addHours
 * @method
 * @memberof Showtime
 *
 * @description Move a date forward or backward a specified number of hours.
 *
 * @param {number} hoursValue - An integer representing the number of hours to add (if positive) or
 *                              subtract (if negative) to the time represented by this object.
 */

/**
 * @name Showtime#addMinutes
 * @method
 * @memberof Showtime
 *
 * @description Move a time forward or backward a specified number of minutes.
 *
 * @param {number} minutesValue - An integer representing the number of minutes to add (if
 *                                positive) or subtract (if negative) to the time represented by
 *                                this object.
 */

/**
 * @name Showtime#addSeconds
 * @method
 * @memberof Showtime
 *
 * @description Move a time forward or backward a specified number of seconds.
 *
 * @param {number} secondsValue - An integer representing the number of seconds to add (if
 *                                positive) or subtract (if negative) to the time represented by
 *                                this object.
 */

/**
 * @name Showtime#addMilliseconds
 * @method
 * @memberof Showtime
 *
 * @description Move a time forward or backward a specified number of milliseconds.
 *
 * @param {number} msValue - An integer representing the number of milliseconds to add (if
 *                           positive) or subtract (if negative) to the time represented by
 *                           this object.
 */


/**
 * @name Showtime#setFullYear
 * @method
 * @memberof Showtime
 * @description Set the year for a specified date according to local time.
 * @param {Number} yearValue    - An integer specifying the numeric value of the year, for
 *                                example, 1995.
 * @param {number} [monthValue] - An integer between 0 and 11 representing the months January
 *                                through December.
 * @param {number} [dateValue]  - An integer between 1 and 31 representing the day of the month.
 *                                If you specify the <kbd>dateValue</kbd> parameter, you must also
 *                                specify the <kbd>monthValue</kbd>.
 *
 * @returns {number} The number of milliseconds between 1 January 1970 00:00:00 UTC and the
 *                   updated date.
 */

/**
 * @name Showtime#setMonth
 * @method
 * @memberof Showtime
 * @description Set the month for a specified date according to local time.
 * @param {number} monthValue   - An integer between 0 and 11 representing the months January
 *                                through December.
 * @param {number} [dateValue]  - An integer between 1 and 31 representing the day of the month.
 *
 * @returns {number} The number of milliseconds between 1 January 1970 00:00:00 UTC and the
 *                   updated date.
 */

/**
 * @name Showtime#setDate
 * @method
 * @memberof Showtime
 * @description Set the date for a specified date according to local time.
 * @param {number} dateValue - An integer between 1 and 31 representing the day of the month.
 *
 * @returns {number} The number of milliseconds between 1 January 1970 00:00:00 UTC and the
 *                   updated date.
 */

/**
 * @name Showtime#setHours
 * @method
 * @memberof Showtime
 *
 * @description Set the hours for a specified date according to local time.
 *
 * @param {number} hoursValue     - Ideally, an integer between 0 and 23, representing the hour.
 *                                  If a value greater than 23 is provided, the datetime will be
 *                                  incremented by the extra hours.
 * @param {number} [minutesValue] - Ideally, an integer between 0 and 59, representing the minutes.
 *                                  If a value greater than 59 is provided, the datetime will be
 *                                  incremented by the extra minutes.
 * @param {number} [secondsValue] - Ideally, an integer between 0 and 59, representing the seconds.
 *                                  If a value greater than 59 is provided, the datetime will be
 *                                  incremented by the extra seconds. If you specify the
 *                                  <kbd>secondsValue</kbd> parameter, you must also specify the
 *                                  <kbd>minutesValue</kbd>.
 * @param {number} [msValue]      - Ideally, a number between 0 and 999, representing the
 *                                  milliseconds. If a value greater than 999 is provided, the
 *                                  datetime will be incremented by the extra milliseconds. If you
 *                                  specify the <kbd>msValue</kbd> parameter, you must also specify
 *                                  the <kbd>minutesValue</kbd> and <kbd>secondsValue</kbd>.
 *
 * @returns {number} The number of milliseconds between 1 January 1970 00:00:00 UTC and the
 *                   updated date.
 *
 */

/**
 * @name Showtime#setMinutes
 * @method
 * @memberof Showtime
 *
 * @description Set the minutes for a specified date according to local time.
 *
 * @param {number} minutesValue   - Ideally, an integer between 0 and 59, representing the minutes.
 *                                  If a value greater than 59 is provided, the datetime will be
 *                                  incremented by the extra minutes.
 * @param {number} [secondsValue] - Ideally, an integer between 0 and 59, representing the seconds.
 *                                  If a value greater than 59 is provided, the datetime will be
 *                                  incremented by the extra seconds.
 * @param {number} [msValue]      - Ideally, a number between 0 and 999, representing
 *                                  the milliseconds. If a value greater than 999 is provided, the
 *                                  datetime will be incremented by the extra milliseconds. If you
 *                                  specify the <kbd>msValue</kbd> parameter, you must also specify
 *                                  the <kbd>secondsValue</kbd>.
 *
 * @returns {number} The number of milliseconds between 1 January 1970 00:00:00 UTC and the
 *                   updated date.
 */

/**
 * @name Showtime#setSeconds
 * @method
 * @memberof Showtime
 *
 * @description Set the seconds for a specified date according to local time.
 *
 * @param {number} secondsValue - Ideally, an integer between 0 and 59, representing the seconds.
 *                                If a value greater than 59 is provided, the datetime will be
 *                                incremented by the extra seconds.
 * @param {number} [msValue]    - Ideally, a number between 0 and 999, representing the
 *                                milliseconds. If a value greater than 999 is provided, the
 *                                datetime will be incremented by the extra milliseconds.
 *
 * @returns {number} The number of milliseconds between 1 January 1970 00:00:00 UTC and the
 *                   updated date.
 */

/**
 * @name Showtime#setMilliseconds
 * @method
 * @memberof Showtime
 *
 * @description Set the milliseconds for a specified date according to local time.
 *
 * @param {number} msValue - Ideally, a number between 0 and 999, representing the milliseconds.
 *                           If a value greater than 999 is provided, the datetime will be
 *                           incremented by the extra milliseconds.
 *
 * @returns {number} The number of milliseconds between 1 January 1970 00:00:00 UTC and the
 *                   updated date.
 */

/*
 * Generate set and add methods
 *
 * TODO This seems to duplicate the "set" and "add" methods above. The only difference is that the
 *      "set" methods generated here only take one argument.
 *
 * TODO Should the assignment be
 *          Showtime[setMethod] = ...
 *      or
 *          Showtime.prototype[setMethod] = ...
 */
['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds', 'Milliseconds'].forEach((unit) => {
  const setMethod = `set${unit}`;
  const getMethod = `get${unit}`;
  let addMethod;

  switch (unit) {
    case 'FullYear':
      addMethod = 'addYears';
      break;

    case 'Month':
      addMethod = 'addMonths';
      break;

    case 'Date':
      addMethod = 'addDays';
      break;

    default:
      addMethod = `add${unit}`;
  }

  Showtime.prototype[addMethod] = function add(value) {
    this.date[setMethod](this.date[getMethod]() + value);
  };
  Showtime.prototype[getMethod] = function get() { return this.date[getMethod](); };
  Showtime.prototype[setMethod] = function set(...args) { this.date[setMethod](...args); };
});

export default Showtime;
