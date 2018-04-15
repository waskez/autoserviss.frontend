import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { Router } from 'aurelia-router';

@inject(HttpClient, Router)
export class FetchConfig {
	constructor(http, router) {
		this.http = http;
		this.router = router;
	}

	configure() {
		this.http.configure(httpConfig => {
			let self = this;
			httpConfig
				.withBaseUrl(this.baseUrl)
				.withDefaults({
					headers: { 'Accept': 'application/json' },
					'Access-Control-Allow-Origin': 'http://localhost:9000'
				})
				.withInterceptor({
					request(request) {
						let token = sessionStorage.getItem('access_token');
						if (token) { // login route tokena nav
							request.headers.set('Authorization', `Bearer ${token}`);
						}
						return request;
					},
					response(response) {
						if (response.status === 401) {
							let error = response.headers.get('WWW-Authenticate'); // ar CORS nedarbojas !!!
							if (error) {								
								if (error.indexOf('error_description="The token is expired"') > -1) {
									self.router.navigateToRoute('expired');
								} else {
									self.router.navigateToRoute('unauthorized');
								}
							} else {
								self.router.navigateToRoute('unauthorized');
							}
						} else if (response.status === 403) {
							self.router.navigateToRoute('forbidden');
						} else if (response.status === 440) {
							self.router.navigateToRoute('expired');
						}
						return response;
					}
				});
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