import { Aurelia, inject } from 'aurelia-framework';
import { AuthService } from 'services/auth-service';
import { Helpers } from 'common/helpers';
import velocity from "velocity-animate";

@inject(Aurelia, AuthService, Helpers)
export class Login {
	constructor(aurelia, auth, helpers) {
		this.aurelia = aurelia;
		this.auth = auth;
		this.helpers = helpers;

		this.username = getUsername();
		this.password = '';
		this.email = '';

		this.alert = { message: '', type: 'danger' };

		this.emailCollapsed = true;
		this.signUp = false;
		this.isSending = false;
	}

	attached() {
		if (this.username) {
			document.getElementById('loginPassword').focus();
		} else {
			document.getElementById('loginUsername').focus();
		}
	}

	detached() {
		this.clearAlert();
		this.password = '';
		this.email = '';
	}

	login() {
		this.clearAlert();
		this.emailCollapsed = true;
		if (this.username.length == 0) {
			this.showError('Nav norādīts lietotājvārds');
			return;
		}
		if (this.password.length == 0) {
			this.showError('Nav norādīta parole');
			return;
		}
		this.signUp = true;
		this.auth.login(this.username, this.password, false)
			.then(result => {
				this.signUp = false;
				if (result === 'OK') {
					storeUsername(this.username);
					this.aurelia.setRoot('app');
				} else {
					this.showError(result);
				}
			});
	}

	forgotten() {
		this.emailCollapsed = !this.emailCollapsed;
	}

	send() {
		if (!this.email) {
			this.showError('Nav norādīta e-pasta adrese');
			return;
		}
		if (this.helpers.validateEmail(this.email)) {
			this.isSending = true;
			this.clearAlert();
			this.auth.sendForgottenPassword(this.email).then(response => {
				this.isSending = false;
				if (response === true) {
					this.showInfo('Parole nosūtīta');
				} else {
					this.showError(response);
				}
			});
		} else {
			this.showError('Nepareiza e-pasta adrese');
			return;
		}
	}

	clearAlert() {
		this.alert.message = '';
	}

	showError(message) {
		this.alert.type = 'danger';
		this.alert.message = message;		
	}

	showInfo(message) {
		this.alert.type = 'info';
		this.alert.message = message;
	}
}

function storeUsername(username) {
	localStorage.setItem('lastUser', username);
}

function getUsername() {
	let username = localStorage.getItem('lastUser');
	if (username) {
		return username;
	}
	return '';
}