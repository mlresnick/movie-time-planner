let instance = null;

/**
 * Location form. A wrapper around the form element.
 *
 * @param {boolean} [isInternal=false]
 *
 * @class
 */
class LocationForm {
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

  /** */
  static getInstance() {
    if (!instance) {
      instance = new LocationForm(/* isInternal */ true);
    }
    return instance;
  }

  /**
   * The value in the form.
   *
   * @type {string}
   * @memberof LocationForm
   */
  get zipCode() { return this.zipCodeEl.value; }

  set zipCode(value) { this.zipCodeEl.value = value; }

  /**
   * The value in the form.
   *
   * @type {number}
   * @memberof LocationForm
   */
  get maxDistance() { return this.maxDistanceEl.value; }

  set maxDistance(value) { this.maxDistanceEl.value = value; }

  /**
   * Get all form data in one object.
   *
   * @type {Object}
   * @property {string} zipCode
   * @property {number} maxDistance
   *
   * @readonly
   * @memberof LocationForm
   */
  get data() { return { zipCode: this.zipCode, maxDistance: this.maxDistance }; }

  // TODO add date/time fields to filters

  /*
   * Storage UI Callbacks
   */
  /** Storage UI Callbacks */
  collectDataForStorage() { return this.data; }

  /**
   * Storage UI Callbacks
   *
   * @param {Object} data - object in <kbd>this.data</kbd>.
   */
  setFromData(data) {
    const { zipCode, maxDistance } = data;
    this.zipCode = zipCode;
    this.maxDistance = maxDistance;
  }

  /** Reset form */
  reset() { this.el.reset(); }

  /**
   * Validaate form. If there are any issue the for will be highlighted.
   *
   * @returns {boolean} - `true` if form is valid. `false` otherwise.
   */
  reportValidity() { return this.el.reportValidity(); }

  /*
   * Storage UI
   * TODO Make this a mixin that works inside event handlers.
   */
  /** Part of the Storage UI */
  save() { localStorage.setItem(this.storageKey, JSON.stringify(this.collectDataForStorage())); }

  /** Part of the Storage UI */
  erase() {
    localStorage.removeItem(this.storageKey);
    this.reset();
  }

  /** Part of the Storage UI */
  load() {
    if (this.hasSavedData()) {
      this.setFromData(JSON.parse(localStorage.getItem(this.storageKey)));
    }
  }

  /** Part of the Storage UI */
  hasSavedData() {
    return !!localStorage.getItem(this.storageKey);
  }
}
export default LocationForm;
