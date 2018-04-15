import { inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { Notify } from 'common/notify';

@inject(HttpClient, Notify)
export class RestService {
    constructor(http, notify) {
        this.http = http;
        this.notify = notify;

        this.isRequesting = false;
    }

    get(url) {
        this.isRequesting = true;
        return this.http.fetch(url)
            .then(response => {
                this.statusCode = response.status;
                return response.json();
            })
            .then(data => {
                this.isRequesting = false;
                if (this.statusCode === 200) {
                    return data;
                } else if (this.statusCode === 401) { // beidzies tokena derīguma termiņš TODO: 440
                    return false;
                } else {
                    data.messages.forEach(m => this.notify.warn(m));
                    return false;
                }
            })
            .catch(error => {
                this.isRequesting = false;
                this.notify.error(error.message);
                console.error(error.message);
                return false;
            });
    }

    post(url, data) {
        this.isRequesting = true;
        return this.http.fetch(url, { method: 'post', body: json(data) })
            .then(response => {
                this.statusCode = response.status;
                return response.json();
            })
            .then(data => {
                this.isRequesting = false;
                if (this.statusCode === 201 || this.statusCode === 200) {
                    this.notify.info(data.message);
                    return true;
                } else {
                    data.messages.forEach(m => this.notify.warn(m));
                    return false;
                }
            })
            .catch(error => {
                this.isRequesting = false;
                this.notify.error(error.message);
                console.error(error.message);
                return false;
            });
    }

    postAndGetData(url, data) {
        this.isRequesting = true;
        return this.http.fetch(url, { method: 'post', body: json(data) })
            .then(response => {
                this.statusCode = response.status;
                return response.json();
            })
            .then(data => {
                this.isRequesting = false;
                if (this.statusCode === 200) {
                    return data;
                } else {
                    data.messages.forEach(m => this.notify.warn(m));
                    return false;
                }
            })
            .catch(error => {
                this.isRequesting = false;
                this.notify.error(error.message);
                console.error(error.message);
                return false;
            });
    }

    put(url, data) {
        this.isRequesting = true;
        return this.http.fetch(url, { method: 'put', body: json(data) })
            .then(response => {
                this.statusCode = response.status;
                return response.json();
            })
            .then(data => {
                this.isRequesting = false;
                if (this.statusCode === 200) {
                    this.notify.success(data.message);
                    return true;
                } else {
                    data.messages.forEach(m => this.notify.warn(m));
                    return false;
                }
            })
            .catch(error => {
                this.isRequesting = false;
                this.notify.error(error.message);
                console.error(error.message);
                return false;
            });
    }

    delete(url, data) {
        this.isRequesting = true;
        return this.http.fetch(url, { method: 'delete', body: json(data) })
            .then(response => {
                this.statusCode = response.status;
                return response.json();
            })
            .then(data => {
                this.isRequesting = false;
                if (this.statusCode === 200) {
                    this.notify.success(data.message);
                    return true;
                } else {
                    data.messages.forEach(m => this.notify.warn(m));
                    return false;
                }
            })
            .catch(error => {
                this.isRequesting = false;
                this.notify.error(data.message);
                console.error(error.message);
                return false;
            });
    }

    getPdf(url) {
        this.http.fetch(url)
            .then(response => {
                this.statusCode = response.status;
                return response.blob();
            })
            .then(data => {
                if (this.statusCode === 200) {
                    let pdfFile = new Blob([data], { type: 'application/pdf' });
                    let pdfFileUrl = URL.createObjectURL(pdfFile);
                    window.open(pdfFileUrl);
                } else {
                    this.notify.error('Kļūda saņemot pdf failu');
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
}