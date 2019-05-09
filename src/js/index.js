/* global Framework7 */

import context from './common/context.js';
import { getRemainingShowings, parseContext } from './webapp/helper.js';
import Showtime from './common/showtime.js';
import Util from './common/util.js';

let framework7;
let progressbarEl;

function initFramework7() {
  framework7 = new Framework7({
    root: '#app',
    name: 'Movie Time Planner',
    id: 'com.example.fmtp',
  });

  ['#view-filters', '#view-theaters', '#view-movies', '#view-results']
    .forEach(viewName => framework7.views.create(viewName));
}

function getLocationForm() { return document.getElementById('location-form'); }

function getLocationFormData() {
  const locationForm = getLocationForm();
  let result = null;

  if (locationForm.reportValidity()) {
    result = {
      zipCode: locationForm.querySelector('input[name="zip-code"]').value,
      maxDistance: locationForm.querySelector('input[name="max-distance"]').value,
    };
  }

  return result;
}

async function retrieveMovieInfo() {
  const locationFormData = getLocationFormData();
  if (locationFormData) {
    const { zipCode, maxDistance } = locationFormData;

    const response = await fetch(
      `/zip-code/${zipCode}${(maxDistance === '') ? '' : `?max-distance=${maxDistance}`}`,
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

function sortedListToSelectionHTML(arg) {
  const { listEl, object, listType } = arg;
  const listName = `${listType}Ids`;

  let noMoreShowingsClass = '';
  let disabled = '';
  if (context.remaining[listName].has(object.id)) {
    listEl.classList.remove('no-more-showings');
  }
  else {
    noMoreShowingsClass = ' class="no-more-showings"';
    disabled = ' disabled=""';
  }

  return `<li${noMoreShowingsClass}>
    <label class="item-checkbox item-content">
      <input type="checkbox"${disabled} value="${object.id}">
      <span class="icon icon-checkbox"></span>
      <div class="item-inner">
        <div class="item-title">
          ${object.name}
          <div class="item-footer">${object.footer}</div>
        </div>
      </div>
    </label>
  </li>`;
}

function updateSelectionList(listType) {
  const listName = `${listType}s`;
  const viewName = `#view-${listName}`;

  const listEl = document.querySelector(`${viewName} .list`);
  listEl.classList.add('no-more-showings');
  listEl.querySelector('ul').innerHTML = Array.from(context[`${listName}`].values())
    .sort((lhs, rhs) => Util.compareWOArticles(lhs.name, rhs.name))
    // Add info from current context.
    .map(object => ({ listEl, object, listType }))
    .map(sortedListToSelectionHTML)
    .join('\n');
}

function groupByTime(timeList, showing) {
  let showtimeList = timeList.get(showing.showtime);

  if (typeof showtimeList === 'undefined') {
    showtimeList = [];
    timeList.set(showing.showtime, showtimeList);
  }

  showtimeList.push(showing);
  return timeList;
}

function showingToListItem(showing) {
  return ''
   + `<li>
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

function timeListEntryToListGroup(timeListEntry) {
  const [showtime, showings] = timeListEntry;

  return ''
    + `<div class="list-group">
      <ul>
        <li class="list-group-title">${showtime}</li>
        ${showings.map(showingToListItem).join('\n')}
      </ul>
    </div>
    `;
}

function getCheckboxEls(listType) {
  const allEls = Array.from(
    document.querySelectorAll(`#view-${listType} .page-content .list li input[type="checkbox"]`)
  );
  const selectedEls = allEls.filter(el => el.checked);
  return { allEls, selectedEls };
}
/*
 * Look though the list items. If a list item has a checked
 * element record that elements value in a Set.
 */
function getSelectedSet(listType) {
  const selectedValues = getCheckboxEls(listType).selectedEls.map(el => el.value);
  return new Set(selectedValues);
}

function allSelected(viewEl) {
  const listEl = viewEl.querySelector('.page-content .list');
  const allElList = Array.from(listEl.querySelectorAll('li input[type="checkbox"]'));
  const selectedElList = allElList.filter(el => el.checked);

  return (allElList.length === selectedElList.length);
}

function updateResults() {
  const resultListEl = document.querySelector('#view-results .list');

  // Build here, so it doesn't need to be redone for every showing
  const selected = {
    movies: getSelectedSet('movies'),
    theaters: getSelectedSet('theaters'),
  };

  const timeMap = getRemainingShowings(selected).reduce(groupByTime, new Map());

  resultListEl.innerHTML = Array.from(timeMap.entries())
    .map(timeListEntryToListGroup)
    .join('\n');

  resultListEl.classList.toggle('no-more-showings', timeMap.size === 0);
}

async function updateOtherTabs() {
  progressbarEl = framework7.progressbar.show();

  await retrieveMovieInfo();

  context.remaining.clear();
  Array.from(context.listings.values()).reduce(buildRemainingLists, context.remaining);

  ['theater', 'movie'].forEach(updateSelectionList);

  updateResults();

  framework7.progressbar.hide(progressbarEl);
}

async function handleGetInfo() {
  // TODO validate form before moving on.
  await updateOtherTabs();
  document.querySelector('.tabbar a[href="#view-theaters"]').click();
}

function getViewElFromEvent(event) {
  const composedPath = event.composedPath();
  const viewEl = composedPath.find(el => el.id.startsWith('view-'));

  if (typeof viewEl === 'undefined') {
    throw new Error(`Did not find a view element in ${composedPath}`);
  }

  return viewEl;
}

function updateOnClickCheckbox(event) {
  const viewEl = getViewElFromEvent(event);
  viewEl.querySelector('.mark-clear').classList.toggle('all-selected', allSelected(viewEl));

  updateResults();

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

function saveTheaters() {
  const { selectedEls } = getCheckboxEls('theaters');
  const selectedValues = selectedEls.map(el => el.value);
  localStorage.setItem('theaters', JSON.stringify(selectedValues));
}

function eraseTheaters() {
  localStorage.removeItem('theaters');
  getCheckboxEls('theaters')
    .selectedEls
    .forEach((el) => { el.checked = false; });
}

function saveLocation() {
  const locationFormData = getLocationFormData();
  if (locationFormData) {
    localStorage.setItem('location', JSON.stringify(locationFormData));
  }
}

function eraseLocation() {
  const locationForm = getLocationForm();

  eraseTheaters();

  localStorage.removeItem('location');
  locationForm.querySelector('input[name="zip-code"]').value = '';
  locationForm.querySelector('input[name="max-distance"]').value = 5;
}

async function locationInitialized() {
  let retval = false;

  const locationJSON = localStorage.getItem('location');
  if (locationJSON) {
    const locationForm = getLocationForm();
    const location = JSON.parse(locationJSON);
    locationForm.querySelector('input[name="zip-code"]').value = location.zipCode;
    locationForm.querySelector('input[name="max-distance"]').value = location.maxDistance;
    await updateOtherTabs();
    retval = true;
  }

  return retval;
}

function theatersInitialized() {
  let retval = false;

  const selectedTheatersJSON = localStorage.getItem('theaters');
  if (selectedTheatersJSON) {
    const selectedTheaters = JSON.parse(selectedTheatersJSON);
    selectedTheaters
      .forEach((theaterId) => {
        const el = document
          .querySelector(`#view-theaters li input[type="checkbox"][value="${theaterId}"`);
        if (el) {
          el.checked = true;
        }
      });
    updateResults();
    retval = true;
  }
  return retval;
}

document.addEventListener('DOMContentLoaded', async () => {
  initFramework7();

  document.querySelector('#view-filters .button.get-info').addEventListener('click', await handleGetInfo);

  document.querySelector('.popup-remember-location .confirm-remember').addEventListener('click', saveLocation);

  document.querySelector('.popup-remember-location .erase-remember').addEventListener('click', eraseLocation);

  document.querySelector('.popup-remember-theaters .confirm-remember').addEventListener('click', saveTheaters);

  document.querySelector('.popup-remember-theaters .erase-remember').addEventListener('click', eraseTheaters);

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

  // XXX remove
  document.querySelector('#location-form input[name="zip-code"]').value = '02421';
});
