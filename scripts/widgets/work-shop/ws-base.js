import template from 'template'

export default class CWSBase {
    static prepareTemplates(tpl) {
        this._templates = template.parseTemplate(tpl);
    }

    static template(name) {
        return this._templates[name];
    }

    constructor(container, tpl) {
        this._container = container;
        CWSBase.prepareTemplates(tpl)
    }

    initContainer(container, tpl) {
        this._container = container;
        CWSBase.prepareTemplates(tpl)
    }

    render() {
        if (this._container.children().length === 0)
            this.createItem();
        this.refreshItem();
    }

    createItem() {

    }

    refreshItem() {

    }
}
