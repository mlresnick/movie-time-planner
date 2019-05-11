import context from '../common/context.js';
import Showtime from '../common/showtime.js';

import { getRemainingShowings } from './helper.js';

let instance = null;

function groupByTime(timeList, showing) {
  const milliseconds = showing.showtime.valueOf();
  let showtimeList = timeList.get(milliseconds);

  if (typeof showtimeList === 'undefined') {
    showtimeList = [];
    timeList.set(milliseconds, showtimeList);
  }

  showtimeList.push(showing);
  return timeList;
}

function showingToHTML(showing) {
  // eslint-disable-next-line operator-linebreak
  return '' +
    `<li>
        <div class="item-content">
          <div class="item-inner">
            <div class="item-title">
              ${showing.movie.title}
              <div class="item-footer">${showing.theater.name}</div>
            </div>
          </div>
        </div>
      </li>
    `;
}

function timeListEntryToHTML(timeListEntry) {
  const [showtime, showings] = timeListEntry;

  // eslint-disable-next-line operator-linebreak
  return '' +
    `<div class="list-group">
        <ul>
          <li class="list-group-title">${showtime}</li>
          ${showings.map(showingToHTML).join('\n')}
        </ul>
      </div>
    `;
}

function millisecondsToShowtime(entry) {
  const [milliseconds, showing] = entry;
  return [new Showtime(milliseconds), showing];
}


export default class ResultList {
  constructor(isInternal = false) {
    if (isInternal) {
      this.el = document.querySelector('#view-results .list');
    }
    else {
      throw new Error('Cannot allocate ResultList. Use ResultList.getInstance().');
    }
  }

  static getInstance() {
    if (!instance) {
      instance = new ResultList(/* isInternal */ true);
    }
    return instance;
  }

  update() {
    const { framework7 } = context;

    // Build here, so it doesn't need to be redone for every showing
    const selected = {
      movies: framework7.movieList.getSelectedValues(),
      theaters: framework7.theaterList.getSelectedValues(),
    };

    const timeMap = getRemainingShowings(selected).reduce(groupByTime, new Map());

    this.el.innerHTML = Array.from(timeMap.entries())
      .map(millisecondsToShowtime)
      .map(timeListEntryToHTML)
      .join('\n');

    this.el.classList.toggle('no-more-showings', timeMap.size === 0);
  }
}
