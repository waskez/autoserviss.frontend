import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { Router } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { App } from 'app';

@inject(RestService, Router, DialogService, App)
export class CustomerDetails {
	constructor(rest, router, dialog, app) {
		this.rest = rest;
		this.router = router;
		this.dialog = dialog;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;

		this.customer = null;
	}

	canActivate(params) {
		return this.rest.get(`customers/${params.id}/full`)
			.then(data => {
				if (data !== false) {
					this.customer = data.customer;
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
		this.app.breadcrumbs.push({ title: this.customer.nosaukums, route: `customer/${this.customer.id}` });
	}

	deleteVehicle(event) {
		let deleteModel = {
			title: 'Transportlīdzekļa dzēšana',
			message: `Transportlīdzeklis <b> ${event.detail.numurs} </b> tiks izdzēsts. Apstipriniet dzēšanu.`,
			label: 'Dzēst transportlīdzekli',
			type: 'danger'
		};
		this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
			.whenClosed(response => {
				if (!response.wasCancelled) {
					this.rest.delete(`vehicles/${event.detail.id}`)
						.then(data => {
							if (data) {
								let i = this.customer.transportlidzekli.length;
								while (i--) {
									if (this.customer.transportlidzekli[i].id === event.detail.id) {
										this.customer.transportlidzekli.splice(i, 1);
									}
								}
							}
						});
				}
			});
	}
}