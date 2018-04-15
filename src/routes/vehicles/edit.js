import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { HttpClient, json } from 'aurelia-fetch-client';
import { Router } from 'aurelia-router';
import { Helpers } from 'common/helpers';
import { App } from 'app';

@inject(RestService, HttpClient, Router, Helpers, App)
export class VehicleEdit {
	constructor(rest, http, router, helpers, app) {
		this.rest = rest;
		this.http = http;
		this.router = router;
		this.helpers = helpers;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;

		this.title = '<i class="fa fa-car mr-2"></i>Transportlīdzekļa datu labošana';
		this.customer = null;
		this.markas = [];
		this.selectedMarka = 0;
		this.modeli = [];
		this.selectedModelis = 0;

		this.alert = { message: '', type: 'danger' };

		this.isSaving = false;
	}

	canActivate(params) {
		if (!this.allowEdit) return false;

		return this.rest.get(`customers/${params.customerId}/vehicles/${params.vehicleId}`)
			.then(data => {
				if (data !== false) {
					this.customer = data.customer;
					this.markas = data.markas;
					if (params.vehicleId == 0) {
						this.title = '<i class="fa fa-car mr-2"></i>Jauns transportlīdzeklis';
						this.vehicle = {
							id: 0,
							numurs: '',
							marka: '',
							modelis: '',
							tips: '',
							variants: '',
							versija: '',
							vin: '',
							krasa: '',
							gads: 0,
							degviela: '',
							tilpums: '',
							jauda: '',
							pilnaMasa: '',
							pasmasa: '',
							piezimes: '',
							klientaId: this.customer.id,
							remonta: false
						};
					} else {
						this.vehicle = data.vehicle;
						this.modeli = data.modeli;
					}
					return true;
				}
				return false;
			});
	}

	activate(params) {
		this.app.breadcrumbs = [
			{ title: 'Sākums', route: 'status' }
		];
		if (this.customer.veids == 1) {
			this.app.breadcrumbs.push({ title: 'Fiziskās personas', route: 'customers/natural' });
			this.app.breadcrumbs.push({ title: this.customer.nosaukums, route: `customers/${params.customerId}` });
		} else if (this.customer.veids == 2) {
			this.app.breadcrumbs.push({ title: 'Juridiskās personas', route: 'customers/legal' });
			this.app.breadcrumbs.push({ title: this.customer.nosaukums, route: `customers/${params.customerId}` });
		}
		if (params.vehicleId == 0) {
			this.app.breadcrumbs.push({ title: 'Jauns transportlīdzeklis', route: `customers/${params.customerId}/vehicles/0` });
		} else {
			this.app.breadcrumbs.push({ title: 'Datu labošana', route: `customers/${params.customerId}/vehicles/${params.vehicleId}` });
		}
	}

	markaChanged(event) {
		let mId = 0;
		this.markas.forEach(m => {
			if (m.nosaukums === event.target.value) {
				mId = m.id;
			}
		});
		this.modeli = [];
		this.rest.get(`modeli/${mId}`)
			.then(data => {
				if (data !== false) {
					this.modeli = data.modeli;
				}
			});
	}

	validate() {
		let errors = 0;
		if (this.vehicle.numurs) {
			this.helpers.removeError('vehicleNumurs');
		} else {
			this.helpers.addError('vehicleNumurs', true);
			errors++;
		}
		if (this.vehicle.marka && this.vehicle.marka !== 'empty') {
			this.helpers.removeError('vehicleMarka');
		} else {
			this.helpers.addError('vehicleMarka', errors == 0);
			errors++;
		}
		if (this.vehicle.modelis && this.vehicle.modelis !== 'empty') {
			this.helpers.removeError('vehicleModelis');
		} else {
			this.helpers.addError('vehicleModelis', errors == 0);
			errors++;
		}

		if (errors == 0) {
			this.submit();
		}
	}

	submit() {
		this.clearAlert();
		this.isSaving = true;
		if (this.vehicle.id > 0) {
			this.http.fetch('vehicles', { method: 'put', body: json(this.vehicle) })
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
			this.http.fetch('vehicles', { method: 'post', body: json(this.vehicle) })
				.then(response => {
					this.statusCode = response.status;
					return response.json();
				})
				.then(data => {
					if (this.statusCode === 201 || this.statusCode === 200) {
						this.vehicle.id = data.id;
						this.showSuccess(`${data.message}. Pēc 2 sekundēm notiks pārēja uz transportlīdzekļu sarakstu.`);
						setTimeout(function () {
							this.router.navigate(`customers/${this.customer.id}`);
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