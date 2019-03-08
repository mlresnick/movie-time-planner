/**
 * Base class for objects that have parent objects and their own id.
 * @class
 */
class IdObject {
  /**
   * Creates an instance of IdObject.
   *
   * @param {Object} [parent] - Object with an id that will be stored in this object.
   *
   * @memberof IdObject
   */
  constructor(parent) {
    /**
     * @member {string} parentId - Identifier of the object under which this showing appears.
     *
     * @memberof Showing
     * @instance
     * @private
     */
    this.parentId = parent ? parent.id : null;
  }

  get id() { return this.url; }
}
export default IdObject;
