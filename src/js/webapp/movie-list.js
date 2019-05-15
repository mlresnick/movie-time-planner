import SelectionList from './selection-list.js';

let instance = null;

/**
 * API for the Movies tab. It is a singleton object representing the list of movies on that tab.
 *
 * @param {boolean} isInternal=false - Should only be called by the <kbd>getInstance</kbd> method.
 *
 * @extends SelectionList
 */
class MovieList extends SelectionList {
  constructor(isInternal = false) {
    super('movie');
    if (isInternal) {
      // Do initialization
    }
    else {
      throw new Error('Cannot allocate MovieList. Use MovieList.getInstance().');
    }
  }

  /**
   * Returns the singleton instance of this class.
   *
   * @returns {MovieList} - the singleton object.
   */
  static getInstance() {
    if (!instance) {
      instance = new MovieList(/* isInternal */ true);
    }
    return instance;
  }
}
export default MovieList;
