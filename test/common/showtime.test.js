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

  describe('supported setters work', () => {
    test.each([
      ['years', 'setFullYear', 2002, '2002-01-01T06:01:00.000Z'],
      ['months', 'setMonth', 5, '2019-06-01T05:01:00.000Z'],
      ['days', 'setDate', 5, '2019-01-05T06:01:00.000Z'],
      ['hours', 'setHours', 5, '2019-01-01T10:01:00.000Z'],
      ['minutes', 'setMinutes', 5, '2019-01-01T06:05:00.000Z'],
    ])(
      'for %s',
      (testName, setMethod, newValue, expected) => {
        const obj = new Showtime(2019, 0, 1, 1, 1, 10, 1);
        obj[setMethod](newValue);
        expect(obj.toISOString()).toBe(expected);
      }
    );
  });

  describe('unsupported setters don\'t exist', () => {
    test.each([
      ['seconds', 'setSeconds'],
      ['milliseconds', 'setMilliseconds'],
    ])(
      'for %s',
      (testName, setMethod) => {
        const obj = new Showtime(2019, 0, 1, 1, 1, 10, 1);
        expect(typeof obj[setMethod]).toBe('undefined');
      }
    );
  });

  describe('supported adders work', () => {
    test.each([
      ['years', 'addYears', 2, '2021-01-01T06:01:00.000Z'],
      ['months', 'addMonths', 5, '2019-06-01T05:01:00.000Z'],
      ['days', 'addDays', 5, '2019-01-06T06:01:00.000Z'],
      ['hours', 'addHours', 5, '2019-01-01T11:01:00.000Z'],
      ['minutes', 'addMinutes', 5, '2019-01-01T06:06:00.000Z'],
    ])(
      'for %s',
      (testName, addMethod, newValue, expected) => {
        const obj = new Showtime(2019, 0, 1, 1, 1, 10, 1);
        obj[addMethod](newValue);
        expect(obj.toISOString()).toBe(expected);
      }
    );
  });

  describe('unsupported adders don\'t exist', () => {
    test.each([
      ['seconds', 'addSeconds'],
      ['milliseconds', 'addMilliseconds'],
    ])(
      'for %s',
      (testName, addMethod) => {
        const obj = new Showtime(2019, 0, 1, 1, 1, 10, 1);
        expect(typeof obj[addMethod]).toBe('undefined');
      }
    );
  });
});
