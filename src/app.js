import { Aurelia, inject } from 'aurelia-framework';
import { Redirect } from 'aurelia-router';
import { AuthService } from 'services/auth-service';
import { RestService } from 'services/rest-service';

@inject(Aurelia, AuthService, RestService)
export class App {
	constructor(aurelia, auth, rest) {
		this.aurelia = aurelia;
		this.auth = auth;
    this.rest = rest;

		this.breadcrumbs = [];
	}

	activate() {
		this.user = this.auth.getUser();
	}

	configureRouter(config, router) {
		config.title = 'AutoServiss';
		let step = new AuthStep;
		config.addAuthorizeStep(step)
		config.map([
			{ route: ['', 'status'], name: 'status', moduleId: 'routes/home/status', title: 'Statuss', nav: false, settings: { auth: true } },

			{ route: 'unauthorized', name: 'unauthorized', moduleId: 'routes/errors/unauthorized', title: '401', nav: false, settings: { auth: false } },
			{ route: 'forbidden', name: 'forbidden', moduleId: 'routes/errors/forbidden', title: '403', nav: false, settings: { auth: false } },
			{ route: 'expired', name: 'expired', moduleId: 'routes/errors/expired', title: '440', nav: false, settings: { auth: false } },

			{ route: 'settings', name: 'settings', moduleId: 'routes/admin/settings', title: 'Iestatījumi', nav: false, settings: { auth: true } },
			{ route: 'logs', name: 'logs', moduleId: 'routes/admin/logs', title: 'Kļūdu žurnāls', nav: false, settings: { auth: true } },

			{ route: 'companies', name: 'companies', moduleId: 'routes/companies/list', title: 'Uzņēmumi', nav: false, settings: { auth: true } },
			{ route: 'companies/:id', name: 'company', moduleId: 'routes/companies/details', title: 'Uzņēmums', nav: false, settings: { auth: true } },
			{ route: 'companies/:id/edit', name: 'company-edit', moduleId: 'routes/companies/edit', title: 'Uzņēmums', nav: false, settings: { auth: true } },
			{ route: 'companies/:companyId/employees/:employeeId', name: 'employee-edit', moduleId: 'routes/employees/edit', title: 'Darbinieks', nav: false, settings: { auth: true } },			

			{ route: 'customers/list/:veids', name: 'customers', moduleId: 'routes/customers/list', title: 'Klienti', nav: false, settings: { auth: true } },
			{ route: 'customers/:id', name: 'customer', moduleId: 'routes/customers/details', title: 'Klients', nav: false, settings: { auth: true } },
			{ route: 'customers/:id/:veids', name: 'customer-edit', moduleId: 'routes/customers/edit', title: 'Klients', nav: false, settings: { auth: true } },
		
			{ route: 'customers/:customerId/vehicles/:vehicleId', name: 'vehicle-edit', moduleId: 'routes/vehicles/edit', title: 'Transportlīdzeklis', nav: false, settings: { auth: true } },
			{ route: 'vehicles/:id', name: 'vehicle-details', moduleId: 'routes/vehicles/details', title: 'Transportlīdzeklis', nav: false, settings: { auth: true } },

			{ route: 'service/under-repair', name: 'under-repair', moduleId: 'routes/service/under-repair', title: 'Remontā', nav: false, settings: { auth: true } },
      { route: 'service/vehicle/:id/sheet', name: 'vehicle-sheet', moduleId: 'routes/service/servisa-lapa', title: 'Servisa lapa', nav: false, settings: { auth: true } },
      { route: 'service/sheet/:id', name: 'sheet', moduleId: 'routes/service/servisa-lapa', title: 'Servisa lapa', nav: false, settings: { auth: true } }
		]);
		let handleUnknownRoutes = (instruction) => {
			return { route: 'not-found', name: 'not-found', moduleId: 'routes/errors/not-found', title: '404', nav: false, settings: { auth: false } };
		}
		config.mapUnknownRoutes(handleUnknownRoutes);
		this.router = router;
	}

	logout() {
		this.auth.logout().then(result => {
			if (result) {
				this.router.navigate('', { replace: true, trigger: false });
				this.router.deactivate();
				this.router.reset();
				this.aurelia.setRoot('login');
			}
		});
	}
}

@inject(Aurelia)
class AuthStep {
	constructor(aurelia) {
		this.aurelia = aurelia;
	}

	run(navigationInstruction, next) {
		if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) {
			if (!this.isLoggedIn) {
				return next.cancel(this.aurelia.setRoot('login'));
			}
		}

		return next();
	}

	get isLoggedIn() {
		let token = sessionStorage.getItem("access_token");
		return token !== null;
	}
}
