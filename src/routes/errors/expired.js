import { Aurelia, inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { AuthService } from 'services/auth-service';
import { App } from 'app';

@inject(Aurelia, Router, AuthService, App)
export class TokenExpired {
	constructor(aurelia, router, auth, app) {
		this.aurelia = aurelia;
		this.router = router;
		this.auth = auth;

		app.breadcrumbs = [
			{ title: 'Sākums', route: 'status' },
			{ title: 'Kļūda: 440', route: 'expired' }
		];
	}

	login() {
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