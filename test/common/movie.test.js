/* eslint-env jest */

import Duration from 'duration-js';
import { JSDOM } from 'jsdom';

import context from '../../src/js/common/context';
import Movie, { removeThisYear } from '../../src/js/common/movie';
// const Duration = require('duration-js');
// const { JSDOM } = require('jsdom');

// const context = require('../../src/js/common/context');
// const Movie = require('../../src/js/common/movie');

// const { removeThisYear } = Movie;

const html = `
<div class="moviedata">
  <div class="movietitle">
    <a href="https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/" title="Three Identical Strangers">Three Identical Strangers  (2018)</a>
  </div>
  <div class="movierating-runtime">
PG-13

| 1 hr 36 min
  </div>
</div>
`;

describe('Movie', () => {
  it('can be allocated', () => {
    const emptyData = {
      rating: '',
      runningTime: { _milliseconds: 0 },
      title: '',
      url: '',
    };

    const movie = new Movie();
    expect(movie).toMatchObject(emptyData);
  });

  it('can remove this year from title', () => {
    expect(removeThisYear('a movie title with no year')).toBe('a movie title with no year');
    expect(removeThisYear('a movie title with previous year (2000)')).toBe('a movie title with previous year (2000)');
    expect(removeThisYear(`a movie title with this year (${new Date().getFullYear().toString()})`)).toBe('a movie title with this year');
  });

  describe('can be created with a DOM node', () => {
    it('normally', () => {
      const expectedMovie = {
        rating: 'PG-13',
        runningTime: { _milliseconds: 5760000 },
        title: 'Three Identical Strangers (2018)',
        url: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
      };
      const expectedEntry = [[expectedMovie.url, expectedMovie]];
      const { document } = (new JSDOM(html)).window;
      const moviedataEl = document.querySelector('.moviedata');
      const movie = new Movie(moviedataEl);

      expect(movie).toMatchObject(expectedMovie);
      expect(Array.from(context.movies)).toMatchObject(expectedEntry);
    });

    it('missing runningtime', () => {
      const noRunningTimeHTML = `
      <div class="moviedata">
        <div class="movietitle">
          <a href="https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/" title="Three Identical Strangers">Three Identical Strangers  (2018)</a>
        </div>
        <div class="movierating-runtime">
      PG-13
      
      
        </div>
      </div>
      `;
      const expectedMovie = {
        rating: 'PG-13',
        runningTime: { _milliseconds: 0 },
        title: 'Three Identical Strangers (2018)',
        url: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
      };
      context.clear(); // Make sure the Movie object ceated here is put into context.movies
      const expectedEntry = [[expectedMovie.url, expectedMovie]];
      const { document } = (new JSDOM(noRunningTimeHTML)).window;
      const moviedataEl = document.querySelector('.moviedata');
      const movie = new Movie(moviedataEl);

      expect(movie).toMatchObject(expectedMovie);
      expect(Array.from(context.movies)).toMatchObject(expectedEntry);
    });
  });

  it('can be translated to a string', () => {
    let movie = new Movie();
    movie.runningTime = new Duration('3h21m');
    movie.rating = 'G';
    movie.title = 'A Very Long Movie';
    expect(movie.toString()).toBe('A Very Long Movie - 3:21 | G');
    movie = new Movie();
    movie.runningTime = new Duration('2h1m');
    movie.rating = 'NC-17';
    movie.title = 'A Shorter Movie';
    expect(movie.toString()).toBe('A Shorter Movie - 2:01 | NC-17');
  });
});
