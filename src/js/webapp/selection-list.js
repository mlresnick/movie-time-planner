import context from '../common/context.js';
import Util from '../common/util.js';

export default class SelectionList {
  constructor(listType) {
    this.listType = listType;
    this.listName = `${listType}s`;
    this.viewName = `#view-${this.listName}`;
    this.el = document.querySelector(`${this.viewName} .list`);
    this.ulEl = this.el.querySelector('ul');
    this.allElSelector = `${this.viewName} .page-content .list li input[type="checkbox"]`;
    this.selectedElSelector = `${this.viewName} .page-content .list li input[type="checkbox"]:checked`;
  }

  update() {
    const { el, listType } = this;

    function listItemToHTML(item) {
      const remainingListName = `${listType}Ids`;
      let noMoreShowingsClass = '';
      let disabled = '';
      if (context.remaining[remainingListName].has(item.id)) {
        el.classList.remove('no-more-showings');
      }
      else {
        noMoreShowingsClass = ' class="no-more-showings"';
        disabled = ' disabled=""';
      }
      // TODO leave items with no more showings visible, but disable them.
      // TODO move item.footer into into subclass => this.footer(item)
      // eslint-disable-next-line operator-linebreak
      return '' +
        `<li${noMoreShowingsClass}>
          <label class="item-checkbox item-content">
            <input type="checkbox"${disabled} value="${item.id}">
            <span class="icon icon-checkbox"></span>
            <div class="item-inner">
              <div class="item-title">
                ${item.name}
                <div class="item-footer">${item.footer}</div>
              </div>
            </div>
          </label>
        </li>`;
    }

    this.el.classList.add('no-more-showings');

    this.ulEl.innerHTML = Array.from(context[this.listName].values())
      .sort((lhs, rhs) => Util.compareWOArticles(lhs.name, rhs.name))
      .map(listItemToHTML)
      .join('\n');
  }

  static getEls(selector) { return Array.from(document.querySelectorAll(selector)); }

  static getValues(selector) { return new Set(SelectionList.getEls(selector).map(el => el.value)); }

  getAllValues() { return SelectionList.getValues(this.allElSelector); }

  getSelectedValues() { return SelectionList.getValues(this.selectedElSelector); }

  areAllSelected() {
    return (this.getAllValues().size === this.getSelectedValues().size);
  }

  setAll(value) { this.getEls(this.selectedElSelector).forEach((el) => { el.checked = value; }); }

  clearAll() { this.setAll(false); }

  selectAll() { this.setAll(true); }
}
