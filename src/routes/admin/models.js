import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { EditDialog } from 'routes/admin/edit-dialog';
import { App } from 'app';

@inject(RestService, DialogService, App)
export class Models {
    constructor(rest, dialog, app) {
        this.rest = rest;
        this.dialog = dialog;
        this.app = app;

        this.brands = [];
        this.selBrandId = 0;

        this.models = [];
    }

    canActivate() {
        return this.rest.get('markas')
            .then(data => {
                if (data !== false) {
                    this.brands = data.markas;
                    this.brands.unshift({ id: 0, nosaukums: 'Izvēlies marku' })
                    return true;
                }
                return false;
            });
    }

    activate() {
        this.app.breadcrumbs = [
            { title: 'Sākums', route: 'status' },
            { title: 'Iestatījumi', route: 'settings' },
            { title: 'Modeļi', route: 'models' }
        ];
    }

    onBrandSelected(id) {
        if (id > 0) {
            this.rest.get(`modeli/${id}`)
                .then(data => {
                    if (data !== false) {
                        this.models = data.modeli;
                    }
                });
        } else {
            this.models = [];
        }
    }

    edit(item) {
        let model = {
            title: 'Jauns modelis',
            label: 'Modelis',
            id: item === null ? 0 : item.id,
            parentId: this.selBrandId,
            value: item === null ? '' : item.nosaukums,
            url: 'admin/modeli'
        }
        this.dialog.open({ viewModel: EditDialog, model: model })
            .whenClosed(response => {
                if (!response.wasCancelled) {
                    if (item) {
                        this.models.forEach(x => {
                            if (x.id === response.output.id) {
                                x.nosaukums = response.output.nosaukums;
                            }
                        });
                    } else {
                        let model = { id: response.output.id, markasId: response.output.markasId, nosaukums: response.output.nosaukums };
                        this.models.unshift(model);
                    }
                }
            });
    }

    delete(item) {
        let deleteModel = {
            title: 'Modeļa dzēšana',
            message: `Modelis <b> ${item.nosaukums} </b> tiks izdzēsts. Apstipriniet dzēšanu.`,
            label: 'Dzēst modeli',
            type: 'danger'
        };
        this.dialog.open({ viewModel: ConfirmDialog, model: deleteModel })
            .whenClosed(response => {
                if (!response.wasCancelled) {
                    return this.rest.delete(`admin/modeli/${item.id}`)
                    .then(data => {
                        if (data) {
                            let index = this.models.indexOf(item);
                            this.models.splice(index, 1);
                        }
                    });
                }
            });
    }
}