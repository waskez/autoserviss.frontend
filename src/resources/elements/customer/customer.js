import { inject, bindable } from 'aurelia-framework';

@inject(Element)
export class Customer {
	@bindable customer;
	@bindable allowEdit = false;
	@bindable currentPage = '';

	constructor(element) {
		this.element = element;
	}

	delete() {
		let event = new CustomEvent('delete', { detail: { id: this.customer.id, veids: this.customer.veids }, bubbles: true })
		this.element.dispatchEvent(event);
	}
}