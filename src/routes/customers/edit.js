import { inject, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { RestService } from 'services/rest-service';
import { HttpClient, json } from 'aurelia-fetch-client';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { Helpers } from 'common/helpers';
import { App } from 'app';

@inject(Router, RestService, HttpClient, DialogService, Helpers, App)
export class CustomerEdit {
	constructor(router, rest, http, dialog, helpers, app) {
		this.router = router;
		this.rest = rest;
		this.http = http;
		this.dialog = dialog;
		this.helpers = helpers;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;

		this.title = '<i class="fa fa-user mr-2"></i>Klienta datu labošana';

		this.customer = null;
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
			return this.rest.get(`customers/${params.id}/edit`)
				.then(data => {
					if (data !== false) {
						this.customer = data.customer;
						return true;
					}
					return false;
				});
		} else {
			this.title = '<i class="fa fa-user-plus mr-2"></i>Jauns klients';
			this.customer = {
				id: 0,
				veids: parseInt(params.veids),
				nosaukums: '',
				kontaktpersona: '',
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
		this.app.breadcrumbs = [{ title: 'Sākums', route: 'status' }];
		if (params.veids == 1) {
			this.app.breadcrumbs.push({ title: 'Fiziskās personas', route: `customers/list/${params.veids}` });
		} else if (params.veids == 2) {
			this.app.breadcrumbs.push({ title: 'Juridiskās personas', route: `customers/list/${params.veids}` });
		}
		if (params.id == 0) {
			this.app.breadcrumbs.push({ title: 'Jauns klients', route: `customers/0/${params.veids}` });
		} else {
			this.app.breadcrumbs.push({ title: this.customer.nosaukums, route: `customers/${this.customer.id}` });
			this.app.breadcrumbs.push({ title: 'Datu labošana', route: `customers/${this.customer.id}/${params.veids}` });
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
			let adresesVeids = this.customer.veids === 1 ? 1 : 0;
			item = { id: 0, veids: this.addressTypes[adresesVeids], nosaukums: '' };
		} else if (veids === 'bankas') {
			item = { id: 0, kods: '', nosaukums: '', konts: '' };
		} else {
			this.showError('Nepareizs ieraksta veids');
			return;
		}

		this.customer[veids].push(item);
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
						let index = this.customer[veids].indexOf(item);
						this.customer[veids].splice(index, 1);
					}
				});
		} else {
			let index = this.customer[veids].indexOf(item);
			this.customer[veids].splice(index, 1);
		}
	}

	validate() {
		this.clearAlert();

		let errors = 0;
		if (this.customer.nosaukums) {
			this.helpers.removeError('customerName');
		} else {
			this.helpers.addError('customerName', true);
			errors++;
		}

		if (this.customer.veids === 2) {
			if (this.customer.regNumurs) {
				this.helpers.removeError('customerRn');
			} else {
				this.helpers.addError('customerRn', errors == 0);
				errors++;
			}

			if (this.customer.pvnNumurs) {
				this.helpers.removeError('customerPvn');
			} else {
				this.helpers.addError('customerPvn', errors == 0);
				errors++;
			}
		}

		if (this.customer.epasts) {
			if (this.helpers.validateEmail(this.customer.epasts)) {
				this.helpers.removeError('customerEmail');
			} else {
				this.helpers.addError('customerEmail', errors == 0);
				errors++;
			}
		} else {
			this.helpers.removeError('customerEmail');
		}

		if (errors > 0) { return; }

		if (this.customer.veids === 2) {
			if (this.customer.adreses.length == 0) {
				this.showError('Jānorāda vismaz viena Adrese');
				return;
			} else {
				for (let i = 0; i < this.customer.adreses.length; i++) {
					if (!this.customer.adreses[i].nosaukums) {
						this.showError('Nav norādīts adreses Nosaukums');
						return;
					}
				};
			}
			if (this.customer.bankas.length == 0) {
				this.showError('Jānorāda vismaz viena Banka');
				return;
			} else {
				for (let i = 0; i < this.customer.bankas.length; i++) {
					if (!this.customer.bankas[i].nosaukums) {
						this.showError('Nav norādīts bankas Nosaukums');
						return;
					} else if (!this.customer.bankas[i].kods) {
						this.showError('Nav norādīts bankas Kods');
						return;
					} else if (!this.customer.bankas[i].konts) {
						this.showError('Nav norādīts bankas Konts');
						return;
					}
				};
			}
		}

		this.submit();
	}

	submit() {
		this.clearAlert();
		this.isSaving = true;
		if (this.customer.id !== 0) {
			this.http.fetch('customers', { method: 'put', body: json(this.customer) })
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
			this.http.fetch('customers', { method: 'post', body: json(this.customer) })
				.then(response => {
					this.statusCode = response.status;
					return response.json();
				})
				.then(data => {
					if (this.statusCode === 201 || this.statusCode === 200) {
						this.customer.id = data.id;
						this.showSuccess(`${data.message}. Pēc 2 sekundēm notiks pārēja uz klientu sarakstu.`);
						setTimeout(function () {
							this.router.navigate(`customers/list/${this.customer.veids}`);
						}.bind(this), 2000);
					} else {
						this.showError(data.messages[0]);
						this.isSaving = false;
					}
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