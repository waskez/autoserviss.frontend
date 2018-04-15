import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { HttpClient, json } from 'aurelia-fetch-client';
import { RestService } from 'services/rest-service';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { App } from 'app';

@inject(Router, HttpClient, RestService, DialogService, App)
export class ServisaLapa {
	constructor(router, http, rest, dialog, app) {
		this.router = router;
		this.http = http;
		this.rest = rest;
		this.dialog = dialog;
		this.app = app;

		this.allowEdit = this.app.auth.getUser().admin;
		this.title = 'Servisa lapa';

		this.alert = { message: '', type: 'danger' };

		this.mechanics = [];
		this.companies = [];

		this.sheet = null;

		this.itemEdit = null;
		this.isSaving = false;

		this.handleBlur = e => {
			if (e.target.tagName === 'INPUT') {
				// darbiem un rezerves daļām neļaujam blur ja fokuss ir nākošajā cell
				let target = e.relatedTarget;
				if (target) {
					if (!target.classList.contains('job-item')) {
						if (this.itemEdit) {
							this.itemEdit.hasFocus = false;
						}
						this.itemEdit = null;
					}
				} else {
					if (this.itemEdit) {
						this.itemEdit.hasFocus = false;
					}
					this.itemEdit = null;
				}
				this.calculateTotal();
			}
		};
	}

	canActivate(params, routeConfig) {
        let url = routeConfig.name === 'sheet' ? `service/sheet/${params.id}` : `service/vehicle/${params.id}/sheet`;
		return this.rest.get(url)
			.then(data => {
				if (data !== false) {
					this.sheet = data.sheet;
					this.mechanics = data.mechanics;
					this.companies = data.companies;
					if (this.sheet.id === 0) {
						this.title = 'Jauna servisa lapa';
					}
					return true;
				}
				return false;
			});
	}

	activate() {
		this.app.breadcrumbs = [{ title: 'Sākums', route: 'status' }];
		if (this.sheet.klients.veids == 1) {
			this.app.breadcrumbs.push({ title: 'Fiziskās personas', route: 'customers/natural' });
			this.app.breadcrumbs.push({ title: this.sheet.klients.nosaukums, route: `customers/${this.sheet.klientaId}` });
		} else if (this.sheet.klients.veids == 2) {
			this.app.breadcrumbs.push({ title: 'Juridiskās personas', route: 'customers/legal' });
			this.app.breadcrumbs.push({ title: this.sheet.klients.nosaukums, route: `customers/${this.sheet.klientaId}` });
        }
        this.app.breadcrumbs.push({ title: this.sheet.transportlidzeklis.numurs, route: `vehicles/${this.sheet.transportlidzeklis.id}` });
		this.app.breadcrumbs.push({ title: this.title, route: 'sheet' });
	}

	attached() {
		document.addEventListener('blur', this.handleBlur, true);
	}

	detached() {
		document.removeEventListener('blur', this.handleBlur);
	}

	createDefect(veids) {
		let item = { id: 0, veids: veids, nosaukums: '' };
		this.sheet.defekti.push(item);
		this.itemEdit = item;
		this.itemEdit.hasFocus = true;
	}

	createMoney(veids) {
		let item = { id: 0, nosaukums: '', skaits: 1, mervieniba: 'gab', cena: 0 };
		this.sheet[veids].push(item);
		this.itemEdit = item;
		this.itemEdit.hasFocus = true;
	}

	edit(item) {
		this.itemEdit = item;
		this.itemEdit.hasFocus = true;
	}

	deleteDefect(item) {
		if (item.nosaukums) {
			let deleteModel = {
				title: 'Defekta dzēšana',
				message: `Defekts <b> ${item.nosaukums} </b> tiks izdzēsts. Apstipriniet dzēšanu.`,
				label: 'Dzēst defektu',
				type: 'danger'
			};
			this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
				.whenClosed(response => {
					if (!response.wasCancelled) {
						let index = this.sheet.defekti.indexOf(item);
						this.sheet.defekti.splice(index, 1);
					}
				});
		} else {
			let index = this.sheet.defekti.indexOf(item);
			this.sheet.defekti.splice(index, 1);
		}
	}

	deleteJob(item) {
		if (item.nosaukums) {
			let deleteModel = {
				title: 'Darba dzēšana',
				message: `Darbs <b> ${item.nosaukums} </b> tiks izdzēsts. Apstipriniet dzēšanu.`,
				label: 'Dzēst darbu',
				type: 'danger'
			};
			this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
				.whenClosed(response => {
					if (!response.wasCancelled) {
						let index = this.sheet.paveiktieDarbi.indexOf(item);
						this.sheet.paveiktieDarbi.splice(index, 1);
					}
				});
		} else {
			let index = this.sheet.paveiktieDarbi.indexOf(item);
			this.sheet.paveiktieDarbi.splice(index, 1);
		}
	}

	deletePart(item) {
		if (item.nosaukums) {
			let deleteModel = {
				title: 'Rezerves daļas dzēšana',
				message: `Rezerves daļa <b> ${item.nosaukums} </b> tiks izdzēsts. Apstipriniet dzēšanu.`,
				label: 'Dzēst rezerves daļu',
				type: 'danger'
			};
			this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
				.whenClosed(response => {
					if (!response.wasCancelled) {
						let index = this.sheet.rezervesDalas.indexOf(item);
						this.sheet.rezervesDalas.splice(index, 1);
					}
				});
		} else {
			let index = this.sheet.rezervesDalas.indexOf(item);
			this.sheet.rezervesDalas.splice(index, 1);
		}
	}

	uznemumsChanged(event) {
		this.sheet.mehaniki = [];
		this.companies.forEach(c => {
			if (c.nosaukums === event.target.value) {
				this.mechanics = c.mehaniki;
			}
		});
	}

	save(event) {
		if (event.keyCode === 13) {
			this.itemEdit.hasFocus = false;
			this.itemEdit = null;
		}
		return true;
	}

	calculateTotal() {
		let total = 0;
		this.sheet.paveiktieDarbi.forEach(d => {
			total += (d.cena * d.skaits);
		});
		this.sheet.rezervesDalas.forEach(d => {
			total += (d.cena * d.skaits);
		});
		this.sheet.kopejaSumma = total;
	}

	validate() {
		this.clearAlert();

		//1. Pieteiktie defekti
		let pieteiktie = this.sheet.defekti.filter((item) => item.veids === 'Pieteiktais');
		if (pieteiktie.length === 0) {
			this.showError('Nav norādīts neviens Pieteiktais defekts');
			return;
		} else {
			for(let i = 0; i < pieteiktie.length; i++) {
				if(!pieteiktie[i].nosaukums) {
					this.showError('Nav aizpildīts Pieteiktā defekta nosaukums');
					return;
				}
			}
		}
		//2. Atrastie defekti
		let atrastie = this.sheet.defekti.filter((item) => item.veids === 'Atrastais');
		if (atrastie) {
			for(let i = 0; i < atrastie.length; i++) {
				if(!atrastie[i].nosaukums) {
					this.showError('Nav aizpildīts Atrastā defekta nosaukums');
					return;
				}
			}
		}
		//3. Paliekošie defekti
		let paliekosie = this.sheet.defekti.filter((item) => item.veids === 'Paliekošais');
		if (paliekosie) {
			for(let i = 0; i < paliekosie.length; i++) {
				if(!paliekosie[i].nosaukums) {
					this.showError('Nav aizpildīts Paliekošā defekta nosaukums');
					return;
				}
			}
		}
		//4. Paveiktais darbs
		if(this.sheet.paveiktieDarbi) {
			for(let i = 0; i < this.sheet.paveiktieDarbi.length; i++) {
				if(!this.sheet.paveiktieDarbi[i].nosaukums) {
					this.showError('Nav aizpildīts Paveiktā darba nosaukums');
					return;
				} else if(!this.sheet.paveiktieDarbi[i].skaits) {
					this.showError('Nav aizpildīts Paveiktā darba skaits');
					return;
				} else if(!this.sheet.paveiktieDarbi[i].mervieniba) {
					this.showError('Nav aizpildīta Paveiktā darba mērvienība');
					return;
				} else if(!this.sheet.paveiktieDarbi[i].cena) {
					this.showError('Nav aizpildīta Paveiktā darba cena');
					return;
				}
			}
		}
		//5. Rezerves daļas
		if(this.sheet.rezervesDalas) {
			for(let i = 0; i < this.sheet.rezervesDalas.length; i++) {
				if(!this.sheet.rezervesDalas[i].nosaukums) {
					this.showError('Nav aizpildīts Rezerves daļas nosaukums');
					return;
				} else if(!this.sheet.rezervesDalas[i].skaits) {
					this.showError('Nav aizpildīts Rezerves daļas skaits');
					return;
				} else if(!this.sheet.rezervesDalas[i].mervieniba) {
					this.showError('Nav aizpildīta Rezerves daļas mērvienība');
					return;
				} else if(!this.sheet.rezervesDalas[i].cena) {
					this.showError('Nav aizpildīta Rezerves daļas cena');
					return;
				}
			}
		}
		//6. Mehāniķi
		if (this.sheet.mehaniki.length === 0) {
			this.showError('Nav norādīts neviens Mehāniķis');
			return;
		}

		this.submit();
	}

	submit() {
		this.isSaving = true;
		if (this.sheet.id !== 0) {
			this.http.fetch('service/sheet', { method: 'put', body: json(this.sheet) })
				.then(response => {
					this.statusCode = response.status;
					return response.json();
				})
				.then(data => {
					if (this.statusCode === 200) {
						this.showSuccess(data.message);
					} else {
						this.showError(data.messages[0]);
					}
					this.isSaving = false;
				})
				.catch(error => {
					this.showError(error.message);
					this.isSaving = false;
				});
		} else {
			this.http.fetch('service/sheet', { method: 'post', body: json(this.sheet) })
				.then(response => {
					this.statusCode = response.status;
					return response.json();
				})
				.then(data => {
					if (this.statusCode === 201 || this.statusCode === 200) {
						this.sheet.id = data.id;
						this.showSuccess(`${data.message}. Pēc 2 sekundēm notiks pārēja uz servisā esošo transportlīdzekļu sarakstu.`);
						setTimeout(function () {
							this.router.navigate('service/under-repair');
						}.bind(this), 2000);
					} else {
						this.showError(data.messages[0]);
					}
					this.isSaving = false;
				})
				.catch(error => {
					this.showError(error.message);
					this.isSaving = false;
				});
		}
	}

	print() {
		this.rest.getPdf(`service/sheet/${this.sheet.id}/print`);
	}

	clearAlert() {
		this.alert.message = '';
	}

	showError(message) {
		this.alert.type = 'danger';
		this.alert.message = message;
	}

	showWarning(message) {
		this.alert.type = 'warning';
		this.alert.message = message;
	}

	showSuccess(message) {
		this.alert.type = 'success';
		this.alert.message = message;
	}
}