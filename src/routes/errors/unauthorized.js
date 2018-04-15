import { inject } from 'aurelia-framework';
import { App } from 'app';

@inject(App)
export class Unauthorized {   
    constructor(app) {
		app.breadcrumbs = [
			{ title: 'Sākums', route: 'status' },
			{ title: 'Kļūda: 401', route: 'unauthorized' }
		];
    }
}