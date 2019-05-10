import SelectionList from './selection-list.js';

let instance = null;

export default class MovieList extends SelectionList {
  constructor(isInternal = false) {
    super('movie');
    if (isInternal) {
      // Do initialization
    }
    else {
      throw new Error('Cannot allocate MovieList. Use MovieList.getInstance().');
    }
  }

  static getInstance() {
    if (!instance) {
      instance = new MovieList(/* isInternal */ true);
    }
    return instance;
  }
}
