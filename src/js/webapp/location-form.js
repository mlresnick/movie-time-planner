let instance = null;

export default class LocationForm {
  constructor(isInternal = false) {
    if (isInternal) {
      this.el = document.getElementById('location-form');
      this.zipCodeEl = this.el.querySelector('input[name="zip-code"]');
      this.maxDistanceEl = this.el.querySelector('input[name="max-distance"]');
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

  saveToStorage() {
    // TODO add date/time fields to filters
    localStorage.setItem('location', JSON.stringify(this.data));
  }

  loadFromStorage() {
    const locationJSON = localStorage.getItem('location');
    if (locationJSON) {
      const { zipCode, maxDistance } = JSON.parse(locationJSON);
      this.zipCode = zipCode;
      this.maxDistance = maxDistance;
    }
  }

  eraseStorage() {
    localStorage.removeItem('location');
    this.clear();
  }

  clear() {
    this.zipCode = '';
    this.maxDistance = 5;
  }

  reportValidity() { return this.el.reportValidity(); }
}
