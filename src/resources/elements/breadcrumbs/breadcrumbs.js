import { inject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";

@inject(Router)
export class Breadcrumbs {
	@bindable items = [];
    constructor(router) {        
        this.router = router;
    }

    navigate(route) {
        this.router.navigate(route);
    }
}