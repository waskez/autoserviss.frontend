import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { Router } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { App } from 'app';

@inject(RestService, Router, DialogService, App)
export class VehicleDetails {   
    constructor(rest, router, dialog, app) {
		this.rest = rest;
		this.router = router;
		this.dialog = dialog;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;

		this.vehicle = null;
		this.customer = null;
		this.history = [];
		this.historyTitle = 'Remontu vēsture';
	}

	canActivate(params) {
		return this.rest.get(`vehicle/${params.id}/history`)
			.then(data => {
				if (data !== false) {
					this.vehicle = data.vehicle;
					this.customer = data.customer;
					this.history = data.history;
					if(this.history.length === 0) {
						this.historyTitle = 'Remontu vēstures nav';
					}
					return true;
				}
				return false;
			});
	}

	activate(params) {
		this.app.breadcrumbs = [{ title: 'Sākums', route: 'status' }];
		if (this.customer.veids == 1) {
			this.app.breadcrumbs.push({ title: 'Fiziskās personas', route: 'customers/list/1' });
		} else if (this.customer.veids == 2) {
			this.app.breadcrumbs.push({ title: 'Juridiskās personas', route: 'customers/list/2' });
		}
		this.app.breadcrumbs.push({ title: this.customer.nosaukums, route: `customers/${this.customer.id}` });
		this.app.breadcrumbs.push({ title: this.vehicle.numurs, route: `vehicle/${this.vehicle.id}` });
	}
}