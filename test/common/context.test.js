import context, { ContextMap } from '../../src/common/context';
import IdObject from '../../src/common/id-object';

class IdObjectSubclass extends IdObject {
  constructor(parent, value) {
    super(parent);
    this.url = 'URI:IdObjectSubclass';
    this.value = value;
  }
}

describe('Context', () => {
  it('is defined', () => {
    expect(context).toBeDefined();
  });

  it('clear works', () => {
    function lengthOf(map) { return Array.from(map.entries()).length; }
    context.movies.set('a movie', {});
    context.theaters.set('a theater', {});
    context.theaters.set('another theater', {});
    context.listings.set('a listing', {});
    context.listings.set('another listing', {});
    context.listings.set('yet another listing', {});
    expect([lengthOf(context.movies), lengthOf(context.theaters), lengthOf(context.listings)])
      .toEqual([1, 2, 3]);

    context.clear();
    expect([lengthOf(context.movies), lengthOf(context.theaters), lengthOf(context.listings)])
      .toEqual([0, 0, 0]);
  });
});

describe('ContextMap', () => {
  describe('constructor', () => {
    it('works with 0 arg constructor', () => { expect(new ContextMap()).toBeDefined(); });
    it('works with an array constructor', () => {
      const value = [[1, 'a'], [2, 'b'], [3, 'c']];
      expect(Array.from((new ContextMap(value)).entries())).toEqual(value);
    });
  });

  describe('set', () => {
    const url = 'URI:IdObjectSubclass';
    const value = [[1, 'a'], [2, 'b'], [3, 'c']];
    const obj = new IdObjectSubclass(null, value);
    obj.url = url;

    it('set works with 2 arguments', () => {
      const map = new ContextMap();
      map.set(url, obj);
      expect(Array.from(map.entries())).toEqual([[url, obj]]);
    });

    it('set works with an IdObject', () => {
      const map = new ContextMap();
      map.set(obj);
      expect(Array.from(map.entries())).toEqual([[url, obj]]);
    });
  });

  describe('includes() works with', () => {
    const map = new ContextMap();
    map.set('key1', 'value1');
    map.set('key3', 'value3');

    it('an existing entry', () => {
      expect(map.includes('key1')).toBeTruthy();
    });

    it('a non-existent entry', () => {
      expect(map.includes('key2')).toBeFalsy();
    });
  });

  it('has a working toString()', () => {
    const map = new ContextMap();
    map.set('key1', 'value1');
    map.set('key3', 'value3');
    expect(map.toJSON()).toEqual([
      ['key1', 'value1'],
      ['key3', 'value3'],
    ]);
  });
});
