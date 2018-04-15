import { inject } from 'aurelia-framework';
import { App } from 'app';

@inject(App)
export class NotFound {   
    constructor(app) {
		app.breadcrumbs = [
			{ title: 'Sākums', route: 'status' },
			{ title: 'Kļūda: 404', route: 'not-found' }
		];
    }
}