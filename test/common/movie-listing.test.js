import { JSDOM } from 'jsdom';
import Duration from 'duration-js';
import context from '../../src/common/context';
import MovieListing from '../../src/common/movie-listing';
import Showtime from '../../src/common/showtime';
import Movie from '../../src/common/movie';

describe('movie listing', () => {
  const movieListingHTML = `
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
      </div>`;
  context.requestedDate = new Date(2019, 1, 1);
  const movieListingEl = (new JSDOM(movieListingHTML)).window.document.querySelector('div');

  it('can be created', () => {
    const obj = new MovieListing();
    expect(obj).toBeDefined();
    expect(obj).toEqual({
      movieURL: '',
      showtimes: [],
      theaterURL: '',
    });
  });

  it('can be created with arguments', () => {
    const obj = new MovieListing(movieListingEl, 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/');
    expect(obj).toEqual({
      movieURL: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
      showtimes: [
        new Showtime(2019, 1, 1, 14),
        new Showtime(2019, 1, 1, 16, 30),
        new Showtime(2019, 1, 1, 19),
      ],
      theaterURL: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
    });
  });

  describe('movie value', () => {
    describe('setter works with', () => {
      it('a URL', () => {
        const obj = new MovieListing(movieListingEl, 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/');
        obj.movie = 'https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/';
        expect(obj).toEqual({
          movieURL: 'https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
          showtimes: [
            new Showtime(2019, 1, 1, 14),
            new Showtime(2019, 1, 1, 16, 30),
            new Showtime(2019, 1, 1, 19),
          ],
          theaterURL: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
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
        // TODO - decide ion JSDOM or DOMParser (supposed to be browseer only)
        const parser = new DOMParser();
        const doc = parser.parseFromString(otherMovieHTML, 'text/html');
        const otherMovieEl = doc.querySelector('.moviedata');
        const otherMovie = new Movie(otherMovieEl);

        const obj = new MovieListing(movieListingEl, 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/');
        obj.movie = otherMovie;
        expect(obj).toEqual({
          movieURL: 'https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/',
          showtimes: [
            new Showtime(2019, 1, 1, 14),
            new Showtime(2019, 1, 1, 16, 30),
            new Showtime(2019, 1, 1, 19),
          ],
          theaterURL: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
        });
      });
    });

    describe('getter works', () => {
      const obj = new MovieListing(movieListingEl, 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/');
      expect(obj.movie).toEqual({
        runningTime: new Duration('1h36m'),
        title: 'Three Identical Strangers (2018)',
        url: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
        rating: 'PG-13',
      });
    });
  });

  // TODO - once theater is working.
  describe('theater getter works', () => {
    const theaterURL = 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/';
    const theaterObj = {
      name: 'Lexington Venue',
      url: theaterURL,
      address: '1794 Massachussetts Ave., Lexington, MA  02420',
      phone: '(781) 861-6161',
      _distance: 1.3,
      distanceUnit: ' mi.',
      movieListings: [],
    };
    context.theaters.set(theaterURL, theaterObj);
    const obj = new MovieListing(movieListingEl, theaterURL);
    const { theater } = obj;
    expect(theater).toEqual(theaterObj);
  });
});
