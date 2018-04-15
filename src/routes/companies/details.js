import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { Router } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { PasswordDialog } from 'routes/employees/password-dialog';
import { SearchDialog } from 'common/search-dialog';
import { EmployeeSearch } from 'routes/employees/search-model';
import { App } from 'app';

@inject(RestService, Router, DialogService, EmployeeSearch, App)
export class CompanyDetails {
	constructor(rest, router, dialog, employeeSearch, app) {
		this.rest = rest;
		this.router = router;
		this.dialog = dialog;
		this.employeeSearch = employeeSearch;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;

		this.company = null;
	}

	canActivate(params) {
		return this.rest.get(`companies/${params.id}`)
			.then(data => {
				if (data !== false) {
					this.company = data.company;
					return true;
				}
				return false;
			});
	}

	activate(params) {
		this.app.breadcrumbs = [{ title: 'Sākums', route: 'status' }, { title: 'Uzņēmumi', route: 'companies' }];
		this.app.breadcrumbs.push({ title: this.company.nosaukums, route: `company/${this.company.id}` });
	}

	getEmployee(id) {
		for (let i = 0; i < this.company.darbinieki.length; i++) {
			if (this.company.darbinieki[i].id === id) {
				return this.company.darbinieki[i];
			}
		}
		return null;
	}

	avatar(event) {
		let employee = this.getEmployee(event.detail.id);
		let fileList = event.target.files;
		if (fileList.length > 0) {
			let formData = new FormData();
			formData.append('avatar', fileList[0]);
			formData.append('id', employee.id);

			this.http.fetch('employee/avatar', {
				method: 'POST',
				body: formData,
				headers: new Headers()
			})
				.then(response => response.json())
				.then(data => employee.avatar = data.avatar)
				.catch(error => console.log(error));
		}
	}

	lockUnlock(event) {
		let employee = this.getEmployee(event.detail.id);
		this.rest.put(`employee/lock/${employee.id}`).then(data => {
			if (data !== false) {
				employee.aktivs = !employee.aktivs;
			}
		});
	}

	changePassword(event) {
		let employee = this.getEmployee(event.detail.id);
		this.dialog.open({ viewModel: PasswordDialog, model: { id: employee.id, title: `${employee.pilnsVards} - jauna parole` } });
	}

	searchEmployee(event) {
		this.employeeSearch.id = this.company.id;
		this.dialog.open({ viewModel: SearchDialog, model: this.employeeSearch })
			.whenClosed(response => {
				if (!response.wasCancelled) {
					this.addEmployee(response.output);
				}
			});
	}

	addEmployee(employee) {
		this.rest.post(`companies/${this.company.id}/employees/${employee.id}`).then(data => {
			if (data) {
				this.company.darbinieki.push(employee);
			}
		});
	}

	deleteEmployee(event) {
		let employee = this.getEmployee(event.detail.id);
		let deleteModel = {
			title: 'Darbinieka dzēšana',
			message: `Darbinieks <b> ${employee.pilnsVards} </b> tiks izdzēsts. Apstipriniet dzēšanu.`,
			label: 'Dzēst darbinieku',
			type: 'danger'
		};
		this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
			.whenClosed(response => {
				if (!response.wasCancelled) {
					this.rest.delete(`companies/${this.company.id}/employees/${event.detail.id}`)
						.then(data => {
							if (data) {
								let i = this.company.darbinieki.length;
								while (i--) {
									if (this.company.darbinieki[i].id === event.detail.id) {
										this.company.darbinieki.splice(i, 1);
									}
								}
							}
						});
				}
			});
	}
}