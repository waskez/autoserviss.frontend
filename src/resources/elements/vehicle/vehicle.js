import { inject, bindable } from 'aurelia-framework';

@inject(Element)
export class Vehicle {
	@bindable vehicle;
	@bindable allowEdit = false;
	@bindable currentPage = '';

	constructor(element) {
		this.element = element;
	}

	delete() {
		let event = new CustomEvent('delete', { detail: { id: this.vehicle.id, numurs: this.vehicle.numurs, klientaId: this.vehicle.klientaId }, bubbles: true })
		this.element.dispatchEvent(event);
	}
}