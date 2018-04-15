import { inject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";

@inject(DialogController)
export class ConfirmDialog {
	constructor(controller) {
		this.controller = controller;

		this.model = {
			title: '',
			message: '',
			label: '',
			type: ''
		};
	}

	activate(params) {
		this.model = params;
	}
}