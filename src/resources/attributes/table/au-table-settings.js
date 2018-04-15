import {observable} from 'aurelia-framework';

export class TableSettings {
  @observable pageSize = 5;
  @observable currentPage = 1;
  totalItems = 0;
  items;
  filter;

  get start() {
    return (this.currentPage - 1) * this.pageSize;
  }

  constructor(getItems) {
    this.getItems = getItems;
  }

  pageSizeChanged(newValue, oldValue) {
    if (oldValue === undefined) {
      return;
    }
    this.loadItems();
  }

  currentPageChanged(newValue, oldValue) {
    if (oldValue === undefined) {
      return;
    }
    this.loadItems();
  }

  loadItems() {
    let query = this.buildQuery();
    return this
      .getItems(query)
      .then(result => {
        this.items = result.items;
        this.totalItems = result.totalItems;
      });
  }

  buildQuery() {
    return {
      start: this.start,
      pageSize: this.pageSize,
      filter: this.filter
    };
  }
}

export class TableResult {
  totalItems;
  items;
  constructor(result) {
    this.totalItems = result.totalItems;
    this.items = result.items;
  }
}
