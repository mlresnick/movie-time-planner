/* eslint-env jest */

import 'colors';

import Duration from 'duration-js';
import { JSDOM } from 'jsdom';

import context from '../../src/js/common/context';
import Listing from '../../src/js/common/listing';
import Movie from '../../src/js/common/movie';
import { parseContext } from '../../src/js/webapp/helper';
import Showing from '../../src/js/common/showing';
import Showtime from '../../src/js/common/showtime';
import Theater from '../../src/js/common/theater';

const Diff = require('diff'); // Try to import this again

const theatersHTML = `
<!DOCTYPE html>
<html>
<body>
<div id="mf-theater-showtimes-list" class="showtime-list-module theater-time-module">
  <div class="theater">
    <div class="head">
      <div class="title">
        <span class="mileage">1.3 mi.</span> <a class="theater-name" href="https://www.moviefone.com/theater/lexington-venue/2042/showtimes/">Lexington Venue</a>
      </div>
      <div class="address-keys">
        <p class="address"><a href="https://www.moviefone.com/theater/lexington-venue/2042/showtimes/">1794 Massachussetts Ave., Lexington, MA  02420</a> |<span class="theater-phone">(781) 861-6161</span></p>
      </div>
    </div>
    <div class="showtimes">
      <div class="movie-listing">
        <div class="moviePoster">
          <a href="https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/" title="Three Identical Strangers"> <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://d1t80wr11ktjcz.cloudfront.net/movieposters/v7/AllPhotos/15402597/p15402597_p_v7_aa.jpg?d=270x360&amp;q=60" alt="Three Identical Strangers Poster"></a>
        </div>
        <div class="movie-data-wrap">
          <div class="moviedata">
            <div class="movietitle">
              <a href="https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/" title="Three Identical Strangers">Three Identical Strangers  (2018)</a>
            </div>
            <div class="movierating-runtime">
              PG-13 | 1 hr 36 min
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
      </div>
      <div class="movie-listing">
        <div class="moviePoster">
          <a href="https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/" title="Won't You Be My Neighbor?"> <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://dz7u9q3vpd4eo.cloudfront.net/admin-uploads/posters/wybmn1-sheet_1524086082.jpg?d=270x360&amp;q=60" alt="Won't You Be My Neighbor? Poster"></a>
        </div>
        <div class="movie-data-wrap">
          <div class="moviedata">
            <div class="movietitle">
              <a href="https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/" title="Won't You Be My Neighbor?">Won't You Be My Neighbor?  (2018)</a>
            </div>
            <div class="movierating-runtime">
              PG-13 | 1 hr 34 min
            </div>
            <div class="showtimes-list">
              <span class="stDisplay future">6:45pm</span>
              <div class="clear">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="movie-listing">
        <div class="moviePoster">
          <a href="https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/" title="Solo: A Star Wars Story"> <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://dz7u9q3vpd4eo.cloudfront.net/admin-uploads/posters/solo-poster-final_1527283999.jpg?d=270x360&amp;q=60" alt="Solo: A Star Wars Story Poster"></a>
        </div>
        <div class="movie-data-wrap">
          <div class="moviedata">
            <div class="movietitle">
              <a href="https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/" title="Solo: A Star Wars Story">Solo: A Star Wars Story  (2018)</a>
            </div>
            <div class="movierating-runtime">
              PG-13 | 2 hr 15 min
            </div>
          </div>
          <div class="showtimes-list">
            <span class="stDisplay future">1:30pm</span>
            <div class="clear">
            </div>
          </div>
        </div>
      </div>
      <div class="movie-listing">
        <div class="moviePoster">
          <a href="https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/" title="RBG"> <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://d1t80wr11ktjcz.cloudfront.net/movieposters/v7/AllPhotos/15167081/p15167081_p_v7_ab.jpg?d=270x360&amp;q=60" alt="RBG Poster"></a>
        </div>
        <div class="movie-data-wrap">
          <div class="moviedata">
            <div class="movietitle">
              <a href="https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/" title="RBG">RBG  (2018)</a>
            </div>
            <div class="movierating-runtime">
              PG | 1 hr 37 min
            </div>
          </div>
          <div class="showtimes-list">
            <span class="stDisplay future">4:15pm</span>
            <div class="clear">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="theater">
    <div class="head">
      <div class="title">
        <span class="mileage">5.4 mi.</span> <a class="theater-name" href="https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/">Belmont Studio Cinema</a>
      </div>
      <div class="address-keys">
        <p class="address"><a href="https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/">376 Trapelo Rd., Belmont, MA  02478</a> |<span class="theater-phone"> (617) 484-1706</span></p>
      </div>
    </div>
    <div class="showtimes">
      <div class="movie-listing">
        <div class="moviePoster">
          <a href="https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/" title="Won&#039;t You Be My Neighbor?"> <img class="lazy showtimes-poster" src="https://d1t80wr11ktjcz.cloudfront.net/legacy/assets/mf-no-image.png" data-src="https://dz7u9q3vpd4eo.cloudfront.net/admin-uploads/posters/wybmn1-sheet_1524086082.jpg?d=270x360&amp;q=60" alt="Won&#039;t You Be My Neighbor? Poster"></a>
        </div>
        <div class="movie-data-wrap">
          <div class="moviedata">
            <div class="movietitle">
              <a href="https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/" title="Won&#039;t You Be My Neighbor?">Won&#039;t You Be My Neighbor?  (2018)</a>
            </div>
            <div class="movierating-runtime">
              PG-13 | 1 hr 34 min
            </div>
          </div>
          <div class="showtimes-list">
            <span class="stDisplay future">3:30pm</span>
            <span class="stDisplay future">5:30pm</span>
            <span class="stDisplay future">7:30pm</span>
            <div class="clear">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
`;

const VENUE = 0;
const BELMONT = 1;
const listings = [];
listings[VENUE] = [
  {
    parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
    movieURL: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
    showings: [
      {
        parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
        showtime: '2019-02-02T14:00:00.000-05:00',
      },
      {
        parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
        showtime: '2019-02-02T16:30:00.000-05:00',
      },
      {
        parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
        showtime: '2019-02-02T19:00:00.000-05:00',
      },
    ],
  },
  {
    movieURL: 'https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
    parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
    showings: [
      {
        parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
        showtime: '2019-02-02T18:45:00.000-05:00',
      },
    ],
  },
  {
    movieURL: 'https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/',
    parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
    showings: [
      {
        parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/',
        showtime: '2019-02-02T13:30:00.000-05:00',
      },
    ],
  },
  {
    movieURL: 'https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/',
    parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
    showings: [
      {
        parentId: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/',
        showtime: '2019-02-02T16:15:00.000-05:00',
      },
    ],
  },
];

listings[BELMONT] = [
  {
    movieURL: 'https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
    parentId: 'https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/',
    showings: [
      {
        parentId: 'https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
        showtime: '2019-02-02T15:30:00.000-05:00',
      },
      {
        parentId: 'https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
        showtime: '2019-02-02T17:30:00.000-05:00',
      },
      {
        parentId: 'https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
        showtime: '2019-02-02T19:30:00.000-05:00',
      },
    ],
  },
];

const expectedStructure = {
  durations: {
    entrance: 5,
    preview: 20,
    exit: 5,
  },
  listings: [
    [
      'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
      listings[VENUE][0],
    ],
    [
      'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
      listings[VENUE][1],
    ],
    [
      'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/',
      listings[VENUE][2],
    ],
    [
      'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/',
      listings[VENUE][3],
    ],
    [
      'https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
      listings[BELMONT][0],
    ],
  ],
  movies: [
    [
      'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
      {
        parentId: null,
        rating: 'PG-13',
        runningTime: { _milliseconds: (new Duration('1h36m')).valueOf() },
        title: 'Three Identical Strangers (2018)',
        url: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
      },
    ],
    [
      'https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
      {
        parentId: null,
        rating: 'PG-13',
        runningTime: { _milliseconds: (new Duration('1h34m')).valueOf() },
        title: "Won't You Be My Neighbor? (2018)",
        url: 'https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/',
      },
    ],
    [
      'https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/',
      {
        parentId: null,
        rating: 'PG-13',
        runningTime: { _milliseconds: (new Duration('2h15m')).valueOf() },
        title: 'Solo: A Star Wars Story (2018)',
        url: 'https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/',
      },
    ],
    [
      'https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/',
      {
        parentId: null,
        rating: 'PG',
        runningTime: { _milliseconds: (new Duration('1h37m')).valueOf() },
        title: 'RBG (2018)',
        url: 'https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/',
      },
    ],
  ],
  remaining: {
    listings: {},
    movies: {},
    theaters: {},
  },
  requestedDate: '2019-02-02T05:00:00.000Z',
  theaters: [
    [
      'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
      {
        _distance: 1.3,
        address: '1794 Massachussetts Ave., Lexington, MA 02420',
        distanceUnit: 'mi.',
        movieListings: [
          listings[VENUE][0],
          listings[VENUE][1],
          listings[VENUE][2],
          listings[VENUE][3],
        ],
        name: 'Lexington Venue',
        parentId: null,
        phone: '(781) 861-6161',
        url: 'https://www.moviefone.com/theater/lexington-venue/2042/showtimes/',
      },
    ],
    [
      'https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/',
      {
        _distance: 5.4,
        address: '376 Trapelo Rd., Belmont, MA 02478',
        distanceUnit: 'mi.',
        movieListings: [
          listings[BELMONT][0],
        ],
        name: 'Belmont Studio Cinema',
        parentId: null,
        phone: '(617) 484-1706',
        url: 'https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/',
      },
    ],
  ],
};

const expectedJSON = `{
  "durations": {
    "entrance": 5,
    "preview": 20,
    "exit": 5
  },
  "listings": [
    [
      "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/",
      {
        "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/",
        "movieURL": "https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/",
        "showings": [
          {
            "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/",
            "showtime": "2019-02-02T14:00:00.000-05:00"
          },
          {
            "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/",
            "showtime": "2019-02-02T16:30:00.000-05:00"
          },
          {
            "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/",
            "showtime": "2019-02-02T19:00:00.000-05:00"
          }
        ]
      }
    ],
    [
      "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
      {
        "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/",
        "movieURL": "https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
        "showings": [
          {
            "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
            "showtime": "2019-02-02T18:45:00.000-05:00"
          }
        ]
      }
    ],
    [
      "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/",
      {
        "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/",
        "movieURL": "https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/",
        "showings": [
          {
            "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/",
            "showtime": "2019-02-02T13:30:00.000-05:00"
          }
        ]
      }
    ],
    [
      "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/",
      {
        "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/",
        "movieURL": "https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/",
        "showings": [
          {
            "parentId": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/",
            "showtime": "2019-02-02T16:15:00.000-05:00"
          }
        ]
      }
    ],
    [
      "https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
      {
        "parentId": "https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/",
        "movieURL": "https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
        "showings": [
          {
            "parentId": "https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
            "showtime": "2019-02-02T15:30:00.000-05:00"
          },
          {
            "parentId": "https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
            "showtime": "2019-02-02T17:30:00.000-05:00"
          },
          {
            "parentId": "https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
            "showtime": "2019-02-02T19:30:00.000-05:00"
          }
        ]
      }
    ]
  ],
  "movies": [
    [
      "https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/",
      {
        "parentId": null,
        "rating": "PG-13",
        "runningTime": {
          "_milliseconds": ${(new Duration('1h36m')).valueOf()}
        },
        "title": "Three Identical Strangers (2018)",
        "url": "https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/"
      }
    ],
    [
      "https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
      {
        "parentId": null,
        "rating": "PG-13",
        "runningTime": {
          "_milliseconds": ${(new Duration('1h34m')).valueOf()}
        },
        "title": "Won't You Be My Neighbor? (2018)",
        "url": "https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/"
      }
    ],
    [
      "https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/",
      {
        "parentId": null,
        "rating": "PG-13",
        "runningTime": {
          "_milliseconds": ${(new Duration('2h15m')).valueOf()}
        },
        "title": "Solo: A Star Wars Story (2018)",
        "url": "https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/"
      }
    ],
    [
      "https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/",
      {
        "parentId": null,
        "rating": "PG",
        "runningTime": {
          "_milliseconds": ${(new Duration('1h37m')).valueOf()}
        },
        "title": "RBG (2018)",
        "url": "https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/"
      }
    ]
  ],
  "requestedDate": "2019-02-02T05:00:00.000Z",
  "remaining": {
    "listingIds": {},
    "movieIds": {},
    "theaterIds": {}
  },
  "theaters": [
    [
      "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/",
      {
        "parentId": null,
        "name": "Lexington Venue",
        "url": "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/",
        "address": "1794 Massachussetts Ave., Lexington, MA 02420",
        "phone": "(781) 861-6161",
        "_distance": 1.3,
        "distanceUnit": "mi.",
        "movieListings": [
          "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/",
          "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/",
          "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/solo-a-star-wars-story/uIv4AtOo8b9KZwtAZ3dU11/main/",
          "https://www.moviefone.com/theater/lexington-venue/2042/showtimes/,https://www.moviefone.com/movie/rbg/ET6Xj4o8kksEK6ugClFr35/main/"
        ]
      }
    ],
    [
      "https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/",
      {
        "parentId": null,
        "name": "Belmont Studio Cinema",
        "url": "https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/",
        "address": "376 Trapelo Rd., Belmont, MA 02478",
        "phone": "(617) 484-1706",
        "_distance": 5.4,
        "distanceUnit": "mi.",
        "movieListings": [
          "https://www.moviefone.com/theater/belmont-studio-cinema/2051/showtimes/,https://www.moviefone.com/movie/wont-you-be-my-neighbor/VISsqkBXMqqiRuM6rUJqh4/main/"
        ]
      }
    ]
  ]
}`;

context.requestedDate = new Date(2019, 1, 2, 0, 0, 0, 0);

const { document } = new JSDOM(theatersHTML).window;

// Theaters, movies and listing will be automaticaoly inserted into the context object.
Array.from(document.querySelectorAll('.theater')).map(theaterEl => new Theater(theaterEl));


describe('Serialization', () => {
  it('works correctly', () => {
    const receivedJSON = JSON.stringify(context, null, 2);
    const diffList = Diff.diffLines(expectedJSON, receivedJSON);
    if (diffList.some(part => (part.added || part.removed))) {
      diffList.forEach((part) => {
        let color;
        switch (true) {
          case part.added: color = 'green'; break;
          case part.removed: color = 'red'; break;
          default: color = 'grey';
        }
        process.stderr.write(part.value[color]);
      });
      expect(receivedJSON).toBe(expectedJSON);
    }
  });

  describe('followed by a parse', () => {
    const theatersJSON = JSON.stringify(context);

    const expected = Object.assign({}, expectedStructure);

    function setClass(object, clazz) {
      Object.setPrototypeOf(object, clazz.prototype);
    }

    expected.theaters.forEach(theater => setClass(theater[1], Theater));

    const ctx = parseContext(theatersJSON);

    it('has movie listings', () => {
      ctx.listings
        .forEach((listing) => {
          expect(listing).toBeInstanceOf(Listing);
          listing.showings.forEach((showing) => {
            expect(showing).toBeInstanceOf(Showing);
            expect(showing.showtime).toBeInstanceOf(Showtime);
          });
        });
    });

    // TODO fix
    xit('has movies', () => {
      ctx.movies.forEach((movie) => {
        expect(movie).toBeInstanceOf(Movie);
        expect(movie.runningTime).toBeInstanceOf(Duration);
      });
    });

    it('has theaters', () => {
      ctx.theaters.forEach((theater) => {
        expect(theater).toBeInstanceOf(Theater);
        theater.movieListings.forEach(listing => expect(listing).toBeInstanceOf(Listing));
      });
    });
  });
});
