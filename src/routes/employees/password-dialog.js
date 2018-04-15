import { inject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { HttpClient, json } from 'aurelia-fetch-client';
import { Helpers } from 'common/helpers';

@inject(DialogController, HttpClient, Helpers)
export class PasswordDialog {
	constructor(controller, http, helpers) {
		this.controller = controller;
		this.http = http;
		this.helpers = helpers;

		this.employeeId = 0;
		this.password = '';
		this.title = 'Jauna parole';

		this.alert = { message: '', type: 'danger' };
	}

	activate(params) {
		this.employeeId = params.id;
		this.title = params.title;
	}

	validate() {
		if (this.helpers.validatePassword('dialogPassword', this.password, true)) {
			this.http.fetch('employee/pwd', {
				method: 'put',
				body: json({ key: this.employeeId, value: this.password })
			})
				.then(response => {
					this.statusCode = response.status;
					return response.json();
				})
				.then(data => {
					if (this.statusCode === 200) {
						this.showSuccess(`${data.message}. Pēc 2 sekundēm logs aizvērsies.`);
						setTimeout(function () {
							this.controller.ok();
						}.bind(this), 2000);
					} else {
						this.showError(data.messages[0]);
					}
				})
				.catch(error => {
					this.showError(error.message);
				});
		}
	}

	showError(message) {
		this.alert.type = 'danger';
		this.alert.message = message;
	}

	showSuccess(message) {
		this.alert.type = 'success';
		this.alert.message = message;
	}
}