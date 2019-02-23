/* eslint-env jest */

import Duration from 'duration-js';
import context from '../../src/common/context';
import Movie, { removeThisYear } from '../../src/common/movie';

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
  test('can be allocated', () => {
    const emptyData = {
      rating: '',
      runningTime: { _milliseconds: 0 },
      title: '',
      url: '',
    };

    const movie = new Movie();
    expect(movie).toMatchObject(emptyData);
  });

  test('can remove this year from title', () => {
    expect(removeThisYear('a movie title with no year')).toBe('a movie title with no year');
    expect(removeThisYear('a movie title with previous year (2000)')).toBe('a movie title with previous year (2000)');
    expect(removeThisYear(`a movie title with this year (${new Date().getFullYear().toString()})`)).toBe('a movie title with this year');
  });

  test('can be created with a DOM node', () => {
    const expectedMovie = {
      rating: 'PG-13',
      runningTime: { _milliseconds: 5760000 },
      title: 'Three Identical Strangers (2018)',
      url: 'https://www.moviefone.com/movie/three-identical-strangers/pBVodF8RCax5biHUdPdH45/main/',
    };
    const expectedEntry = [[expectedMovie.url, expectedMovie]];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const moviedataEl = doc.querySelector('.moviedata');
    const movie = new Movie(moviedataEl);

    expect(movie).toMatchObject(expectedMovie);
    expect(Array.from(context.movies)).toMatchObject(expectedEntry);
  });

  test('can be translated to a string', () => {
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