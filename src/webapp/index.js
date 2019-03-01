/* eslint-env browser */

import Duration from 'duration-js';
import context, { ContextArray, ContextMap } from '../common/context';
// import getDistanceMatrix from '../common/distance-matrix';
import Movie from '../common/movie';
import MovieListing from '../common/movie-listing';
import Theater from '../common/theater';
// import Scheduler from '../common/scheduler';
import Showtime from '../common/showtime';
import Util from '../common/util';

import '../../scss/index.scss';

const sectionList = ['location', 'selection', 'results', 'itineraries'];

// The 'value' for listings, movies, showtimes and theaters are
// arrays.
function reviver(key, value) {
  function buildContextMap(clazz, list) {
    const retval = new ContextMap();
    list.forEach((entry) => {
      const [k, props] = entry;
      const v = Object.setPrototypeOf(props, clazz.prototype);
      retval.set(k, v);
    });
    return retval;
  }

  let retval;

  switch (key) {
    case 'listings':
      retval = new ContextArray();
      value.forEach((v) => {
        const listing = Object.setPrototypeOf(v, MovieListing.prototype);
        retval.push(listing);
      });
      break;

    case 'movies':
      retval = buildContextMap(Movie, value);
      break;

    case 'runningTime':
      retval = new Duration(value._milliseconds); // eslint-disable-line no-underscore-dangle
      break;

    case 'showtimes':
      retval = value.map(showtimeString => new Showtime(showtimeString));
      break;

    case 'theaters':
      retval = buildContextMap(Theater, value);
      break;

    default:
      retval = value;
  }

  return retval;
}

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
        + `<td><input type="checkbox" id="${newId}" value="${url}"${disabled ? ' disable=""' : ''}/></td>`
        + `<td><label for="${newId}"${disabled ? ' data-disabled=""' : ''}>${getLink(item)}</label></td>`
      + '</tr>';
    })
    .join('');
}

function renderSelectionForm() {
  renderSelectionList('movie', (movie) => {
    const now = new Date();

    const hasMoreShowings = !context
      .listings
      .some(
        // The listing is for the requested movie and there are showings left.
        listing => ((movie.url === listing.movie.url) && (listing.showtimesAfter(now).length !== 0))
      );
    return hasMoreShowings;
  });
  renderSelectionList('theater', () => '');
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

// Look though the list items. If a list item has a checked
// element record that elements value in a Set.
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
        selectionListEl.querySelectorAll('input[type="checkbox"]').forEach((checkboxEl) => {
          checkboxEl.checked = allCheckboxEl.checked; // eslint-disable-line no-param-reassign
        });
      });

      // When any others are clicked, clear the "All"
      selectionListEl.addEventListener('click', () => {
        allCheckboxEl.checked = false;
      });
    });

  document.getElementById('location-form').addEventListener('submit', async (event) => {
  // document.getElementById('submit-location-button').addEventListener('click', async (event) => {
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
    if (context.debug.autoFillLists) {
      ['movie', 'theater'].forEach((id) => {
        const els = document.querySelectorAll(`#${id}-selection-list input[type="checkbox"]`);
        for (let i = 0; i < 4; i++) {
          els.item(i).click();
        }
        document.getElementById('select-button').click();
      });
    }
  });

  document.getElementById('selection-form').addEventListener('submit', (event) => {
    let lastShowtime = new Showtime(0, 0, 0, 0, 0, 0, 0);

    event.stopImmediatePropagation();
    event.preventDefault();

    const selected = createSelected();

    // TODO add distance to theaters name in the Selection form

    // const selected = {
    //     movies: getSelectedSet('#movie-selection-list .selection-list input[type="checkbox"]'),
    //   theaters: getSelectedSet('#theater-selection-list .selection-list input[type="checkbox"]'),
    // };

    // Build the deisplay list of selected items for each item type.
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

    document.getElementById('result-list').innerHTML = Showtime.getSortedShowings(selected)
      .map(
        (showing) => {
          const { movie, theater } = showing.listing;
          const showtime = (Showtime.compare(showing.showtime, lastShowtime) !== 0) ? showing.showtime : '&nbsp;';
          lastShowtime = showing.showtime;

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
              &#x25c6;
              <span class=theater-phone>${theater.phone}</span>
            </td>
          </tr>`;
        }
      )
      .join('');
    /*
    // document.getElementById('result-list').innerHTML = context.listings
    //   // Is it a movie in a theater that were both selected?
    //   .filter(listing => selected.movies.has(listing.movieURL)
    //     && selected.theaters.has(listing.theaterURL)
    //     // Is there at least one showing left?
    //     && listing.showtimes.length
    //     && (Showtime.compare(now, listing.showtimes[listing.showtimes.length - 1]) <= 0))
    //   .reduce((showings, listing) => {
    //     // Look at the showtimes for each listing. For each showtime after
    //     // 'now', add a separate entry to the accumulator.
    //     listing.showtimes
    //       .filter(showtime => (Showtime.compare(now, showtime) <= 0))
    //       .forEach(showtime => showings.push({ showtime, listing }));
    //     return showings;
    //   }, [])
    //   .sort((lhs, rhs) => Showtime.compare(lhs.showtime, rhs.showtime)
    //       || rhs.listing.theater.distance - rhs.listing.theater.distance
    //       || compareWOArticles(lhs.listing.movie.title, rhs.listing.movie.title)
    //       || compareWOArticles(lhs.listing.theater.name, rhs.listing.theater.name))
    //   .map(
    //     (showing) => {
    //       const { movie, theater } = showing.listing;
    //       const showtime = (Showtime.compare(showing.showtime, lastShowtime) !== 0) ?
    //             showing.showtime : '&nbsp;';
    //       lastShowtime = showing.showtime;

    //       return `<tr>
    //         <td class="showtime">${showtime}</td>
    //         <td class="title"$>${getLink(movie)}</td>
    //         <td class="rating-running-time">${movie.rating} &#x25c6; ${movie.runningTime
    //           .toString()}</td>
    //       </tr>
    //       <tr class="theater-details">
    //         <td>&nbsp;</td>
    //         <td colspan="2">
    //           <span class="theater-name">${getLink(theater)}</span>
    //           &#x25c6;
    //           <span class="theater-address">${theater.address}</span>
    //           &#x25c6;
    //           <span class=theater-phone>${theater.phone}</span>
    //         </td>
    //       </tr>`;
    //     }
    //   )
      // .join('');
    */
    expandSection('results');
  });

  // document.getElementById('plan-button').addEventListener('click', async () => {
  //   const selected = createSelected();

  //   const addresses = Array.from(selected.theaters)
  //     .map(url => context.theaters.get(url).address);

  //   document.querySelector('body').classList.add('waiting');
  //   const distanceMatrix = await getDistanceMatrix(addresses);
  //   document.querySelector('body').classList.remove('waiting');

  //   const origins = distanceMatrix.origin_addresses;
  //   const matrix = {};

  //   for (let i = 0; i < origins.length; i += 1) {
  //     const fromURL = selected.theaters[i];
  //     matrix[fromURL] = {};
  //     const results = distanceMatrix.rows[i].elements;
  //     for (let j = 0; j < results.length; j += 1) {
  //       const toURL = selected.theaters[j];
  //       matrix[fromURL][toURL] = results[j];
  //     }
  //   }

  //   Scheduler.run(selected, distanceMatrix);

  //   // XXX
  //   console.log(`JSON.stringify(matrix)=${JSON.stringify(matrix, null, 2)}`);
  // });

  // XXX
  // document.getElementById('submit-location-button').click();
});

// if (module.hot) {
//   module.hot.accept();
// }
