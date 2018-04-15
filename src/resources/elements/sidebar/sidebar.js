import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { SearchDialog } from 'common/search-dialog';
import { CustomerSearch } from 'routes/customers/search-model';
import { VehicleSearch } from 'routes/vehicles/search-model';

@inject(Router, EventAggregator, DialogService, CustomerSearch, VehicleSearch)
export class Sidebar {
	constructor(router, ea, dialog, customerModel, vehicleModel) {
		this.router = router;
		this.ea = ea;
		this.dialog = dialog;
		this.customerModel = customerModel;
		this.vehicleModel = vehicleModel;
	}

	attached() {
		setCurrentRoute(this.router.currentInstruction.fragment);
		this.subscription = this.ea.subscribe('router:navigation:complete', response => {
			let fragment = response.instruction.fragment;
			if (fragment == '/') fragment = '';
			setCurrentRoute(fragment);
		});
	}

	detached() {
		this.subscription.dispose();
	}

	navItemToggle(event) {
		event.target.parentNode.classList.toggle('open');
	}

	search(param) {
		let searchModel = null;
		if (param === 'customer') {
			searchModel = this.customerModel;
		} else if (param === 'vehicle') {
			searchModel = this.vehicleModel;
		} else {
			return;
		}

		this.dialog.open({ viewModel: SearchDialog, model: searchModel })
			.whenClosed(response => {
				if (!response.wasCancelled) {
					switch (param) {
						case 'customer':
							this.router.navigate(`customers/${response.output.id}`);
							break;
						case 'vehicle':
							this.router.navigate(`customers/${response.output.klientaId}`);
							break;
					}
				}
			});
	}
}

function setCurrentRoute(fragment) {
	let navBar = document.querySelector('nav > .nav');

	let navLink = navBar.querySelectorAll('.nav-link');
	for (let i = 0; i < navLink.length; ++i) {
		navLink[i].classList.remove('active');
	}

	let dropdowns = navBar.querySelectorAll('.nav-dropdown');
	for (let i = 0; i < dropdowns.length; ++i) {
		dropdowns[i].classList.remove('open');
	}

	let hrefActive = navBar.querySelector(`.nav-item > a[href="#${fragment}"]`);
	if (hrefActive) {
		hrefActive.classList.add('active');
		let dropdown = hrefActive.closest('.nav-dropdown');
		if (dropdown) {
			dropdown.classList.add('open');
		}
	}
}