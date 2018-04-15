export class Settings {
    configureRouter(config, router) {
        config.map([
          { route: ['', 'brands'], name: 'brands', moduleId: 'routes/admin/brands', nav: true, title: 'Markas' },
          { route: 'models', name: 'models', moduleId: 'routes/admin/models', nav: true, title: 'Modeļi' },
          { route: 'backup', name: 'backup', moduleId: 'routes/admin/backup', nav: true, title: 'Rezerves kopija' }     
        ]);
        this.router = router;
    }	
}
