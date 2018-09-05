'use strict';

exports.XMLParserBase = class XMLParserBase {

    static findAll(tag, root, nodes, isDeep, tp) {
        let type = tp ? tp : "element";
        if (root && root.elements && (root.elements.length > 0)) {
            for (let i = 0; i < root.elements.length; i++) {
                let elem = root.elements[i];
                if ((elem.type === type) && (elem.name == tag))
                    nodes.push(elem);
                if (isDeep)
                    XMLParserBase.findAll(tag, elem, nodes, isDeep, tp);
            }
        }
    }

    static findFirst(tag, root, tp) {
        let node = null;
        let type = tp ? tp : "element";
        if (root && root.elements && (root.elements.length > 0)) {
            for (let i = 0; (node === null) && (i < root.elements.length); i++) {
                let elem = root.elements[i];
                if ((elem.type === type) && (elem.name == tag)) {
                    node = elem;
                    break;
                }
                node = XMLParserBase.findFirst(tag, elem, tp);
            }
        }
        return node;
    }

    constructor() { }
    
    _findAll(tag, root, nodes, isDeep, tp) {
        return XMLParserBase.findAll(tag, root, nodes, isDeep, tp);
    }

    _findFirst(tag, root, tp) {
        return XMLParserBase.findFirst(tag, root, tp);
    }
}