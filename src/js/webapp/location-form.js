let instance = null;

export default class LocationForm {
  constructor(isInternal = false) {
    if (isInternal) {
      this.el = document.getElementById('location-form');
      this.zipCodeEl = this.el.querySelector('input[name="zip-code"]');
      this.maxDistanceEl = this.el.querySelector('input[name="max-distance"]');
      this.storageKey = 'location';
    }
    else {
      throw new Error('Cannot allcate LocationForm. Use LocationForm.getInstance().');
    }
  }

  static getInstance() {
    if (!instance) {
      instance = new LocationForm(/* isInternal */ true);
    }
    return instance;
  }

  get zipCode() { return this.zipCodeEl.value; }

  set zipCode(value) { this.zipCodeEl.value = value; }

  get maxDistance() { return this.maxDistanceEl.value; }

  set maxDistance(value) { this.maxDistanceEl.value = value; }

  get data() { return { zipCode: this.zipCode, maxDistance: this.maxDistance }; }

  // TODO add date/time fields to filters

  /*
   * Storage UI Callbacks
   */
  collectDataForStorage() { return this.data; }

  setFromData(data) {
    const { zipCode, maxDistance } = data;
    this.zipCode = zipCode;
    this.maxDistance = maxDistance;
  }

  reset() { this.el.reset(); }

  reportValidity() { return this.el.reportValidity(); }

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
    if (this.hasSavedData()) {
      this.setFromData(JSON.parse(localStorage.getItem(this.storageKey)));
    }
  }

  hasSavedData() {
    return !!localStorage.getItem(this.storageKey);
  }
}
