import { bindable } from 'aurelia-framework';

export class Multiselect {
	@bindable items = [];
	@bindable placeholder = 'Izvēlies mehāniķus';
	@bindable maxHeight = 300;
	@bindable selectedItems = [];

	constructor() {
		this.isOpen = false;
	}

	attached() {		
		this.selectedItems.forEach(i => i.selected = true);

		for (let i = 0; i < this.selectedItems.length; i++) {
			for (let k = 0; k < this.items.length; k++) {
				if (this.selectedItems[i].id === this.items[k].id) {
					this.items[k].selected = true;
					break;
				}
			}
		}
	}

	onItemClick(item) {
		item.selected = !item.selected;
		item.selected ? this.addSelected(item) : this.removeSelected(item);
	}

	addSelected(item) {
		this.selectedItems.push(item);
	}

	removeSelected(clickedItem) {
		this.selectedItems.forEach(item => {
			if (clickedItem.id === item.id) {
				this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
			}
		});
	}

	toggleDropdown(e) {	
		e.preventDefault();	
		this.isOpen = !this.isOpen;		
		if(this.isOpen){
			e.target.closest('.multiselect').focus();
		}
	}

	closeDropdown(e) {
		e.preventDefault();
		this.isOpen = false;
	}
}

