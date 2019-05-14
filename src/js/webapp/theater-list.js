import SelectionList from './selection-list.js';

let instance = null;

export default class TheaterList extends SelectionList {
  constructor(isInternal = false) {
    super('theater');
    if (isInternal) {
      this.storageKey = 'theaters';
    }
    else {
      throw new Error('Cannot allocate TheaterList. Use TheaterList.getInstance().');
    }
  }

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
  save() { localStorage.setItem(this.storageKey, JSON.stringify(this.collectDataForStorage())); }

  erase() {
    localStorage.removeItem(this.storageKey);
    this.reset();
  }

  load() {
    let retval = false;
    if (this.hasSavedData()) {
      this.setFromData(JSON.parse(localStorage.getItem(this.storageKey)));
      retval = true;
    }

    return retval;
  }

  hasSavedData() {
    return localStorage.getItem(this.storageKey) ? true : false;
  }

}
