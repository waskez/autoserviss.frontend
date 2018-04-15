import { inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { RestService } from 'services/rest-service';
import { DialogService } from 'aurelia-dialog';
import { App } from 'app';

@inject(HttpClient, RestService, DialogService, App)
export class UnderRepair {
	constructor(http, rest, dialog, app) {
		this.http = http;
		this.rest = rest;
		this.dialog = dialog;
		this.app = app;	

		this.allowEdit = this.app.auth.getUser().admin;

		this.vehicles = [];
	}

	canActivate() {
		return this.rest.get('service/repair').then(data => {
			if (data !== false) {
				this.vehicles = data.vehicles;
				return true;
			}
			return false;
		});
	}

	activate() {
		this.app.breadcrumbs = [
			{ title: 'Sākums', route: 'status' },
			{ title: 'Pašlaik remontā', route: 'under-repair' }
		];
	}
}