import SelectionList from './selection-list.js';

let instance = null;

export default class TheaterList extends SelectionList {
  constructor(isInternal = false) {
    super('theater');
    if (isInternal) {
      // Do initialization
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
}
