/* global Framework7 */

import context, { ContextMap } from './common/context.js';
import Duration from './common/duration.js';
import Listing from './common/listing.js';
import Movie from './common/movie.js';
import Showing from './common/showing.js';
import Showtime from './common/showtime.js';
import Theater from './common/theater.js';
import Util from './common/util.js';
//
// UI
import LocationForm from './webapp/location-form.js';
import MovieList from './webapp/movie-list.js';
import ResultList from './webapp/result-list.js';
import TheaterList from './webapp/theater-list.js';

let progressbarEl;

function initFramework7() {
  context.framework7 = new Framework7({
    root: '#app',
    name: 'Movie Time Planner',
    id: 'com.example.fmtp',
  });

  const { framework7 } = context;

  ['#view-filters', '#view-theaters', '#view-movies', '#view-results']
    .forEach(viewName => framework7.views.create(viewName));

  framework7.locationForm = LocationForm.getInstance();
  framework7.theaterList = TheaterList.getInstance();
  framework7.movieList = MovieList.getInstance();
  framework7.resultList = ResultList.getInstance();
}

// The 'value' for listings, movies, showtimes and theaters are
// entry arrays ([ [k, v], [k, v], [k, v], ... ]).
function reviver(key, value) {
  function buildContextMap(clazz, list) {
    const retval = new ContextMap();
    list.forEach((entry) => {
      const [k, v] = entry;
      const typedV = Object.setPrototypeOf(v, clazz.prototype);
      retval.set(k, typedV);
    });
    return retval;
  }

  let retval;

  switch (key) {
    case 'listings':
      retval = buildContextMap(Listing, value);
      break;

    case 'movies':
      retval = buildContextMap(Movie, value);
      break;

    case 'runningTime':
      retval = new Duration(value._milliseconds); // eslint-disable-line no-underscore-dangle
      break;

    case 'showings':
      retval = [];
      value.forEach((v) => {
        const listing = Object.setPrototypeOf(v, Showing.prototype);
        retval.push(listing);
      });
      break;

    case 'showtime':
      retval = new Showtime(value);
      break;

    case 'theaters':
      retval = buildContextMap(Theater, value);
      break;

    default:
      retval = value;
  }

  return retval;
}

function parseContext(contextJSON) {
  const localContext = JSON.parse(contextJSON, reviver);
  localContext.theaters.forEach((theater) => {
    // eslint-disable-next-line no-param-reassign
    theater.movieListings = theater.movieListings.map(
      listingId => localContext.listings.get(listingId)
    );
    // TODO create context.remaining.showings using method change just put into util
    // the Util method can probably be removed.
    // It doesn't belong here, it belongs wherever the other remaining lists are created.
  });
  return localContext;
}

async function retrieveMovieInfo() {
  const { locationForm } = context.framework7;

  if (locationForm.reportValidity()) {
    const response = await fetch(
      `/zip-code/${locationForm.zipCode}`
      + `${(locationForm.maxDistance === '') ? '' : `?max-distance=${locationForm.maxDistance}`}`,
    );

    if (Util.isInInterval(response.status, '[200, 300)') || (response.status === 304)) {
      const contextJSON = await response.text();
      const localContext = parseContext(contextJSON); // JSON.parse(contextJSON, reviver);
      ['movies', 'theaters', 'listings', 'requestedDate'].forEach((member) => {
        context[member] = localContext[member];
      });
    }
  }
}

function buildRemainingLists(remaining, listing) {
  if (listing.areShowingsAfter(Showtime.now)) {
    remaining.movieIds.add(listing.movie.id);
    remaining.theaterIds.add(listing.theater.id);
    remaining.listingIds.add(listing.id);
  }
  return remaining;
}

async function updateOtherTabs() {
  const { framework7 } = context;
  progressbarEl = framework7.progressbar.show();

  await retrieveMovieInfo();

  // TODO move the following two lines into context.rebuildRemainingLists()
  //      and call that instead.
  context.remaining.clear();
  Array.from(context.listings.values()).reduce(buildRemainingLists, context.remaining);

  framework7.theaterList.update();
  framework7.movieList.update();

  framework7.resultList.update();

  framework7.progressbar.hide(progressbarEl);
}

async function handleGetInfo() {
  if (context.framework7.locationForm.reportValidity()) {
    await updateOtherTabs();
    document.querySelector('.tabbar a[href="#view-theaters"]').click();
  }
}

function getViewElFromEvent(event) {
  const composedPath = event.composedPath();
  const viewEl = composedPath.find(el => el.id.startsWith('view-'));

  if (typeof viewEl === 'undefined') {
    throw new Error(`Did not find a view element in ${composedPath}`);
  }

  return viewEl;
}

// TODO
//  function updateOnClickCheckbox(event) {
//   const viewEl = getViewElFromEvent(event);
//   viewEl.querySelector('.mark-clear').classList.toggle('all-selected', allSelected(viewEl));
function updateOnClickCheckbox() {
  context.framework7.resultList.update();

  return true;
}

function affectAllCheckboxes(event) {
  const allSelectClass = 'all-selected';
  const viewEl = getViewElFromEvent(event);
  const { classList } = viewEl.querySelector('.mark-clear');
  const newCheckedValue = !classList.contains(allSelectClass);

  viewEl.querySelectorAll('.page-content .list li input[type="checkbox"]')
    .forEach((el) => { el.checked = newCheckedValue; });

  classList.toggle(allSelectClass);
}


function saveLocation() { context.framework7.locationForm.save(); }

function eraseLocation() {
  const { framework7 } = context;
  framework7.theaterList.erase();
  framework7.locationForm.erase();
}

function saveTheaters() { context.framework7.theaterList.save(); }

function eraseTheaters() { context.framework7.theaterList.erase(); }

async function locationInitialized() {
  const { locationForm } = context.framework7;
  let retval = false;

  locationForm.load();
  if (locationForm.zipCode !== '') {
    await updateOtherTabs();
    retval = true;
  }

  return retval;
}

function theatersInitialized() {
  let retval = false;
  const { framework7 } = context;

  if (framework7.theaterList.load()) {
    framework7.resultList.update();
    retval = true;
  }

  return retval;
}

function saveLocationPopupHandler() {
  const { framework7 } = context;
  if (framework7.locationForm.reportValidity()) {
    const popupEl = document.querySelector('.popup-remember-location');
    const popup = framework7.popup.get(popupEl) || framework7.popup.create({ el: popupEl });

    popup.open(true);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initFramework7();

  document.querySelector('#view-filters .button.get-info')
    .addEventListener('click', await handleGetInfo);

  document.querySelector('#view-filters .navbar .right .link')
    .addEventListener('click', saveLocationPopupHandler);

  document.querySelector('.popup-remember-location .confirm-remember')
    .addEventListener('click', saveLocation);

  document.querySelector('.popup-remember-location .erase-remember')
    .addEventListener('click', eraseLocation);

  document.querySelector('.popup-remember-theaters .confirm-remember')
    .addEventListener('click', saveTheaters);

  document.querySelector('.popup-remember-theaters .erase-remember')
    .addEventListener('click', eraseTheaters);

  document.querySelectorAll('.selection-view')
    .forEach((viewEl) => {
      viewEl.querySelector('.list ul').addEventListener('click', updateOnClickCheckbox);
      viewEl.querySelector('.mark-clear').addEventListener('click', affectAllCheckboxes);
    });

  // Depending on what information is stored, display a tab:
  // * If we know the location and list of theaters, display the movies tab.
  // * If we only know the location, display the theaters tab.
  // * If nothing is stored, display the filters tab.
  if (await locationInitialized()) {
    if (theatersInitialized()) {
      document.querySelector('.tabbar a[href="#view-movies"]').click();
    }
    else {
      document.querySelector('.tabbar a[href="#view-theaters"]').click();
    }
  }
  else {
    // TODO - if not stored, initialize location to current location.
  }
});
