import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';

@inject(RestService)
export class CustomerSearch {
  constructor(rest) {
    this.rest = rest;

    this.title = 'Klienta meklēšana';
    this.placeholder = 'Nosaukums, vārds, uzvārds, tālrunis';
    this.repeatView = 'routes/customers/search-view.html';
    this.id = 0;
  }

  search(trm) {
    return this.rest.postAndGetData('customers/search', trm)
      .then(data => {
        if (data !== false) {
          return data.klienti;
        }
        return [];
      });
  }

  filterFunc(searchExpression, customer, helpers) {
    if (!searchExpression || !customer) return false;
    return helpers.replaceDiacritics(customer.nosaukums.toLowerCase()).indexOf(helpers.replaceDiacritics(searchExpression.toLowerCase())) !== -1 ||
      customer.talrunis && helpers.replaceDiacritics(customer.talrunis.toLowerCase()).indexOf(helpers.replaceDiacritics(searchExpression.toLowerCase())) !== -1;
  }
}
