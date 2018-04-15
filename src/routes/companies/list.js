import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { Router } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { App } from 'app';

@inject(RestService, Router, DialogService, App)
export class Companies {
	constructor(rest, router, dialog, app) {
		this.rest = rest;
		this.router = router;
		this.dialog = dialog;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;

		this.companies = [];
		this.filterTerm = '';
	}

	canActivate(params) {
		return this.rest.get('companies')
			.then(data => {
				if (data !== false) {
					this.companies = data.companies;
					return true;
				}
				return false;
			});
	}

	activate() {
		this.app.breadcrumbs = [
			{ title: 'Sākums', route: 'status' },
			{ title: 'Uzņēmumi', route: 'companies' }
		];
	}

	delete(event) {
		let company = null;
		this.companies.forEach(c => {
			if (c.id === event.detail.id) {
				company = c;
			}
		});
		let deleteModel = {
			title: 'Uzņēmuma dzēšana',
			message: `Uzņēmums <b> ${company.nosaukums} </b> tiks izdzēsts. Apstipriniet dzēšanu.`,
			label: 'Dzēst uzņēmumu',
			type: 'danger'
		};
		this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
			.whenClosed(response => {
				if (!response.wasCancelled) {
					return this.rest.delete(`companies/${company.id}`)
						.then(data => {
							if (data) {
								let i = this.companies.length;
								while (i--) {
									if (this.companies[i].id === company.id) {
										this.companies.splice(i, 1);
									}
								}
							}
						});
				}
			});
	}

	filterFunc(searchExpression, company, helpers) {
		if (!searchExpression || !company) return false;
		return helpers.replaceDiacritics(company.nosaukums.toLowerCase()).indexOf(helpers.replaceDiacritics(searchExpression.toLowerCase())) !== -1;
	}
}