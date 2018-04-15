import { inject } from 'aurelia-framework';
import { Helpers } from 'common/helpers';

@inject(Helpers)
export class DateTimeFormatValueConverter {
	constructor(helpers) {
		this.helpers = helpers;
	}
	toView(value) {
		if (value) {
			let date = new Date(value);
			return this.helpers.dateTimeToString(date);
		}
		return '';
	}
}