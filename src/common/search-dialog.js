import { inject, computedFrom } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";

@inject(DialogController)
export class SearchDialog {
	constructor(controller) {
		this.controller = controller;

		this.model = null;

		this.searchTerm = '';
		this.filterTerm = '';

		this.items = [];
		this.selectedItem = null;

		this.isSearching = false;
		this.resultsCollapsed = true;
		this.emptyCollapsed = true;
	}

	activate(model) {
        this.model = model;
    }

	doSearch() {
		if (this.searchTerm.length >= 2) {
			this.resultsCollapsed = true;
			this.emptyCollapsed = true;
			this.isSearching = true;			
			this.clearValues();
			let trm = { value: this.searchTerm, id: this.model.id };
			return this.model.search(trm).then(data => {
				this.items = data;				
				this.isSearching = false;
				this.resultsCollapsed = this.items.length === 0;
				this.emptyCollapsed = this.items.length > 0;
				return false;
			});
		} else {
			return false;
		}
	}

	clearValues() {
		this.filterTerm = '';
		this.selectedItem = null;
		this.items = [];
	}

	clearFilter() {
		this.filterTerm = '';
	}

	@computedFrom('selectedItem')
	get itemSelected() {
		return this.selectedItem != null;
	}

	selectAndClose() {
		this.controller.ok(this.selectedItem);
	}

	selectItem(item, close) {
		this.items.forEach(itm => itm.selected = false);
		item.selected = true;
		this.selectedItem = item;
		if (close) {
			this.selectAndClose();
		}
	}
}