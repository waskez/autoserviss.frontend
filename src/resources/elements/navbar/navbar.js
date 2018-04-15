import { inject } from 'aurelia-framework';
import { bindable } from 'aurelia-templating';

@inject(Element)
export class Navbar {
	@bindable user;
	constructor(element) {
		this.element = element;
	}

	toggleSidebar() {
		document.body.classList.toggle('sidebar-hidden');
	}

	openSidebar() {
		document.body.classList.toggle('sidebar-mobile-show');
	}

	logout() {
		this.element.dispatchEvent(new CustomEvent('logout', { bubbles: true }));
	}
}