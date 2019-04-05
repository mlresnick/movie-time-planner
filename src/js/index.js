import Framework7 from '../../lib/framework7/js/framework7';

import context from './common/context.js';
import { getRemainingShowings, parseContext } from './webapp/helper.js';
import Showtime from './common/showtime.js';
import Util from './common/util.js';

let framework7;
let progressbarEl;

function initFramework7() {
  // Framework7 App main instance
  framework7 = new Framework7({
    root: '#app', // App root element
    id: 'io.framework7.testapp', // App bundle ID
    name: 'Framework7', // App name
    theme: 'auto', // Automatic theme detection
    // TODO (maybe) routes
  });

  // Init/Create views
  ['#view-location', '#view-theaters', '#view-movies', '#view-results']
    .forEach(viewName => framework7.views.create(viewName));
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

// TODO RINN
// function showingToHTML(showing, index, showings) {
//   const { movie, theater } = showing;
//   const showtime = (Showtime.compare(showing.showtime, previousShowtime) !== 0)
//     ? showing.showtime
//     : '&nbsp;';
//   previousShowtime = showing.showtime;

//   `<li>
//     <div class="item-content">
//       <div class="item-inner">
//         <div class="item-title>${movie.title}</div>
//       </div>
//     </div>
//   </li>`;
// }

// TODO RINN
// function setBadges() {
//   ['theaters', 'movies'].forEach(buttonType => {
//     document.querySelectorAll(`.toolbar-bottom .tab-link[href="#view-${buttonType}"] .icon`)
//       .forEach(
//         iconEl => iconEl.innerHTML = `${iconEl.innerHTML}`
//           + `<span class="badge">${context[buttonType].size}</span>`
//       );
//   });
// }

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

function groupByTime(timeList, showing, index, showings) {
  let result = timeList;

  if (typeof result[showing.showtime] === 'undefined') {
    result[showing.showtime] = [];
  }
  result[showing.showtime].push(showing);

  // If this is the last entry, return an array of the accumulator object's entries, rather than the
  // object itself.
  if (index === (showings.length - 1)) {
    result = Object.entries(timeList);
  }
  return result;
}

/*
 * Look though the list items. If a list item has a checked
 * element record that elements value in a Set.
 */
function getSelectedSet(listType) {
  let selectedEls;

  const selector = `#view-${listType} .page-content .list li input[type="checkbox"]`;

  selectedEls = document.querySelectorAll(`${selector}:checked`);

  // If none are checked, use them all.
  if (selectedEls.length === 0) {
    selectedEls = document.querySelectorAll(selector);
  }

  return new Set(Array.from(selectedEls).map(el => el.value));
}


function updateResults() {
  const selected = {
    movies: getSelectedSet('movies'),
    theaters: getSelectedSet('theaters'),
  };

  document.querySelector('#view-results .list').innerHTML = getRemainingShowings(selected)
    .reduce(groupByTime, {})
    .map(timeListEntryToListGroup)
    .join('\n');
}

async function retrieveMovieInfo() {
  const locationForm = document.getElementById('location-form');
  if (locationForm.reportValidity()) {
    const zipCode = locationForm.querySelector('input[name="zip-code"]').value;
    const maxDistance = locationForm.querySelector('input[name="max-distance"]').value;
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

async function updateOtherTabs() {
  progressbarEl = framework7.progressbar.show();

  await retrieveMovieInfo();

  context.remaining.clear();
  Array.from(context.listings.values()).reduce(buildRemainingLists, context.remaining);

  ['theater', 'movie'].forEach(updateSelectionList);

  updateResults();

  framework7.progressbar.hide(progressbarEl);
}

// TODO RINN
// // TODO move to after set up
// const theatersTabButton =
//   document.querySelector('.toolbar-bottom .tab-link[href="#view-theaters"]');
// theatersTabButton.click();

// // Add badges

// context.remaining.clear();
// Array.from(context.listings.values()).reduce(buildRemainingLists, context.remaining);

// TODO RINN
// ['theater', 'movie'].forEach((objectType) => {
//   const objectList = `${objectType}s`;

//   const listEl = document.querySelector(`#view-${objectList} .list`);
//   listEl.classList.add('no-more-showings');
//   listEl.querySelector('ul').innerHTML =
//     Array.from(context[`${objectList}`].values())
//       .sort((lhs, rhs) => Util.compareWOArticles(lhs.name, rhs.name))
//       // Add info from current context.
//       .map(object => { return { listEl, object, objectType }; })
//       .map(sortedListToSelectionHTML)
//       .join('\n');

// });
/*
      function showingToListItem(showing) {
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

      function timeListEntryToListGroup(timeListEntry) {
        const [showtime, showings] = timeListEntry;

        return '' +
          `<div class="list-group">
            <ul>
              <li class="list-group-title">${showtime}</li>
              ${showings
                .map(showingToListItem)
                .join('\n')}
            </ul>
          </div>
          `;
        }

      function groupByTime(timeList, showing, index, showings) {
        let result = timeList;

        if  (typeof timeList[showing.showtime] === 'undefined' ) {
          timeList[showing.showtime] = []
        }
        timeList[showing.showtime].push(showing)

        // If this is the last entry, return an array of thd object's entries, rather than the
        // object itself.
        if (index === (showings.length - 1)) {
          result = Object.entries(timeList);
        }
        return result;
      }

      const selected = {
        movies: getSelectedSet('movies'),
        theaters: getSelectedSet('theaters'),
      }

      document.querySelector('#view-results .list').innerHTML =
        getRemainingShowings(selected)
        .reduce(groupByTime, {})
        .map(timeListEntryToListGroup)
        .join('\n');
    }
}
  // framework7.progressbar.hide(progressbarEl);
}
*/

document.addEventListener('DOMContentLoaded', () => {
  initFramework7();

  // TODO RINN
  // document.querySelector('#view-location .navbar .right a')
  //   .addEventListener('click', retrieveMovieInfo);

  document.querySelector('#view-location.tab')
    .addEventListener('tab:hide', updateOtherTabs);

  // XXX remove
  document.querySelector('#location-form input[name="zip-code"]').value = '02421';
  // document.querySelector('#location-form input[name="max-distance"]').value = 6.5;
});
