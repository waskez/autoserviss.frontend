import {inject, bindable, bindingMode} from "aurelia-framework";

@inject(Element)
export class AubsDropdownCustomAttribute {

    @bindable({defaultBindingMode: bindingMode.twoWay}) isOpen;
    @bindable onToggle;

    state;

    constructor(element) {
        this.element = element;

        this.outsideClickListener = evt => this.handleBlur(evt);
    }

    bind() {
        if (this.hasIsOpen()) {
            this.state = false;
        } else {
            this.state = this.isOpen;
        }
    }

    attached() {
        this.isAttached = true;
        this.setClass();

        this.setListener();
    }

    setListener(){
        document.addEventListener('click', this.outsideClickListener)
    }

    detached() {
        document.removeEventListener('click', this.outsideClickListener);
    }

    autoCloseChanged(newValue, oldValue){
        if(!this.isAttached){
            return;
        }

        if(oldValue !== 'disabled'){
            this.detached();
        }

        this.setListener();
    }

    isOpenChanged() {
        this.state = this.isOpen;

        if (this.isAttached) {
            this.setClass();
        }
    }

    toggle() {
        if (this.hasIsOpen()) {
            this.isOpen = !this.state;
        }
        this.state = !this.state;
        
        if(typeof this.onToggle === 'function') {
            this.onToggle({open: this.state});
        }

        this.setClass();
    }

    handleBlur(evt) {
        if(!this.state){
            return;
        }

        if (!this.element.contains(evt.target) || this.isMenuItem(evt)) {
            this.toggle();
        }
    }

    isMenuItem(evt){
        return evt.target.classList.contains('dropdown-item');
    }

    setClass() {
        let child = this.element.getElementsByClassName('dropdown-menu')[0]; // izmaiņas bootstrap 4
        if (this.state) {
            this.element.classList.add('show');
            child.classList.add('show'); // izmaiņas bootstrap 4
        } else {
            this.element.classList.remove('show');
            child.classList.remove('show'); // izmaiņas bootstrap 4
        }
    }

    hasIsOpen() {
        return this.isOpen !== undefined && this.isOpen !== null;
    }
}