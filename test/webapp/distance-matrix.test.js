/* eslint-env jest */
import '@babel/polyfill';
import getDistanceMatrix from '../../src/webapp/distance-matrix';

expect.extend({
  valueToBeTypeOf(actual, expected) {
    const pass = (typeof actual) === expected; // eslint-disable-line valid-typeof
    return {
      message: () => `expected typeof ${actual} (${typeof actual}) to be ${expected}})`,
      pass,
    };
  },
});
const duration = {
  text: expect.stringMatching(/\d+ mins?/),
  value: expect.valueToBeTypeOf('number'),
};
const distance = {
  text: expect.stringMatching(/\d+\.\d+ mi/),
  value: expect.valueToBeTypeOf('number'),
};
const twoParamResult = {
  destination_addresses: [
    '77 Massachusetts Ave, Cambridge, MA 02139, USA', // MIT
    '1465-1483 Massachusetts Ave, Cambridge, MA 02138, USA', // Harvard
  ],
  origin_addresses: [
    '193 Salem St, Boston, MA 02113, USA',
    '19 N Square, Boston, MA 02113, USA',
  ],
  rows: [
    {
      elements: [
        {
          distance: { text: '3.3 mi', value: 5334 },
          // duration: { text: '14 mins', value: 857 },
          duration,
          status: 'OK',
        },
        {
          distance: { text: '6.0 mi', value: 9602 },
          // duration: { text: '21 mins', value: 1245 },
          duration,
          status: 'OK',
        },
      ],
    },
    {
      elements: [
        {
          distance: { text: '3.1 mi', value: 5028 },
          // duration: { text: '16 mins', value: 973 },
          duration,
          status: 'OK',
        },
        {
          distance: { text: '5.8 mi', value: 9296 },
          // duration: { text: '23 mins', value: 1362 },
          duration,
          status: 'OK',
        },
      ],
    },
  ],
  status: 'OK',
};

const oneParamResult = {
  destination_addresses: [
    '77 Massachusetts Ave, Cambridge, MA 02139, USA', // MIT
    '1465-1483 Massachusetts Ave, Cambridge, MA 02138, USA', // Harvard
  ],
  origin_addresses: [
    '77 Massachusetts Ave, Cambridge, MA 02139, USA', // MIT
    '1465-1483 Massachusetts Ave, Cambridge, MA 02138, USA', // Harvard
  ],
  rows: [
    {
      elements: [
        {
          distance: { text: '1 ft', value: 0 },
          // duration: { text: '1 min', value: 0 },
          duration,
          status: 'OK',
        },
        {
          distance: { text: '1.7 mi', value: 2809 },
          // duration: { text: '12 mins', value: 739 },
          duration,
          status: 'OK',
        },
      ],
    },
    {
      elements: [
        {
          // distance: { text: '2.2 mi', value: 3515 },
          // duration: { text: '11 mins', value: 672 },
          distance,
          duration,
          status: 'OK',
        },
        {
          distance: { text: '1 ft', value: 0 },
          // duration: { text: '1 min', value: 0 },
          duration,
          status: 'OK',
        },
      ],
    },
  ],
  status: 'OK',
};

describe('DistanceMatrix', () => {
  it('can be referenced', () => {
    expect(getDistanceMatrix).toBeDefined();
  });

  describe('can be called', () => {
    test('but throws with no arguments', async () => {
      try {
        await getDistanceMatrix();
      }
      catch (exception) {
        expect(/at least one/.test(exception.message)).toBeTruthy();
      }
    });

    it('with two arguments', async () => {
      await getDistanceMatrix([
        '193 Salem St, Boston, MA 02113', // Old North Church
        '19 N Square, Boston, MA 02113', // Paul Revere's House
      ],
      [
        '77 Massachusetts Ave, Cambridge, MA 02139', // MIT
        'Massachusetts Hall, Cambridge, MA', // Harvard
      ]);
      expect(await getDistanceMatrix([
        '193 Salem St, Boston, MA 02113', // Old North Church
        '19 N Square, Boston, MA 02113', // Paul Revere's House
      ],
      [
        '77 Massachusetts Ave, Cambridge, MA 02139', // MIT
        'Massachusetts Hall, Cambridge, MA', // Harvard
      ])).toMatchObject(twoParamResult);
    });

    test('with one argument', async () => {
      expect(await getDistanceMatrix([
        '77 Massachusetts Ave, Cambridge, MA 02139', // MIT
        'Massachusetts Hall, Cambridge, MA', // Harvard
      ])).toMatchObject(oneParamResult);
    });
  });
});
/*
old north chuch/harvard 4.1mi
paul/h 4.2
old north/mit 3.3/3.0/4.5
paul/mit 3.2/2.8/2.9

*/
