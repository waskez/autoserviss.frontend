import { inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';

@inject(HttpClient)
export class AuthService {
	constructor(http) {
		this.http = http;

		this.renewTimer = null;
		// pēc pārlūka refresh - nepieciešams inicializēt token_refresh procedūru
		this.initTokenRefresh();
	}

	login(username, password, refresh) {
		let body = `grant_type=password&username=${username}&password=${password}`;
		if (refresh) {
			let token = sessionStorage.getItem('refresh_token');
			body = `grant_type=refresh_token&refresh_token=${token}`;
			console.log('refresh_token pieprasīšana ...');
		}
		return this.http.fetch('token', {
			method: 'post',
			body: body,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
			.then(response => {
				this.statusCode = response.status;
				return response.json();
			})
			.then(data => {
				if (this.statusCode === 200) {
					saveToken(data);
					this.initTokenRefresh();
					if (refresh) {
						console.log('atjaunināts refresh_tokens');
					}
					return 'OK';
				} else {
					if (refresh) {
						console.error(data.messages);
					}
					return data.messages;
				}
			})
			.catch(error => {
				console.error(error.message);
				return error.message;
			});
	}

	sendForgottenPassword(email) {
		let model = { key: "email", value: email };
		return this.http.fetch('employee/forgot', {
			method: 'post',
			body: json(model),
			headers: { 'Content-Type': 'application/json' }
		})
			.then(response => {
				this.statusCode = response.status;
				return response.json();
			})
			.then(data => {
				if (this.statusCode === 200) {
					return true;
				} else {
					return data.messages;
				}
			})
			.catch(error => {
				console.error(error.message);
				return error.message;
			});
	}

	logout() {
		window.clearTimeout(this.renewTimer);
		return new Promise((resolve, reject) => {
			removeToken();
			resolve(true);
		});
	}

	get isLoggedIn() {
		let token = sessionStorage.getItem("access_token");
		return token !== null;
	}

	getUser() {
		return JSON.parse(sessionStorage.getItem('current_user'));
	}

	initTokenRefresh() {
		let exp = expiresAfter();
		if (exp > 0) {
			let expires = ((exp - 10) * 1000); // mīnus 10 sekundes pirms termiņa beigām
			this.renewTimer = window.setTimeout(function () {
				this.login('', '', true);
			}.bind(this), expires);
		}
	}
}

function saveToken(data) {
	let user = { name: data.name, admin: data.admin };

	var expires_at = 0;
	var expires_in = parseInt(data.expires_in);
	var now = parseInt(Date.now() / 1000);
	expires_at = now + expires_in;

	sessionStorage.setItem('access_token', data.access_token);
	sessionStorage.setItem('refresh_token', data.refresh_token);
	sessionStorage.setItem('current_user', JSON.stringify(user));
	sessionStorage.setItem('expires_at', JSON.stringify(expires_at));
}

function removeToken() {
	sessionStorage.removeItem('access_token');
	sessionStorage.removeItem('refresh_token');
	sessionStorage.removeItem('current_user');
	sessionStorage.removeItem('expires_at');
}

function expiresAfter() {
	let after = 0;
	var expires_at = JSON.parse(sessionStorage.getItem('expires_at'));
	if (expires_at) {
		var now = parseInt(Date.now() / 1000);
		after = expires_at - now; // pēc cik sekundēm beigsies derīguma termiņš
	}
	return after;
}
