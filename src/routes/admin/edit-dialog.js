import { inject } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { HttpClient, json } from 'aurelia-fetch-client';

@inject(DialogController, HttpClient)
export class EditDialog {
    constructor(controller, http) {
        this.controller = controller;
        this.http = http;

        this.model = null;

        this.alert = { message: '', type: 'danger' };
    }

    activate(model) {
        this.model = model;
    }

    save() {
        let item = { 
            id: this.model.id, 
            nosaukums: this.model.value.toUpperCase() 
        };
        if(this.model.parentId) {
            item.markasId = this.model.parentId;
        }
        console.log(item);
        let method = item.id > 0 ? 'put' : 'post';
        this.http.fetch(this.model.url, { method: method, body: json(item) })
            .then(response => {
                this.statusCode = response.status;
                return response.json();
            })
            .then(data => {
                if (this.statusCode === 200) {
                    if (method === 'post') {
                        item.id = data.id;
                    }
                    this.controller.ok(item);
                } else {
                    this.showError(data.messages[0]);
                }
            })
            .catch(error => {
                this.showError(error.message);
            });
    }

    showError(message) {
        this.alert.type = 'danger';
        this.alert.message = message;
    }

    showSuccess(message) {
        this.alert.type = 'success';
        this.alert.message = message;
    }
}