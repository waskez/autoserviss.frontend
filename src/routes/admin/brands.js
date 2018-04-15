import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { EditDialog } from 'routes/admin/edit-dialog';
import { App } from 'app';

@inject(RestService, DialogService, App)
export class Brands {
    constructor(rest, dialog, app) {
        this.rest = rest;
        this.dialog = dialog;
        this.app = app;

        this.letters = generatePagination();

        this.brands = [];
        this.selectedLetter = this.letters[0];
    }

    canActivate() {
        return this.rest.get('markas')
            .then(data => {
                if (data !== false) {
                    this.brands = data.markas;
                    return true;
                }
                return false;
            });
    }

    activate() {
        this.app.breadcrumbs = [
            { title: 'Sākums', route: 'status' },
            { title: 'Iestatījumi', route: 'settings' },
            { title: 'Markas', route: 'brands' }
        ];
        this.load(this.selectedLetter);
    }

    load(letter) {
        this.letters.forEach(l => l.active = false);
        letter.active = true;
        this.selectedLetter = letter.letter;
    }

    edit(item) {
        let model = {
            title: 'Jauna marka',
            label: 'Marka',
            id: item === null ? 0 : item.id,
            value: item === null ? '' : item.nosaukums,
            url: 'admin/markas'
        }
        this.dialog.open({ viewModel: EditDialog, model: model })
            .whenClosed(response => {
                if (!response.wasCancelled) {
                    if (item) {
                        this.brands.forEach(x => {
                            if (x.id === response.output.id) {
                                x.nosaukums = response.output.nosaukums;
                            }
                        });
                    } else {
                        let brand = { id: response.output.id, nosaukums: response.output.nosaukums };
                        this.brands.unshift(brand);
                    }
                }
            });
    }

    delete(item) {
        let deleteModel = {
            title: 'Markas dzēšana',
            message: `Marka <b> ${item.nosaukums} </b> un visi šīs markas modeļi tiks izdzēsti. Apstipriniet dzēšanu.`,
            label: 'Dzēst marku',
            type: 'danger'
        };
        this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
            .whenClosed(response => {
                if (!response.wasCancelled) {
                    return this.rest.delete(`admin/markas/${item.id}`)
                    .then(data => {
                        if (data) {
                            let index = this.brands.indexOf(item);
                            this.brands.splice(index, 1);
                        }
                    });
                }
            });
    }

    filterFunc(searchExpression, brand) {
        if (!searchExpression || !brand) return false;
        return brand.nosaukums.startsWith(searchExpression);
    }
}

function generatePagination() {
    let items = [];
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = 0; i < str.length; i++) {
        var nextChar = str.charAt(i);
        items.push({ letter: nextChar, active: false });
    }
    return items;
}