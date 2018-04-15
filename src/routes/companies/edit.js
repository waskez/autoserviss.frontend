import { inject, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { RestService } from 'services/rest-service';
import { HttpClient, json } from 'aurelia-fetch-client';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { Helpers } from 'common/helpers';
import { App } from 'app';

@inject(Router, RestService, HttpClient, DialogService, Helpers, App)
export class CompanyEdit {
	constructor(router, rest, http, dialog, helpers, app) {
		this.router = router;
		this.rest = rest;
		this.http = http;
		this.dialog = dialog;
		this.helpers = helpers;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;

		this.title = '<i class="fa fa-bank mr-2"></i>Uzņēmuma datu labošana';

		this.company = null;
		this.addressTypes = ['Juridiskā', 'Faktiskā'];

		this.alert = { message: '', type: 'danger' };

		this.itemEdit = null;
		this.isSaving = false;

		this.handleBlur = e => {
			if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
				// darbiem un rezerves daļām neļaujam blur ja fokuss ir nākošajā cell
				let target = e.relatedTarget;
				if (target) {
					if (!target.classList.contains('job-item')) {
						if (this.itemEdit) {
							this.itemEdit.hasFocus = false;
						}
						this.itemEdit = null;
					}
				} else {
					if (this.itemEdit) {
						this.itemEdit.hasFocus = false;
					}
					this.itemEdit = null;
				}
			}
		};
	}

	canActivate(params) {
		if (!this.allowEdit) return false;

		if (params.id > 0) {
			return this.rest.get(`companies/${params.id}`)
				.then(data => {
					if (data !== false) {
						this.company = data.company;
						return true;
					}
					return false;
				});
		} else {
			this.title = '<i class="fa fa-bank mr-2"></i>Jauns uzņēmums';
			this.company = {
				id: 0,
				veids: 3,
				nosaukums: '',
				regNumurs: '',
				pvnNumurs: '',
				epasts: '',
				talrunis: '',
				adreses: [],
				bankas: [],
				piezimes: ''
			};
			return true;
		}
	}

	activate(params) {
		this.app.breadcrumbs = [{ title: 'Sākums', route: 'status' }, { title: 'Uzņēmumi', route: 'companies' }];
		if (params.id == 0) {
			this.app.breadcrumbs.push({ title: 'Jauns uzņēmums', route: 'companies/0/edit' });
		} else {
			this.app.breadcrumbs.push({ title: this.company.nosaukums, route: `companies/${this.company.id}` });
			this.app.breadcrumbs.push({ title: 'Datu labošana', route: `companies/${this.company.id}/edit` });
		}
	}

	attached() {
		document.addEventListener('blur', this.handleBlur, true);
	}

	detached() {
		document.removeEventListener('blur', this.handleBlur);
	}

	create(veids) {
		let item = {};
		if (veids === 'adreses') {
			item = { id: 0, veids: this.addressTypes[0], nosaukums: '' };
		} else if (veids === 'bankas') {
			item = { id: 0, kods: '', nosaukums: '', konts: '' };
		} else {
			this.showError('Nepareizs ieraksta veids');
			return;
		}

		this.company[veids].push(item);
		this.itemEdit = item;
		this.itemEdit.hasFocus = true;
	}

	edit(item) {
		this.itemEdit = item;
		this.itemEdit.hasFocus = true;
	}

	save(event) {
		if (event.keyCode === 13) {
			this.itemEdit.hasFocus = false;
			this.itemEdit = null;
		}
		return true;
	}

	delete(item, veids) {
		if (item.nosaukums) {
			let deleteModel = {
				title: 'Ieraksta dzēšana',
				message: `Ieraksts <b> ${item.nosaukums} </b> tiks izdzēsts. Apstipriniet dzēšanu.`,
				label: 'Dzēst ierakstu',
				type: 'danger'
			};
			this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
				.whenClosed(response => {
					if (!response.wasCancelled) {
						let index = this.company[veids].indexOf(item);
						this.company[veids].splice(index, 1);
					}
				});
		} else {
			let index = this.company[veids].indexOf(item);
			this.company[veids].splice(index, 1);
		}
	}

	validate() {
		this.clearAlert();

		let errors = 0;
		if (this.company.nosaukums) {
			this.helpers.removeError('companyName');
		} else {
			this.helpers.addError('companyName', true);
			errors++;
		}

		if (this.company.regNumurs) {
			this.helpers.removeError('companyRn');
		} else {
			this.helpers.addError('companyRn', errors == 0);
			errors++;
		}

		if (this.company.pvnNumurs) {
			this.helpers.removeError('companyPvn');
		} else {
			this.helpers.addError('companyPvn', errors == 0);
			errors++;
		}

		if (this.helpers.validateEmail(this.company.epasts)) {
			this.helpers.removeError('companyEmail');
		} else {
			this.helpers.addError('companyEmail', errors == 0);
			errors++;
		}

		if (this.company.talrunis) {
			this.helpers.removeError('companyPhone');
		} else {
			this.helpers.addError('companyPhone', errors == 0);
			errors++;
		}

		if (errors > 0) { return; }

		if (this.company.adreses.length == 0) {
			this.showError('Jānorāda vismaz viena Adrese');
			return;
		} else {
			for (let i = 0; i < this.company.adreses.length; i++) {
				if (!this.company.adreses[i].nosaukums) {
					this.showError('Nav norādīts adreses Nosaukums');
					return;
				}
			};
		}

		if (this.company.bankas.length == 0) {
			this.showError('Jānorāda vismaz viena Banka');
			return;
		} else {
			for (let i = 0; i < this.company.bankas.length; i++) {
				if (!this.company.bankas[i].nosaukums) {
					this.showError('Nav norādīts bankas Nosaukums');
					return;
				} else if (!this.company.bankas[i].kods) {
					this.showError('Nav norādīts bankas Kods');
					return;
				} else if (!this.company.bankas[i].konts) {
					this.showError('Nav norādīts bankas Konts');
					return;
				}
			};
		}

		this.submit();
	}

	submit() {
		this.clearAlert();
		this.isSaving = true;
		if (this.company.id !== 0) {
			this.http.fetch('companies', { method: 'put', body: json(this.company) })
				.then(response => {
					this.statusCode = response.status;
					return response.json();
				})
				.then(data => {
					if (this.statusCode === 200) {
						this.showSuccess(data.message);
					} else {
						this.showError(data.messages[0]);
					}
					this.isSaving = false;
				})
				.catch(error => {
					this.showError(error.message);
					this.isSaving = false;
				});
		} else {
			this.http.fetch('companies', { method: 'post', body: json(this.company) })
				.then(response => {
					this.statusCode = response.status;
					return response.json();
				})
				.then(data => {
					if (this.statusCode === 201 || this.statusCode === 200) {
						this.company.id = data.id;
						this.showSuccess(`${data.message}. Pēc 2 sekundēm notiks pārēja uz uznēmumu sarakstu.`);
						setTimeout(function () {
							this.router.navigate('companies');
						}.bind(this), 2000);
					} else {
						this.showError(data.messages[0]);
					}
					this.isSaving = false;
				})
				.catch(error => {
					this.showError(error.message);
					this.isSaving = false;
				});
		}
	}

	clearAlert() {
		this.alert.message = '';
	}

	showError(message) {
		this.alert.type = 'danger';
		this.alert.message = message;
	}

	showWarning(message) {
		this.alert.type = 'warning';
		this.alert.message = message;
	}

	showSuccess(message) {
		this.alert.type = 'success';
		this.alert.message = message;
	}
}