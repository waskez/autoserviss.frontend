import { inject, bindable } from 'aurelia-framework';

@inject(Element)
export class Company {
	@bindable company;
	@bindable allowEdit = false;
	@bindable currentPage = '';

	constructor(element) {
		this.element = element;
	}

	dispatch(name) {
		let event = new CustomEvent(name, { detail: { id: this.company.id }, bubbles: true })
		this.element.dispatchEvent(event);
	}
}