import SelectionList from './selection-list.js';

let instance = null;

/**
 * for the Theaters tab. It is a singleton object representing the list of theaters on that tab.
 *
 * @param {boolean} isInternal=false - Should only be called by the <kbd>getInstance</kbd> method.
 *
 * @extends SelectionList
 */
class TheaterList extends SelectionList {
  constructor(isInternal = false) {
    super('theater');
    if (isInternal) {
      this.storageKey = 'theaters';
    }
    else {
      throw new Error('Cannot allocate TheaterList. Use TheaterList.getInstance().');
    }
  }

  /**
   * Returns the singleton instance of this class.
   *
   * @returns {TheaterList} - the singleton object.
   */
  static getInstance() {
    if (!instance) {
      instance = new TheaterList(/* isInternal */ true);
    }
    return instance;
  }

  /*
   * Storage UI Callbacks
   */
  collectDataForStorage() { return Array.from(this.getSelectedValues()); }

  setFromData(selectedValues) {
    this.clear();
    selectedValues
      .map(theaterId => document.querySelector(`#view-theaters li input[type="checkbox"][value="${theaterId}"`))
      .forEach((checkboxEl) => { checkboxEl.checked = true; });
  }

  reset() { this.clear(); }

  /*
   * Storage UI
   * TODO Make this a mixin that works inside event handlers.
   */
  /** Storage API */
  save() { localStorage.setItem(this.storageKey, JSON.stringify(this.collectDataForStorage())); }

  /** Storage API */
  erase() {
    localStorage.removeItem(this.storageKey);
    this.reset();
  }

  /** Storage API */
  load() {
    let retval = false;
    if (this.hasSavedData()) {
      this.setFromData(JSON.parse(localStorage.getItem(this.storageKey)));
      retval = true;
    }

    return retval;
  }

  /** Storage API */
  hasSavedData() { return !!localStorage.getItem(this.storageKey); }
}

export default TheaterList;
