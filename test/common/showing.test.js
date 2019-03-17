/* eslint-env jest */
import { JSDOM } from 'jsdom';
import context from '../../src/js/common/context';
import Showing from '../../src/js/common/showing';
import Showtime from '../../src/js/common/showtime';

context.requestedDate = new Showtime(2019, 0, 1, 2, 0, 0, 0);

describe('Showing', () => {
  context.clear();
  const mockShowtime = new Showtime(2019, 0, 1, 2, 3);
  const mockMovie = { id: 'mockMovie', name: 'Mock Movie' };
  const mockTheater = { id: 'mockTheater', name: 'Mock Theater' };
  const mockListing = { id: `${mockTheater.id},${mockMovie.id}`, movie: mockMovie, theater: mockTheater };
  const expectedShowtime = '2019-01-01T07:03:00.000Z';
  const showtimeEl = (new JSDOM('<span class="stDisplay future">2:03am</span>'))
    .window
    .document
    .querySelector('span');
  context.theaters.set(mockTheater.id, mockTheater);
  context.movies.set(mockMovie.id, mockMovie);
  context.listings.set(mockListing.id, mockListing);

  const showing = new Showing(mockListing, showtimeEl);

  describe('allocation', () => {
    it('requires the "listing" argument', () => { expect(() => new Showing()).toThrow(); });
    it('requires the "showtimeEl" argument', () => { expect(() => new Showing(mockListing)).toThrow(); });
    it('works', () => {
      expect(showing.id).toBe(`mockTheater,mockMovie,${expectedShowtime}`);
    });
  });

  describe('accessor', () => {
    it('showtime works', () => { expect(showing.showtime.toISOString()).toBe(expectedShowtime); });
    it('listing works', () => { expect(showing.listing.id).toBe(mockListing.id); });
    it('movie works', () => { expect(showing.movie.id).toBe(mockMovie.id); });
    it('theater works', () => { expect(showing.theater.id).toBe(mockTheater.id); });
  });

  it('toString works', () => {
    expect(showing.toString()).toBe(`'Mock Theater' showing 'Mock Movie' at ${mockShowtime.toISOString()}`);
  });
});
