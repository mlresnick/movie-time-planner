import { JSDOM } from 'jsdom';
import Showtime from '../../src/common/showtime';

describe('Showtime', () => {
  it('can be created', () => {
    const obj = new Showtime();
    expect(obj).toBeDefined();
  });

  it('can be created with Date constructior values', () => {
    const obj = new Showtime(2019, 1, 16, 21, 38);
    expect(obj.toString()).toBe('9:38pm');
    expect(obj.toISOString()).toBe('2019-02-17T02:38:00.000Z');
  });

  it('can be created with an HTMLElement', () => {
    const el = new JSDOM('<span class="stDisplay future">4:30pm</span>');
    const obj = new Showtime(el.window.document.querySelector('span'));
    expect(obj.toString()).toBe('4:30pm');
  });

  describe('compares values correctly', () => {
    test.each([
      ['lhs < rhs', new Showtime(2019, 1, 16, 21, 38), new Showtime(2019, 1, 16, 22, 18), -1],
      ['lhs < rhs', new Showtime(2019, 1, 16, 22, 18), new Showtime(2019, 1, 16, 21, 38), 1],
      ['lhs = rhs', new Showtime(2019, 1, 16, 21, 38), new Showtime(2019, 1, 16, 21, 38), 0],
    ])(
      '%s',
      (testName, lhs, rhs, expected) => { expect(Showtime.compare(lhs, rhs)).toBe(expected); },
    );
  });

  // TODO add extra arguments
  describe('supported setters work', () => {
    test.each([
      ['years', 'setFullYear', 2002, '2002-01-01T06:01:10.001Z'],
      ['months', 'setMonth', 5, '2019-06-01T05:01:10.001Z'],
      ['days', 'setDate', 5, '2019-01-05T06:01:10.001Z'],
      ['hours', 'setHours', 5, '2019-01-01T10:01:10.001Z'],
      ['minutes', 'setMinutes', 5, '2019-01-01T06:05:10.001Z'],
    ])(
      'for %s',
      (testName, setMethod, newValue, expected) => {
        const obj = new Showtime(2019, 0, 1, 1, 1, 10, 1);
        obj[setMethod](newValue);
        expect(obj.toISOString()).toBe(expected);
      }
    );
  });

  describe('supported getters work', () => {
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);
    const nowShowtime = new Showtime(nowDate);

    test.each([
      ['years', 'getFullYear'],
      ['months', 'getMonth'],
      ['days', 'getDate'],
      ['hours', 'getHours'],
      ['minutes', 'getMinutes'],
      ['seconds', 'getSeconds'],
      ['milliseconds', 'getMilliseconds'],
    ])(
      'for %s',
      (testName, getMethod) => {
        expect(nowShowtime[getMethod]()).toBe(nowDate[getMethod]());
      }
    );
  });

  describe('supported adders work', () => {
    test.each([
      ['years', 'addYears', 2, '2021-01-01T06:01:10.001Z'],
      ['months', 'addMonths', 5, '2019-06-01T05:01:10.001Z'],
      ['days', 'addDays', 5, '2019-01-06T06:01:10.001Z'],
      ['hours', 'addHours', 5, '2019-01-01T11:01:10.001Z'],
      ['minutes', 'addMinutes', 5, '2019-01-01T06:06:10.001Z'],
      ['seconds', 'addSeconds', 5, '2019-01-01T06:01:15.001Z'],
      ['milliseconds', 'addMilliseconds', 25, '2019-01-01T06:01:10.026Z'],
    ])(
      'for %s',
      (testName, addMethod, newValue, expected) => {
        const obj = new Showtime(2019, 0, 1, 1, 1, 10, 1);
        obj[addMethod](newValue);
        expect(obj.toISOString()).toBe(expected);
      }
    );
  });

  describe('toLocalISOString works', () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const timezoneMinutes = d.getTimezoneOffset();
    const tzSign = timezoneMinutes > 0 ? '-' : '+';
    const tzHours = Math.floor(timezoneMinutes / 60);
    const tzMinutes = timezoneMinutes % 60;

    const pad = (value, padding = 2) => value.toString().padStart(padding, '0');

    const fmt = (date, unit, padding = 2) => pad(date[`get${unit}`](), padding);

    const expected = `${fmt(d, 'FullYear', 4)}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${fmt(d, 'Date')}T${fmt(d, 'Hours')}:${fmt(d, 'Minutes')}:${fmt(d, 'Seconds')}.${fmt(d, 'Milliseconds', 3)}`;
    expect((new Showtime(d)).toLocalISOString()).toBe(expected);

    const timezone = `${tzSign}${pad(tzHours)}:${pad(tzMinutes)}`;
    expect((new Showtime(d)).toLocalISOString(true)).toBe(`${expected}${timezone}`);
  });
});
