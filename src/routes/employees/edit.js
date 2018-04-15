import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { HttpClient, json } from 'aurelia-fetch-client';
import { Router } from 'aurelia-router';
import { Helpers } from 'common/helpers';
import { DialogService } from 'aurelia-dialog';
import { PasswordDialog } from 'routes/employees/password-dialog';
import { App } from 'app';

@inject(RestService, HttpClient, Router, Helpers, DialogService, App)
export class EmployeeEdit {
	constructor(rest, http, router, helpers, dialog, app) {
		this.rest = rest;
		this.http = http;
		this.router = router;
		this.helpers = helpers;
		this.dialog = dialog;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;

		this.title = '<i class="fa fa-user mr-2"></i>Darbinieka datu labošana';
		this.employee = null;

		this.alert = { message: '', type: 'danger' };
		// konta dati servera pusē
		this.account = false;

		this.isSaving = false;
	}

	canActivate(params) {
		if (!this.allowEdit) return false;

		return this.rest.get(`companies/${params.companyId}/employees/${params.employeeId}`)
			.then(data => {
				if (data !== false) {
					this.employee = data.employee;
					if (this.employee.lietotajvards) {
						this.account = true;
					}
					if (this.employee.id === 0) {
						this.title = '<i class="fa fa-user-plus mr-2"></i>Jauns darbinieks';
						this.employee.avatar = 'img/avatars/default_avatar.jpg';
					}
					return true;
				}
				return false;
			});
	}

	activate(params) {
		this.app.breadcrumbs = [
			{ title: 'Sākums', route: 'status' },
			{ title: 'Uzņēmumi', route: 'companies' },
			{ title: this.employee.uznemums.nosaukums, route: `companies/${this.employee.uznemums.id}` }
		];
		if (params.employeeId == 0) {
			this.app.breadcrumbs.push({ title: 'Jauns darbinieks', route: 'employees-edit' });
		} else {
			this.app.breadcrumbs.push({ title: this.employee.pilnsVards, route: `companies/${this.employee.uznemums.id}` });
			this.app.breadcrumbs.push({ title: 'Datu labošana', route: 'employees-edit' });
		}
	}

	change() {
		if (!this.account) {
			this.showWarning("Nav norādīts vai saglabāts Lietotājvārds");
			return;
		}
		this.dialog.open({ viewModel: PasswordDialog, model: { id: this.employee.id, title: `${this.employee.pilnsVards} - jauna parole` } });
	}

	validateAccount() {
		let errors = 0;
		// ir lietotājvārds, bet nav paroles
		if (this.employee.lietotajvards && !this.employee.parole) {
			this.helpers.addError('employeePassword', errors == 0);
			errors++;
		} else {
			if (!this.account) {
				this.helpers.removeError('employeePassword');
			}
		}
		// nav lietotājvārda, bet ir parole
		if (!this.employee.lietotajvards && this.employee.parole) {
			if (!this.account) {
				this.helpers.addError('employeeUsername', errors == 0);
				errors++;
			}
		} else {
			this.helpers.removeError('employeeUsername');
		}

		if (!this.account) {
			if (this.employee.parole) {
				if (this.helpers.validatePassword('employeePassword', this.employee.parole, errors == 0)) {
					this.helpers.removeError('employeePassword');
				} else {
					this.helpers.addError('employeePassword');
					errors++;
				}
			}
		}

		return errors;
	}

	validate() {
		let errors = 0;
		if (this.employee.pilnsVards) {
			this.helpers.removeError('employeeName');
		} else {
			this.helpers.addError('employeeName', true);
			errors++;
		}

		if (this.employee.amats) {
			this.helpers.removeError('employeePost');
		} else {
			this.helpers.addError('employeePost', errors == 0);
			errors++;
		}

		if (this.employee.epasts) {
			if (this.helpers.validateEmail(this.employee.epasts)) {
				this.helpers.removeError('employeeEmail');
			} else {
				this.helpers.addError('employeeEmail', errors == 0);
				errors++;
			}
		} else {
			this.helpers.removeError('employeeEmail');
		}

		errors += this.validateAccount();

		if (errors == 0) {
			this.submit();
		}
	}

	submit() {
		this.clearAlert();
		this.isSaving = true;
		if (this.employee.id !== 0) {
			this.http.fetch('employees', { method: 'put', body: json(this.employee) })
				.then(response => {
					this.statusCode = response.status;
					return response.json();
				})
				.then(data => {
					if (this.statusCode === 200) {
						if (this.employee.lietotajvards) {
							this.account = true;
						} else {
							this.employee.parole = '';
							this.employee.aktivs = false;
							this.employee.administrators = false;
							this.account = false;
						}
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
			this.http.fetch('employees', { method: 'post', body: json(this.employee) })
				.then(response => {
					this.statusCode = response.status;
					return response.json();
				})
				.then(data => {
					if (this.statusCode === 201 || this.statusCode === 200) {
						this.employee.id = data.id;
						this.showSuccess(`${data.message}. Pēc 2 sekundēm notiks pārēja uz darbinieku sarakstu.`);
						setTimeout(function () {
							this.router.navigate(`companies/${this.employee.uznemums.id}`);
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