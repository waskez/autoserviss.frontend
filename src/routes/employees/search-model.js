import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';

@inject(RestService)
export class EmployeeSearch {
    constructor(rest) {
        this.rest = rest;

		this.title = 'Darbinieka meklēšana';
		this.placeholder = 'Vārds, uzvārds';
        this.repeatView = 'pages/employees/search-view.html';
        this.id = 0; // uzņēmuma id
    }

    search(trm) {
        return this.rest.postAndGetData('employees/search', trm)
            .then(data => {
                if (data !== false) {
                    return data.darbinieki;
                }
                return [];
            });
    }
	
	filterFunc(searchExpression, employee, helpers) {
		if (!searchExpression || !employee) return false;
		return helpers.replaceDiacritics(employee.pilnsVards.toLowerCase()).indexOf(helpers.replaceDiacritics(searchExpression.toLowerCase())) !== -1;
	}
}