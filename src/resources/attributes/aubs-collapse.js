import { inject, bindable } from "aurelia-framework";
import velocity from "velocity-animate";

@inject(Element)
export class AubsCollapseCustomAttribute {

	@bindable collapsed = false;

	constructor(element) {
		this.element = element;
	}

	attached() {
		if (this.collapsed) {
			this.element.style.display = 'none';
		}

		this.isAttached = true;
	}

	collapsedChanged() {
		if (!this.isAttached) {
			return;
		}

		if (this.collapsed) {
			velocity(this.element, 'slideUp', { duration: 250 });
				//.then(r => this.element.dispatchEvent(new CustomEvent('collapsed', { bubbles: true })));
			this.element.classList.remove('show');
		} else {
			this.element.classList.add('show');
			velocity(this.element, 'slideDown', { duration: 250 });
				//.then(r => this.element.dispatchEvent(new CustomEvent('expanded', { bubbles: true })));
		}
	}
}