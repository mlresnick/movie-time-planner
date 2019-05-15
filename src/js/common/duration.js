/* eslint-disable no-multi-spaces, key-spacing */
const millisecond = 1;
const second      = 1000 * millisecond;
const minute      = 60   * second;
const hour        = 60   * minute;
const day         = 24   * hour;
const week        = 7    * day;

const microsecond = millisecond / 1000;
const nanosecond  = microsecond / 1000;

const unitMap = {
  ns : nanosecond,
  us : microsecond,
  µs : microsecond,
  μs : microsecond,
  ms : millisecond,
  s  : second,
  m  : minute,
  h  : hour,
  d  : day,
  w  : week,
};
/* eslint-enable no-multi-spaces,key-spacing */

/**
 * @param {(number|string)} [value=0] - If a number, set as the number of milliseconds. If a string,
 *                                      it is parsed by the <kbd>parse</kbd> method.
 *
 * @class
 */
class Duration {
  constructor(value = 0) {
    if (value instanceof Duration) {
      return value;
    }
    switch (typeof value) {
      case 'number':
        if (!Number.isFinite(value)) {
          throw new Error(`invalid duration: ${value}`);
        }
        this._milliseconds = value;
        break;

      case 'string':
        this._milliseconds = Duration.parse(value).valueOf();
        break;

      case 'undefined':
        this._milliseconds = 0;
        break;

      default:
        throw new Error(`invalid duration: ${value}`);
    }
  }

  /* eslint-disable max-len */
  /**
   * <style> .duration-example i { font-family: Times New Roman, serif; }</style>
   *
   * @param {string} duration - in the form of
   * <span class="duration-example">
   *   <i>nn</i><b>w</b><i>nn</i><b>d</b><i>nn</i><b>h</b><i>nn</i><b>m</b><i>nn</i><b>s</b><i>nn</i><b>ms</b>
   * </span>
   * specfying any subset of
   * <ul>
   *   <li> <b>w</b>eeks </li>
   *   <li> <b>d</b>ays </li>
   *   <li> <b>h</b>ours </li>
   *   <li> <b>m</b>inutes </li>
   *   <li> <b>s</b>econds </li>
   *   <li> <b>m</b>illi<b>s</b>econds </li>
   * </ul>
   */
  /* eslint-enable max-len */
  static parse(duration) {
    if (duration === '0' || duration === '+0' || duration === '-0') {
      return new Duration(0);
    }

    const regex = /([-+\d.]+)([a-zµμ]+)/g;
    let total = 0;
    let count = 0;
    const sign = duration[0] === '-' ? -1 : 1;
    let unit;
    let value;
    let match = regex.exec(duration);
    let valueString;

    while (match) {
      [, valueString, unit] = match;
      value = Math.abs(parseFloat(valueString));
      count += 1;

      if (Number.isNaN(value)) {
        throw new Error('invalid duration');
      }

      if (typeof unitMap[unit] === 'undefined') {
        throw new Error(`invalid unit: ${unit}`);
      }

      total += value * unitMap[unit];

      match = regex.exec(duration);
    }

    if (count === 0) {
      throw new Error('invalid duration');
    }

    return new Duration(Math.floor(total) * sign);
  }

  /**
   * @type {number}
   * @readonly
   */
  get hours() { return Math.floor((this._milliseconds % day) / hour); }

  /**
   * @type {number}
   * @readonly
   */
  get minutes() {
    return Math.floor((this._milliseconds % hour) / minute);
  }

  toString() {
    let str = '';
    let milliseconds = Math.abs(this._milliseconds);
    const sign = this._milliseconds < 0 ? '-' : '';

    // no units for 0 duration
    if (milliseconds === 0) {
      return '0';
    }

    // hours
    const hours = Math.floor(milliseconds / hour);
    if (hours !== 0) {
      milliseconds -= hour * hours;
      str += `${hours.toString()}h`;
    }

    // minutes
    const minutes = Math.floor(milliseconds / minute);
    if (minutes !== 0) {
      milliseconds -= minute * minutes;
      str += `${minutes.toString()}m`;
    }

    // seconds
    const seconds = Math.floor(milliseconds / second);
    if (seconds !== 0) {
      milliseconds -= second * seconds;
      str += `${seconds.toString()}s`;
    }

    // milliseconds
    if (milliseconds !== 0) {
      str += `${milliseconds.toString()}ms`;
    }

    return sign + str;
  }

  valueOf() {
    return this._milliseconds;
  }
}

export default Duration;
