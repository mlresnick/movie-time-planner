/**
 * Tests for Util.
 */
import { JSDOM } from 'jsdom';
import Util from '../../src/js/common/util';

describe('Util', () => {
  describe('compares strings (without articles)', () => {
    const values = [
      { value: 'a foo', sortBy: 'foo' },
      { value: 'an abar', sortBy: 'abar' },
      { value: 'the baz', sortBy: 'baz' },
      { value: 'another one' },
      { value: 'foo bar' },
      { value: 'a' },
      { value: 'an' },
      { value: 'the' },
    ];

    const testValues = [];

    // Try all combinations of the values array with itself.
    values.forEach((lhs, index, array) => {
      array.forEach((rhs) => {
        let expected;
        const lhsSortBy = lhs.sortBy || lhs.value;
        const rhsSortBy = rhs.sortBy || rhs.value;
        if (lhsSortBy < rhsSortBy) {
          expected = -1;
        }
        else if (lhsSortBy === rhsSortBy) {
          expected = 0;
        }
        else {
          expected = 1;
        }
        testValues.push([lhs.value, rhs.value, expected]);
      });
    });

    test.each(testValues)(
      'compare("%s", "%s")',
      (lhs, rhs, expected) => expect(Util.compareWOArticles(lhs, rhs)).toBe(expected)
    );
  });

  describe('validates number intervals', () => {
    test.each([
      // [value, interval, expected]
      [5, '[0,9]', true],
      [5, '[-9,0]', false],
      [1, '[-1,1]', true],
      [1, '[-1,1)', false],
      [-1, '(-1,1)', false],
      [0, '(-1,1)', true],
      [1, '[-1,1[', false],
      [-1, ']-1,1[', false],
      [0, ']-1,1[', true],
      [17.5, '[2.3,8.4]', false],
      [-17.5, '[-17.9,-16.9]', true],
    ])(
      'isInInterval(%i, \'%s\')',
      (value, interval, expected) => expect(Util.isInInterval(value, interval)).toBe(expected)
    );
  });

  describe('extracts inner HTML', () => {
    test.each([
      // [name, HTML, expected]
      ['in a simple case', '<p>mares eat oats</p>', 'mares eat oats'],
      ['when padded before', ' <p>mares eat oats</p>', 'mares eat oats'],
      ['when padded after', '<p>mares eat oats </p> ', 'mares eat oats'],
      ['when padded inside', '<p>mares eat  oats</p>', 'mares eat oats'],
      ['when padded all around', '   <p>mares  eat \toats</p>   ', 'mares eat oats'],
    ])(
      '%s',
      (testName, html, expected) => {
        const el = new JSDOM(html).window.document.querySelector('p');
        expect(Util.innerHTML(el)).toBe(expected);
      }
    );
  });
});
