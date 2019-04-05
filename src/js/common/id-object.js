/**
 * Base class for objects that have parent objects and their own id.
 *
 * @param {Object} [parent] - Object with an id that will be stored in this object.
 */
class IdObject {
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

  /**
   * Unique identifier for derived object. May be overridden by subclasses.
   *
   * @readonly
   * @instance
   */
  get id() { return this.url; }
}
export default IdObject;
