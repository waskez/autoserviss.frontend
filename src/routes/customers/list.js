import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { Router } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { App } from 'app';

@inject(RestService, Router, DialogService, App)
export class CustomersList {
	constructor(rest, router, dialog, app) {
		this.rest = rest;
		this.router = router;
		this.dialog = dialog;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;

		this.placeholder = '';

		this.klientuVeids = 0;
		this.customers = [];
		this.filterTerm = '';
	}

	canActivate(params) {
		let veids = '';
		if (params.veids == 1) {
			veids = 'natural';
		} else if (params.veids == 2) {
			veids = 'legal';			
		} else {
			console.error('Nezināms klienta veids');
			return false;
		}
		return this.rest.get(`customers/${veids}`)
			.then(data => {
				if (data !== false) {
					this.customers = data.customers;
					return true;
				}
				return false;
			});
	}

	activate(params) {
		this.klientuVeids = params.veids;
		this.app.breadcrumbs = [{ title: 'Sākums', route: 'status' }];
		if (this.klientuVeids == 1) {
			this.app.breadcrumbs.push({ title: 'Fiziskās personas', route: `customers/${params.veids}` });
			this.placeholder = 'Vārds, uzvārds, epasts, tālrunis';
		} else if (this.klientuVeids == 2) {
			this.app.breadcrumbs.push({ title: 'Juridiskās personas', route: `customers/${params.veids}` });
			this.placeholder = 'Nosaukums, epasts, tālrunis';
		}
	}

	create() {
		this.router.navigate(`customers/0/${this.klientuVeids}`);
	}

	delete(event) {
		let customer = null;
		this.customers.forEach(c => {
			if (c.id === event.detail.id) {
				customer = c;
			}
		});
		let deleteModel = {
			title: 'Klienta dzēšana',
			message: `Klients <b> ${customer.nosaukums} </b> tiks izdzēsts. Apstipriniet dzēšanu.`,
			label: 'Dzēst klientu',
			type: 'danger'
		};
		this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
			.whenClosed(response => {
				if (!response.wasCancelled) {
					return this.rest.delete(`customers/${event.detail.id}`)
						.then(data => {
							if (data) {
								let i = this.customers.length;
								while (i--) {
									if (this.customers[i].id === event.detail.id) {
										this.customers.splice(i, 1);
									}
								}
							}
						});
				}
			});
	}

	filterFunc(searchExpression, customer, helpers) {
		if (!searchExpression || !customer) return false;
		return helpers.replaceDiacritics(customer.nosaukums.toLowerCase()).indexOf(helpers.replaceDiacritics(searchExpression.toLowerCase())) !== -1 ||
			customer.epasts && helpers.replaceDiacritics(customer.epasts.toLowerCase()).indexOf(helpers.replaceDiacritics(searchExpression.toLowerCase())) !== -1 ||
			customer.talrunis && helpers.replaceDiacritics(customer.talrunis.toLowerCase()).indexOf(helpers.replaceDiacritics(searchExpression.toLowerCase())) !== -1;
	}
}