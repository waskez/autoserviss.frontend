import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';

@inject(RestService)
export class VehicleSearch {
  constructor(rest) {
    this.rest = rest;

    this.title = 'Transportlīdzekļa meklēšana';
    this.placeholder = 'Reģistrācijas numurs';
    this.repeatView = 'routes/vehicles/search-view.html';
    this.id = 0;
  }

  search(trm) {
    return this.rest.postAndGetData('vehicles/search', trm)
      .then(data => {
        if (data !== false) {
          return data.transportlidzekli;
        }
        return [];
      });
  }

  filterFunc(searchExpression, vehicle, helpers) {
    if (!searchExpression || !vehicle) return false;
    return helpers.replaceDiacritics(vehicle.numurs.toLowerCase()).indexOf(helpers.replaceDiacritics(searchExpression.toLowerCase())) !== -1;
  }
}
