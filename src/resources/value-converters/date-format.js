import { inject } from 'aurelia-framework';
import { Helpers } from 'common/helpers';

@inject(Helpers)
export class DateFormatValueConverter {
	constructor(helpers) {
		this.helpers = helpers;
	}
	toView(value) {
		if (value) {
			let date = new Date(value);
			return this.helpers.dateToString(date);
		}
		return '';
	}
}