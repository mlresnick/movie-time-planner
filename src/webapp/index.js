/* eslint-env browser */

import context from '../common/context';
import debug from '../common/debug';
// TODO import getDistanceMatrix from '../common/distance-matrix';
import Movie from '../common/movie';
import Theater from '../common/theater';
// TODO import Scheduler from '../common/scheduler';
import Showtime from '../common/showtime';
import Util from '../common/util';
import { reviver } from './helper';

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

function renderSelectionList(type, isDisabledAttr) {
  const listEl = document.querySelector(`#${type}-selection-list .selection-list`);

  document.querySelector(`#all-${type}s`).checked = false;

  listEl.innerHTML = Array.from(context[`${type}s`].entries())
    .sort((lhs, rhs) => Util.compareWOArticles(lhs[1].name, rhs[1].name))
    .map((entry) => {
      const [url, item] = entry;
      const newId = `${type}=${url}`;
      const disabled = isDisabledAttr(item);
      return '<tr>'
        + `<td><input type="checkbox" id="${newId}" value="${url}"${disabled ? ' disabled="" title="No remaining showings today"' : ''}/></td>`
        + `<td><label for="${newId}"${disabled ? ' data-disabled="" title="No remaining showings today"' : ''}>${getLink(item)}</label></td>`
      + '</tr>';
    })
    .join('');
}

function renderSelectionForm() {
  renderSelectionList('movie', (movie) => {
    const now = Showtime.now();

    const hasMoreShowings = !context
      .listings
      .some(
        // The listing is for the requested movie and there are showings left.
        listing => ((movie.url === listing.movie.url) && (listing.showingsAfter(now).length !== 0))
      );
    return hasMoreShowings;
  });

  renderSelectionList('theater', (theater) => {
    const now = Showtime.now();
    const hasMoreShowings = !context
      .listings
      .some(listing => (
        (theater.url === listing.theater.url) && (listing.showingsAfter(now).length !== 0)
      ));
    return hasMoreShowings;
  });
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
      const localContext = JSON.parse(contextJSON, reviver);
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

    /*
     * For selected theater:
     *   o Map theaters to listing
     *   o Filter to get listings of selected movies that still have remaining showings.
     *   o Map listings to showings
     *   o Sort list of showings.
     */
    const sortedShowings = Array.from(selected.theaters)
      .reduce((allListings, theater) => allListings.concat(theater.listings), [])
      .filter(
        listing => selected.movies.has(listing.movieURL) && listing.showingsAfter(Showtime.now)
      )
      .reduce((allShowings, listing) => allShowings.concat(listing.showings), [])
      .sort(compareShowings);

    document.getElementById('result-list').innerHTML = sortedShowings
      .map(
        (showing) => {
          const { movie, theater } = showing;
          const showtime = (Showtime.compare(showing.showtime, previousShowtime) !== 0) ? showing.showtime : '&nbsp;';
          previousShowtime = showing.showtime;

          const phone = theater.phone
            ? `&#x25c6; <span class="theater-address">${theater.address}</span>`
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
      )
      .join('');
    expandSection('results');
  });
});
