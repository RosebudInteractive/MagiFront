import $ from 'jquery'
import 'fullpage.js'

let _instance = null;

export default class FullpageWrapper {
    static  getInstance(){
        if (!_instance) {
            _instance = new FullpageWrapper()
        }

        return _instance;
    }

    constructor() {
        this._moduleCounter = [];
        this._activeModule = '';
    }

    mount(moduleName, options) {
        if (this._activeModule !== moduleName) {
            if (this._activeModule) {
                // this.unmount(this._activeModule)
                if (this._moduleCounter.indexOf(moduleName) === -1) {
                    this._moduleCounter.push(moduleName)
                }
                return
            }
            let _container = $('#fullpage');
            if (_container.length > 0) {
                _container.fullpage(options);
                if (this._moduleCounter.indexOf(moduleName) === -1) {
                    this._moduleCounter.push(moduleName)
                }
                this._activeModule = moduleName;
            }
        }
    }

    unmount(moduleName) {
        if (this._activeModule === '') {
            return
        }

        let _index = this._moduleCounter.indexOf(moduleName);
        if (_index > -1) {
            this._moduleCounter.splice(_index, 1)
        }

        if ((this._activeModule === moduleName) || (this._moduleCounter.length === 0)) {
            this._internalUnmount()
            this._activeModule = '';
        }
    }

    _internalUnmount() {
        $.fn.fullpage.destroy(true)

        // if (this._moduleCounter.length === 0) {
            let _menu = $('.js-lectures-menu');
            _menu.remove();
        // }
    }

    _reinit(moduleName, options) {
        if (this._activeModule !== moduleName) {
            this.unmount(moduleName);
            this.mount(moduleName, options)
        }
    }
}

// export default (moduleName, options) => {
//     if (!_instance) {
//         _instance = new FullpageWrapper();
//         _instance.mount(moduleName, options)
//     } else {
//         _instance._reinit(moduleName, options)
//     }
//
//     return _instance
// }
