import { inject } from 'aurelia-framework';
import { App } from 'app';

@inject(App)
export class Forbidden {   
    constructor(app) {
		app.breadcrumbs = [
			{ title: 'Sākums', route: 'status' },
			{ title: 'Kļūda: 403', route: 'forbidden' }
		];
    }
}