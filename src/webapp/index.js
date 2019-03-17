/* eslint-env browser */

import context from '../common/context';
import debug from '../common/debug';
// TODO import getDistanceMatrix from '../common/distance-matrix';
import Movie from '../common/movie';
import Theater from '../common/theater';
// TODO import Scheduler from '../common/scheduler';
import Showtime from '../common/showtime';
import Util from '../common/util';
import parseContext from './helper';

import '../../scss/index.scss';

const sectionList = ['location', 'selection', 'results', 'itineraries'];

function getLink(object) {
  let target = '';
  if (object instanceof Movie) {
    target = 'movie';
  }
  if (object instanceof Theater) {
    target = 'theater';
  }
  if (target === '') {
    target = '_blank';
  }
  return `<a href="${object.url}" target="${target}">${object.name}</a>`;
}

function renderSelectionList(type) {
  const listEl = document.querySelector(`#${type}-selection-list .selection-list`);

  document.querySelector(`#all-${type}s`).checked = false;

  listEl.innerHTML = Array.from(context[`${type}s`].values())
    .sort((lhs, rhs) => Util.compareWOArticles(lhs.name, rhs.name))
    .map((item) => {
      const newId = `${type}=${item.url}`;
      const disabled = !context.remaining[`${type}Ids`].has(item.url);
      return '<tr>'
        + `<td><input type="checkbox" id="${newId}" value="${item.url}"${disabled ? ' disabled="" title="No remaining showings today"' : ''}></td>`
        // TODO - What happens if link from getLink() is disabled?
        + `<td><label for="${newId}"${disabled ? ' data-disabled="" title="No remaining showings today"' : ' title="Click for description"'}>${getLink(item)}</label></td>`
      + '</tr>';
    })
    .join('');
}

function renderSelectionForm() {
  context.remaining.clear();

  Array.from(context.listings.values())
    .reduce((remaining, listing) => {
      if (listing.areShowingsAfter(Showtime.now)) {
        remaining.movieIds.add(listing.movie.id);
        remaining.theaterIds.add(listing.theater.id);
        remaining.listingIds.add(listing.id);
      }
      return remaining;
    }, context.remaining);

  renderSelectionList('movie');
  renderSelectionList('theater');
}

function collapseSection(section) {
  document.getElementById(section).classList.add('collapsed');
}

function expandSection(theSection) {
  sectionList.forEach((section) => {
    if (section === theSection) {
      document.getElementById(section).classList.remove('collapsed');
    }
    else {
      document.getElementById(section).classList.add('collapsed');
    }
  });
}

/*
 * Look though the list items. If a list item has a checked
 * element record that elements value in a Set.
 */
function getSelectedSet(selector) {
  const listAll = (document.querySelectorAll(`${selector}:checked`).length === 0);
  const selectedArr = Array.from(document.querySelectorAll(selector))
    .filter(el => (el.checked || listAll))
    .map(el => el.value);

  return new Set(selectedArr);
}

function createSelected() {
  return {
    movies: getSelectedSet('#movie-selection-list .selection-list input[type="checkbox"]'),
    theaters: getSelectedSet('#theater-selection-list .selection-list input[type="checkbox"]'),
  };
}

/*
 * Initialization - to be done after page has completed loading
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize expand/collapse buttons
  sectionList.forEach((section) => {
    document.querySelector(`#${section}.collapsable button.collapse`)
      .addEventListener('click', () => collapseSection(section));

    document.querySelector(`#${section}.collapsable button.expand`)
      .addEventListener('click', () => expandSection(section));
  });

  // Initialize "All" checkboxes
  document.querySelectorAll('#selection-form .selection-list-section')
    .forEach((selectionListSectionEl) => {
      const selectionListEl = selectionListSectionEl.querySelector('.selection-list');
      const allCheckboxEl = selectionListSectionEl.querySelector('.all');

      // When "All" is clicked, set the rest to whatever value it has.
      allCheckboxEl.addEventListener('click', () => {
        selectionListEl.querySelectorAll('input[type="checkbox"]:not(:disabled')
          .forEach((checkboxEl) => {
            checkboxEl.checked = allCheckboxEl.checked; // eslint-disable-line no-param-reassign
          });
      });

      // When any others are clicked, clear the "All"
      selectionListEl.addEventListener('click', () => {
        allCheckboxEl.checked = false;
      });
    });

  document.getElementById('location-form').addEventListener('submit', async (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();

    document.querySelector('body').classList.add('waiting');

    const zipCode = document.querySelector('input[name="zip-code"]').value;
    const maxDistance = document.querySelector('input[name="max-distance"]').value;
    const response = await fetch(
      `/zip-code/${zipCode}${
        (maxDistance !== '')
          ? `?max-distance=${maxDistance}`
          : ''
      }`,
    );

    document.querySelector('body').classList.remove('waiting');

    if (Util.isInInterval(response.status, '[200, 300)') || (response.status === 304)) {
      const contextJSON = await response.text();
      const localContext = parseContext(contextJSON); // JSON.parse(contextJSON, reviver);
      ['movies', 'theaters', 'listings', 'requestedDate'].forEach((member) => {
        context[member] = localContext[member];
      });

      document.getElementById('location-values').innerHTML = `${zipCode}, ${maxDistance} mi.`;
      renderSelectionForm(context);
      expandSection('selection');
    }

    // DEBUG - for giggles, click a few entries in the selection form.
    if (debug.autoFillLists) {
      ['movie', 'theater'].forEach((id) => {
        const els = document.querySelectorAll(`#${id}-selection-list input[type="checkbox"]:not(:disabled)`);
        for (let i = 0; i < 4; i++) {
          if (els.item(i)) {
            els.item(i).click();
          }
        }
        document.getElementById('select-button').click();
      });
    }
  });
  document.getElementById('selection-form').addEventListener('submit', (event) => {
    let previousShowtime = new Showtime(0, 0, 0, 0, 0, 0, 0);

    event.stopImmediatePropagation();
    event.preventDefault();

    const selected = createSelected();

    // Build the display list of selected items for each item type.
    ['movies', 'theaters']
      .forEach((itemType) => {
        const singular = itemType.substring(0, itemType.length - 1);

        const htmlItemList = Array.from(selected[itemType].entries())
          .map((entry) => {
            const [url] = entry;
            return `<li>${context[itemType].get(url).name}</li>`;
          })
          .join('');
        document.querySelector(`#${singular}-selected-list ul.selected-list`)
          .innerHTML = htmlItemList;
      });

    function compareShowings(lhs, rhs) {
      return Showtime.compare(lhs.showtime, rhs.showtime)
        || (rhs.theater.distance - rhs.theater.distance)
        || Util.compareWOArticles(lhs.movie.title, rhs.movie.title)
        || Util.compareWOArticles(lhs.theater.name, rhs.theater.name);
    }

    function showingToHTML(showing) {
      const { movie, theater } = showing;
      const showtime = (Showtime.compare(showing.showtime, previousShowtime) !== 0)
        ? showing.showtime
        : '&nbsp;';
      previousShowtime = showing.showtime;

      const phone = theater.phone
        ? `&#x25c6; <span class="theater-phone">${theater.phone}</span>`
        : '';

      return `<tr>
        <td class="showtime">${showtime}</td>
        <td class="title"$>${getLink(movie)}</td>
        <td class="rating-running-time">${movie.rating} &#x25c6; ${movie.runningTime.toString()}</td>
      </tr>
      <tr class="theater-details">
        <td>&nbsp;</td>
        <td colspan="2">
          <span class="theater-name">${getLink(theater)}</span>
          &#x25c6;
          <span class="theater-address">${theater.address}</span>
          ${phone}
          &#x25c6;
          <span class=theater-distance>${theater.distanceString}</span>
        </td>
      </tr>`;
    }

    document.getElementById('result-list').innerHTML = Array
      // IDs for all of the remaining listings...
      .from(context.remaining.listingIds.values())
      // ... converted to listings...
      .map(listingId => context.listings.get(listingId))
      // ... use only selected movies and theaters...
      .filter(listing => (
        selected.theaters.has(listing.theater.url) && selected.movies.has(listing.movie.url)
      ))
      // ... gete the remaining showings in the listings...
      .reduce((showings, listing) => showings.concat(listing.showingsAfter(Showtime.now)), [])
      // ... sorted by showtime, theater distance, title, and theater name...
      .sort(compareShowings)
      // ... converted to HTML...
      .map(showingToHTML)
      // ... and merge the HTML fragments
      .join('');

    expandSection('results');
  });
});
