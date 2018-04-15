import { inject } from 'aurelia-framework';
import { RestService } from 'services/rest-service';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'common/confirm-dialog';
import { App } from 'app';

@inject(RestService, DialogService, App)
export class Backup {
  constructor(rest, dialog, app) {
    this.rest = rest;
    this.dialog = dialog;
    this.app = app;

    this.backupDate = null;
  }

  canActivate() {
    return this.rest.get('admin/backup/date')
      .then(data => {
        if (data !== false) {
          this.backupDate = data.date;
          return true;
        }
        return false;
      });
  }

  activate() {
    this.app.breadcrumbs = [
      { title: 'Sākums', route: 'status' },
      { title: 'Iestatījumi', route: 'settings' },
      { title: 'Rezerves kopija', route: 'backup' }
    ];
  }

  backup() {
    this.rest.postAndGetData('admin/backup/create')
      .then(data => {
        if (data !== false) {
          this.backupDate = data.date;
        }
      });
  }

  replace() {
    let replaceModel = {
      title: 'Datubāzes faila aizstāšana',
      message: 'Esošais datubāzes fails tiks aizstāts ar rezerves kopijas failu. Apstipriniet faila aizstāšanu.',
      label: 'Aizstāt failu',
      type: 'danger'
    };
    this.dialog.open({ viewModel: ConfirmDialog, model: replaceModel })
      .whenClosed(response => {
        if (!response.wasCancelled) {
          return this.rest.post('admin/backup/replace')
            .then(data => {
              if (data) {
                this.shutdown();
              }
            });
        }
      });
  }

  shutdown() {
    this.rest.post('admin/shutdown');
  }
}
