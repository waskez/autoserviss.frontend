import environment from './environment';
import { FetchConfig } from 'fetch-config';
import { AuthService } from 'services/auth-service';

export function configure(aurelia) {
	aurelia.use
		.standardConfiguration()
		.feature('resources')
		.plugin('aurelia-dialog', config => {
			config.useDefaults();
			//config.settings.lock = true;
			config.settings.centerHorizontalOnly = true;
			config.settings.startingZIndex = 1031;
			//config.settings.keyboard = true;
    });

	if (environment.debug) {
		aurelia.use.developmentLogging();
	}

	aurelia.start().then(() => {

		let fetch = aurelia.container.get(FetchConfig);
		fetch.configure();

		let auth = aurelia.container.get(AuthService);
		if (auth.isLoggedIn) {
			aurelia.setRoot('app');
		} else {
			aurelia.setRoot('login');
		}
		//aurelia.setRoot();
	});
}
