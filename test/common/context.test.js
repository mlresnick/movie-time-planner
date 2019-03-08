import { ContextMap } from '../../src/common/context';
import IdObject from '../../src/common/id-object';

class IdObjectSubclass extends IdObject {
  constructor(parent, value) {
    super(parent);
    this.url = 'URI:IdObjectSubclass';
    this.value = value;
  }
}
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
});
