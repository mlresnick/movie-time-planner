import { JSDOM } from 'jsdom';
import context from '../../src/common/context';
import Theater from '../../src/common/theater';

context.requestedDate = new Date();

describe('theater', () => {
  const theaterHTML = `
    <div class="theater">
      <div class="head">
        <div class="title">
          <span class="mileage">1.3 mi.</span>
          <a class="theater-name" href="https://www.moviefone.com/theater/lexington-venue/2042/showtimes/">Lexington Venue</a>
        </div>
        <div class="address-keys">
          <p class="address">
            <a href="https://www.moviefone.com/theater/lexington-venue/2042/showtimes/">1794 Massachussetts Ave., Lexington, MA  02420</a>
            |
            <span class="theater-phone">(781) 861-6161</span>
          </p>
        </div>
      </div>
      <div class="showtimes">
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
              <div class="clear"></div>
            </div>
          </div>
        </div>
        <div class="movie-listing">
          <div class="moviePoster">
            <a href="https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/" title="Won&#039;t You Be My Neighbor?">
              <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://dz7u9q3vpd4eo.cloudfront.net/admin-uploads/posters/wybmn1-sheet_1524086082.jpg?d=270x360&amp;q=60" alt="Won&#039;t You Be My Neighbor? Poster">
            </a>
          </div>
          <div class="movie-data-wrap">
            <div class="moviedata">
              <div class="movietitle">
                <a href="https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/" title="Won&#039;t You Be My Neighbor?">Won&#039;t You Be My Neighbor?  (2018)</a>
              </div>
              <div class="movierating-runtime">
                PG-13
                
                | 1 hr 34 min
              </div>
            </div>
            <div class="showtimes-list">
              <span class="stDisplay future">6:45pm</span>
              <div class="clear"></div>
            </div>
          </div>
        </div>
        <div class="movie-listing">
          <div class="moviePoster">
            <a href="https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/" title="Solo: A Star Wars Story">
              <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://dz7u9q3vpd4eo.cloudfront.net/admin-uploads/posters/solo-poster-final_1527283999.jpg?d=270x360&amp;q=60" alt="Solo: A Star Wars Story Poster">
            </a>
          </div>
          <div class="movie-data-wrap">
            <div class="moviedata">
              <div class="movietitle">
                <a href="https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/" title="Solo: A Star Wars Story">Solo: A Star Wars Story  (2018)</a>
              </div>
              <div class="movierating-runtime">
                PG-13
              
                | 2 hr 15 min
              </div>
            </div>
            <div class="showtimes-list">
              <span class="stDisplay future">1:30pm</span>
              <div class="clear"></div>
            </div>
          </div>
        </div>
        <div class="movie-listing">
          <div class="moviePoster">
            <a href="https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/" title="RBG">
              <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://d1t80wr11ktjcz.cloudfront.net/movieposters/v7/AllPhotos/15167081/p15167081_p_v7_ab.jpg?d=270x360&amp;q=60" alt="RBG Poster">
            </a>
          </div>
          <div class="movie-data-wrap">
            <div class="moviedata">
              <div class="movietitle">
                <a href="https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/" title="RBG">RBG  (2018)</a>
              </div>
              <div class="movierating-runtime">
                PG
                
                | 1 hr 37 min
              </div>
            </div>
            <div class="showtimes-list">
              <span class="stDisplay future">4:15pm</span>
              <div class="clear"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  const { document } = new JSDOM(theaterHTML).window;

  describe('can be created with', () => {
    it('no arguments', () => {
      const obj = new Theater();
      expect(obj).toBeDefined();
      expect(obj).toEqual({
        name: '',
        url: '',
        address: '',
        phone: '',
        _distance: 0,
        distanceUnit: '',
        movieListings: [],
        parentId: null,
      });
    });

    it('a theater-only element', () => {
      const theaterOnlyHTML = `
        <div class="theater">
          <div class="head">
            <div class="title">
              <span class="mileage">1.3 mi.</span>
              <a class="theater-name" href="https://www.moviefone.com/theater/lexington-venue/2042/showtimes/">Lexington Venue</a>
            </div>
            <div class="address-keys">
              <p class="address">
                <a href="https://www.moviefone.com/theater/lexington-venue/2042/showtimes/">1794 Massachussetts Ave., Lexington, MA  02420</a>
                |
                <span class="theater-phone">(781) 861-6161</span>
              </p>
            </div>
          </div>
          <div class="showtimes">
          </div>
        </div>
      `;
      const theaterOnlyDocument = new JSDOM(theaterOnlyHTML).window.document;
      const theaterEl = theaterOnlyDocument.querySelector('.theater');
      const theater = new Theater(theaterEl);
      expect(theater).toMatchObject({
        name: 'Lexington Venue',
        url: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
        address: '1794 Massachussetts Ave., Lexington, MA 02420',
        phone: '(781) 861-6161',
        _distance: 1.3,
        distanceUnit: 'mi.',
        movieListings: [],
      });
    });
  });

  it('a full theater element', () => {
    const theaterEl = document.querySelector('.theater');
    const theater = new Theater(theaterEl);
    expect(theater).toMatchObject({
      name: 'Lexington Venue',
      url: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
      address: '1794 Massachussetts Ave., Lexington, MA 02420',
      phone: '(781) 861-6161',
      _distance: 1.3,
      distanceUnit: 'mi.',
      movieListings: [
        'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
        'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
        'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/',
        'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/',
      ],
    });
  });

  describe('distance', () => {
    it('setter works', () => {
      const theaterEl = document.querySelector('.theater');
      const theater = new Theater(theaterEl);
      theater.distanceString = '57.3 km.';
      expect({
        distance: theater._distance, // eslint-disable-line no-underscore-dangle
        units: theater.distanceUnit,
      }).toEqual({
        distance: 57.3,
        units: 'km.',
      });
    });

    it('getter works', () => {
      const theaterEl = document.querySelector('.theater');
      const theater = new Theater(theaterEl);
      const distance = '18.7 yds.';
      theater.distanceString = distance;
      expect(theater.distanceString).toBe(distance);
      expect(theater.distance).toBe(18.7);
    });
  });
});
