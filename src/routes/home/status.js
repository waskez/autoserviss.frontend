import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { RestService } from 'services/rest-service';
import { App } from 'app';
import { TableSettings, TableResult } from 'resources/attributes/table/au-table-settings';

@inject(Router, RestService, App)
export class Status {
  constructor(router, rest, app) {
    this.router = router;
    this.rest = rest;

    app.breadcrumbs = [{ title: 'Sākums', route: 'status' }];

    this.status = null;

    this.tableSettings = new TableSettings(this.loadHistory.bind(this));
  }

  canActivate() {
    return this.rest.get('status/count')
      .then(data => {
        if (data !== false) {
          this.status = data.status;
          return true;
        }
        return false;
      });
  }

  bind() {
    return this.tableSettings.loadItems();
  }

  loadHistory(query) {
    return this.rest.postAndGetData('status/repair/history', query)
      .then(data => {
        let result = new TableResult({ items: data.history, totalItems: data.history.length });
        return result;
      });
  }

  dateSort(a, b, sortOrder) {
    let date1 = new Date(a.registered);
    let date2 = new Date(b.registered);

    if (date1 === date2) {
      return 0;
    }

    if (date1 > date2) {
      return 1 * sortOrder;
    }

    return -1 * sortOrder;
  }
}
