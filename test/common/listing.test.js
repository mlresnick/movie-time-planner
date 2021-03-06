/* eslint-env jest */

import { JSDOM } from 'jsdom';

import context from '../../src/js/common/context';
import Duration from '../../src/js/common/duration';
import Listing from '../../src/js/common/listing';
import Movie from '../../src/js/common/movie';
import Showtime from '../../src/js/common/showtime';
import Theater from '../../src/js/common/theater';

context.requestedDate = new Date(2019, 1, 2, 0, 0, 0, 0);

describe('movie listing', () => {
  const dateArgs = [
    context.requestedDate.getFullYear(),
    context.requestedDate.getMonth(),
    context.requestedDate.getDate(),
  ];
  const movieListingHTML = `
    <!DOCTYPE html>
    <html>
    <body>
    <div class="movie-listing">
      <div class="moviePoster">
        <a href="https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/" title="Three Identical Strangers">
          <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://d1t80wr11ktjcz.cloudfront.net/movieposters/v7/AllPhotos/15402597/p15402597_p_v7_aa.jpg?d=270x360&amp;q=60" alt="Three Identical Strangers Poster">
        </a>
      </div>
      <div class="movie-data-wrap">
        <div class="moviedata">
          <div class="movietitle">
            <a href="https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/" title="Three Identical Strangers">Three Identical Strangers  (2018)</a>
          </div>
          <div class="movierating-runtime">
            PG-13

            | 1 hr 36 min
          </div>
        </div>
        <div class="showtimes-list">
          <span class="stDisplay future">2:00pm</span>
          <span class="stDisplay future">4:30pm</span>
          <span class="stDisplay future">7:00pm</span>
          <div class="clear">
          </div>
        </div>
      </div>
    </div>
    </body>
    </html>
    `;

  const emptyMovieListingHTML = `
    <!DOCTYPE html>
    <html>
    <body>
    <div class="movie-listing">
      <div class="moviePoster">
        <a href="https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/" title="Three Identical Strangers">
          <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://d1t80wr11ktjcz.cloudfront.net/movieposters/v7/AllPhotos/15402597/p15402597_p_v7_aa.jpg?d=270x360&amp;q=60" alt="Three Identical Strangers Poster">
        </a>
      </div>
      <div class="movie-data-wrap">
        <div class="moviedata">
          <div class="movietitle">
            <a href="https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/" title="Three Identical Strangers">Three Identical Strangers  (2018)</a>
          </div>
          <div class="movierating-runtime">
            PG-13

            | 1 hr 36 min
          </div>
        </div>
        <div class="showtimes-list">
          <div class="clear">
          </div>
        </div>
      </div>
    </div>
    </body>
    </html>
    `;
  const mockTheater = new Theater();
  mockTheater.url = 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/';
  context.theaters.set(mockTheater);

  const mockMovie = new Movie();
  mockMovie.url = 'https://www.moviefone.com/movie/foo-bar/baz/main/';
  context.movies.set(mockMovie);

  const { document } = new JSDOM(movieListingHTML).window;
  const movieListingEl = document.querySelector('div.movie-listing');

  describe('can be created with', () => {
    it('no arguments', () => {
      const obj = new Listing();
      expect(obj).toBeDefined();
      expect(obj).toEqual({
        movieURL: '',
        parentId: null,
        showings: [],
      });
    });

    it('an empty movie listing element', () => {
      const emptyMovieDoc = new JSDOM(emptyMovieListingHTML).window.document;
      const emptyMovieListingEl = emptyMovieDoc.querySelector('div.movie-listing');

      const obj = new Listing(mockTheater, emptyMovieListingEl);

      expect(obj).toEqual({
        movieURL: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
        showings: [],
        parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
      });
    });

    it('a movie listing element', () => {
      const obj = new Listing(mockTheater, movieListingEl);

      expect(obj).toEqual({
        movieURL: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
        showings: [
          {
            parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
            showtime: new Showtime(
              context.requestedDate.getFullYear(),
              context.requestedDate.getMonth(),
              context.requestedDate.getDate(),
              14,
              0,
              0,
              0
            ),
          },
          {
            parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
            showtime: new Showtime(
              context.requestedDate.getFullYear(),
              context.requestedDate.getMonth(),
              context.requestedDate.getDate(),
              16,
              30,
              0,
              0
            ),
          },
          {
            parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
            showtime: new Showtime(
              context.requestedDate.getFullYear(),
              context.requestedDate.getMonth(),
              context.requestedDate.getDate(),
              19,
              0,
              0,
              0
            ),
          },
        ],
        parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
      });
    });
  });

  describe('movie', () => {
    describe('setter works with', () => {
      it('a URL', () => {
        const obj = new Listing(mockTheater, movieListingEl);
        obj.movieURL = 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/';
        expect(obj).toEqual(/* expected */ {
          movieURL: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
          showings: [
            {
              parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
              showtime: new Showtime(...dateArgs.concat([14])),
            },
            {
              parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
              showtime: new Showtime(...dateArgs.concat([16, 30])),
            },
            {
              parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
              showtime: new Showtime(...dateArgs.concat([19])),
            },
          ],
          parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
        });
      });

      it('a Movie object', () => {
        const otherMovieHTML = `
          <div class="moviedata">
            <div class="movietitle">
              <a href="https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/" title="Solo: A Star Wars Story">Solo: A Star Wars Story  (2018)</a>
            </div>
            <div class="movierating-runtime">
          PG-13

          | 2 hr 15 min
            </div>
          </div>`;

        const dom = new JSDOM(otherMovieHTML);
        const otherMovieEl = dom.window.document.querySelector('.moviedata');
        const otherMovie = new Movie(otherMovieEl);
        const mockVenue = { id: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/' };
        context.theaters.set(mockVenue.id, mockVenue);
        const obj = new Listing(mockVenue, movieListingEl);
        obj.movie = otherMovie;
        expect(obj).toEqual({
          movieURL: 'https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/',
          showings: [
            {
              parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
              showtime: new Showtime(...dateArgs.concat([14])),
            },
            {
              parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
              showtime: new Showtime(...dateArgs.concat([16, 30])),
            },
            {
              parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
              showtime: new Showtime(...dateArgs.concat([19])),
            },
          ],
          parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
        });
      });
    });

    it('getter works', () => {
      const expected = {
        parentId: null,
        rating: 'PG-13',
        runningTime: new Duration('1h36m'),
        title: 'Three Identical Strangers (2018)',
        url: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
      };
      context.movies.set(expected.url, expected);
      const obj = new Listing(mockTheater, movieListingEl);
      expect(obj.movie).toEqual(expected);
    });
  });

  it('theater getter works', () => {
    const obj = new Listing(mockTheater, movieListingEl);
    const { theater } = obj;
    expect(theater).toEqual(mockTheater);
  });

  function mapToShowtime(hm) {
    const r = new Showtime(context.requestedDate);
    r.setHours(hm[0]);
    r.setMinutes(hm[1]);
    r.setSeconds(0);
    r.setMilliseconds(0);
    return r;
  }

  describe('showtimes can be filtered', () => {
    const testlist = [
      ['before all', 13, [[14, 0], [16, 30], [19, 0]].map(mapToShowtime)],
      ['after first', 15, [[16, 30], [19, 0]].map(mapToShowtime)],
      ['at second', 14, [[14, 0], [16, 30], [19, 0]].map(mapToShowtime)],
      ['after second', 17, [[19, 0]].map(mapToShowtime)],
      ['after all', 20, []],
    ];

    const obj = new Listing(mockTheater, movieListingEl);
    test.each(testlist)(
      '%s',
      (testName, hours, expectedShowtimes) => {
        const testShowtime = new Showtime(context.requestedDate);
        testShowtime.setHours(hours, 0, 0, 0);

        expect(obj.showingsAfter(testShowtime)
          .map(showing => showing.showtime))
          .toEqual(expectedShowtimes);
      },
    );
  });
});
