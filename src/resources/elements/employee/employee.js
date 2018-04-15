import { inject, bindable } from 'aurelia-framework';

@inject(Element)
export class Employee {
	@bindable employee;
	@bindable company;
	@bindable allowEdit = false;

	constructor(element) {
		this.element = element;
	}

	dispatch(name) {
		let event = new CustomEvent(name, { detail: { id: this.employee.id }, bubbles: true })
		this.element.dispatchEvent(event);
	}
}