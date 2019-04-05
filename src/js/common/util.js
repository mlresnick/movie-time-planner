/**
 * Miscellaneous methods used by more than one class.
 */
class Util {
  /**
   * Perform a case-insensitive comparison of two strings without leading articles. If either (or
   * both) of the strings begin with an article ("a", "an", or "the"), do not include that word in
   * the comparison.
   *
   * @param {string} lhs - Left-hand side of comparison.
   * @param {string} rhs - Right-hand side of comparison.
   *
   * @returns {number} A negative value is `lhs` is before `rhs`, 0 if
   *          `lhs` and `rhs` are equal, and a positive value if
   *          `lhs` is after `rhs`.
   */
  static compareWOArticles(lhs, rhs) {
    const a = lhs.toLowerCase().replace(/^(an?|the)\s/i, '');
    const b = rhs.toLowerCase().replace(/^(an?|the)\s/i, '');
    let result = 0;
    if (a < b) {
      result = -1;
    }
    else if (a > b) {
      result = 1;
    }
    return result;
  }

  /**
  * Given an element, return the value of its innerHTML member. In the returned value leading and
  * trailing spaces are removed and multiple spaces are replaced by a single space.
  *
  * @param {HTMLElement} el - The HTML element whose internal HTML is returned.
  *
  * @returns {string} - Text of the inner HTML. Multiple whitespace charcaters are replaced with
  *          a single space.
  *
  */
  static innerHTML(el) {
    return (el !== null) ? el.innerHTML.trim().replace(/\s+/g, ' ') : '';
  }

  /**
   * Test whether a value appears within the interval. The interval may be opened, closed or half
   * open. Use the leftBracket and rightBracket parameters to specify the whether an endpoint is
   * open or closed.
   *
   * @param {number} value    - Value to be tested.
   * @param {string} interval - The interval to check in the form of
   *        _open-symbol_ _min_, _max_ _close-symbol_.
   *        Where
   * * _min_ defines the lower end of the range.
   * * _max_ defines the upper end of the range.
   * * _open-symbol_ is
   *   * **[** to indicate the lower end is inclusive/closed.
   *   * **(** or **]** to indicate the lower end is exclusive/open.
   * * _close-symbold_ is
   *   * **]** to indicate the upper end is inclusive/closed.
   *   * **)** or **[** to indicate the upper end is exclusive/open.
   *
   * @returns {boolean} - A value of `true` if the value is wi thin the range. Otherwise, `false`.
   */
  static isInInterval(value, interval) {
    const [, leftBracket, minString, maxString, rightBracket] = /([(\][])([+-]?\d+(?:\.\d+)?), *([+-]?\d+(?:\.\d+)?)([)[\]])/.exec(interval);
    const min = Number.parseFloat(minString);
    const max = Number.parseFloat(maxString);

    const inRange = (
      (((leftBracket === '[') && (min <= value)) || (min < value))
      && (((rightBracket === ']') && (value <= max)) || value < max)
    );

    return inRange;
  }

  /**
   * Wrapper around console.error().
   *
   * @param  {...any} args - Any arguments that can be passed to {@link console#error}.
   */
  static logError(...args) { console.error(...args); } // eslint-disable-line no-console

  /**
   * Wrapper around console.log().
   *
   * @param  {...any} args - Any arguments that can be passed to {@link console#error}.
   */
  static log(...args) { console.log(...args); } // eslint-disable-line no-console
}

export default Util;
