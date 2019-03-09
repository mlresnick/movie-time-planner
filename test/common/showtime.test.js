import { JSDOM } from 'jsdom';
import context from '../../src/common/context';
import Showtime from '../../src/common/showtime';

function getLocalTimezone() {
  const rawTimezoneOffset = (new Date()).getTimezoneOffset();
  const sign = (rawTimezoneOffset < 0) ? '+' : '-';
  const timezoneOffset = Math.abs(rawTimezoneOffset);
  const hoursInt = Math.floor(timezoneOffset / 60);
  const minutesInt = timezoneOffset % 60;
  const hours = ((hoursInt < 10) ? '0' : '') + hoursInt.toString();
  const minutes = ((minutesInt < 10) ? '0' : '') + minutesInt.toString();
  return `${sign}${hours}:${minutes}`;
}

context.requestedDate = new Date();

describe('Showtime', () => {
  it('can be created', () => {
    const obj = new Showtime();
    expect(obj).toBeDefined();
  });

  it('can be created with Date constructor values', () => {
    const obj = new Showtime(2019, 1, 16, 21, 38);
    expect(obj.toString()).toBe('9:38pm');
    expect(obj.toISOString()).toBe('2019-02-17T02:38:00.000Z');
  });

  it('can be created with an HTMLElement', () => {
    const showtimeDoc = (new JSDOM('<span class="stDisplay future">4:30pm</span>'))
      .window
      .document;
    const showtimeEl = showtimeDoc.querySelector('span');
    const obj = new Showtime(showtimeEl);
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
      ['years', 'setFullYear', 2002, [2002, 0, 1, 1, 1, 0, 0]],
      ['months', 'setMonth', 5, [2019, 5, 1, 1, 1, 0, 0]],
      ['days', 'setDate', 5, [2019, 0, 5, 1, 1, 0, 0]],
      ['hours', 'setHours', 5, [2019, 0, 1, 5, 1, 0, 0]],
      ['minutes', 'setMinutes', 5, [2019, 0, 1, 1, 5, 0, 0]],
    ])(
      'for %s',
      (testName, setMethod, newValue, expectedArgs) => {
        const expected = new Showtime(...expectedArgs);
        const obj = new Showtime(2019, 0, 1, 1, 1);
        obj[setMethod](newValue);
        expect(obj.toLocalISOString()).toBe(expected.toLocalISOString());
      }
    );
  });

  describe('supported getters work', () => {
    // TODO should this really be Showtime.now();
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
      ['years', 'addYears', 2, '2021-01-01T06:01:00.000Z'],
      ['months', 'addMonths', 5, '2019-06-01T05:01:00.000Z'],
      ['days', 'addDays', 5, '2019-01-06T06:01:00.000Z'],
      ['hours', 'addHours', 5, '2019-01-01T11:01:00.000Z'],
      ['minutes', 'addMinutes', 5, '2019-01-01T06:06:00.000Z'],
      ['seconds', 'addSeconds', 5, '2019-01-01T06:01:05.000Z'],
      ['milliseconds', 'addMilliseconds', 25, '2019-01-01T06:01:00.025Z'],
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
    const tz = getLocalTimezone();
    const d = new Date();
    d.setHours(0, 0, 0, 0);

    const pad = (value, padding = 2) => value.toString().padStart(padding, '0');

    const fmt = (date, unit, padding = 2) => pad(date[`get${unit}`](), padding);

    const expected = `${fmt(d, 'FullYear', 4)
    }-${(d.getMonth() + 1).toString().padStart(2, '0')
    }-${fmt(d, 'Date')
    }T${fmt(d, 'Hours')
    }:${fmt(d, 'Minutes')
    }:${fmt(d, 'Seconds')
    }.${fmt(d, 'Milliseconds', 3)
    }${tz}`;
    expect((new Showtime(d)).toLocalISOString()).toBe(expected);
  });
});
