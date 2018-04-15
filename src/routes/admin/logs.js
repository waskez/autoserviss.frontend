import { inject } from 'aurelia-framework';
import { AuthService } from 'services/auth-service';
import { App } from 'app';

@inject(AuthService, App)
export class Logs {
	constructor(auth, app) {
        this.app = app;

		this.allowEdit = auth.getUser().admin;

		this.logDate = null;
		this.config = {
			enableTime: false,
			altFormat: 'd.m.Y'
		};
	}

	activate() {
		this.app.breadcrumbs = [
			{ title: 'Sākums', route: 'status' },
			{ title: 'Logs', route: 'logs' }
		];
	}

	dateChanged(event) {
		document.getElementById('contents').textContent = 'Notiek ielāde ...';
		this.getLogs(event.target.value)
			.then(data => {
				if (data.length === 0) {
					document.getElementById('contents').textContent = 'Nav datu';
				} else {
					document.getElementById('contents').textContent = data;
				}
			})
			.catch(error => {
				document.getElementById('contents').textContent = error.message;
				console.error(error);
			});
	}

	getLogs(logDate) {
		return new Promise((resolve, reject) => {
			let token = sessionStorage.getItem('access_token');
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(xhr.responseText);
					} else {
                        let response = JSON.parse(xhr.response);
						let error = new Error(response.messages[0]);
						error.code = xhr.status;
						reject(error);
					}
				}
            }
			xhr.open('GET', `${this.baseUrl}/admin/logs?date=${logDate}`, true);
			xhr.setRequestHeader('Accept', 'text/plain; charset=utf-8');
			xhr.setRequestHeader('Authorization', 'Bearer ' + token);
			xhr.send(null);
		});
	}

	get baseUrl() {
		let getUrl = window.location;
		let url = `${getUrl.protocol}//${getUrl.host}/`;
		if (url == 'http://localhost:9000/') {
			return 'http://localhost:12345/';
		}
		return url;
	}
}