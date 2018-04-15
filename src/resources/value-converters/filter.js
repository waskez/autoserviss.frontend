import { inject } from 'aurelia-framework';
import { Helpers } from 'common/helpers';

@inject(Helpers)
export class FilterValueConverter {
    constructor(helpers){
        this.helpers = helpers;
    }
    toView(array, searchTerm, filterFunc) {
        return array.filter((item) => {
            let matches = searchTerm && searchTerm.length > 0 ? filterFunc(searchTerm, item, this.helpers) : true;
            return matches;
        });
    }
}