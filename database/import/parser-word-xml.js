'use strict';
const _ = require('lodash');
const convert = require('xml-js');
const escape = require('escape-html');
const fs = require('fs');

const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const { Import } = require('../../const/common');

exports.ParserWordXML = class ParserWordXML {
    constructor() { }

    parseDocXMLFile(fileXml, options) {
        return readFileAsync(fileXml, 'utf8')
            .then((docXml) => this.parseDocXML(docXml, options));
    }

    parseDocXML(docXml, options) {
        return new Promise((resolve, reject) => {
            let opts = _.cloneDeep(options || {});
            let json = convert.xml2js(docXml);
            opts.Numbering = this._parseNumbering(this._findFirst("w:numbering", json), opts);
            opts.Refs = this._parseRefs(json, opts);
            opts.FootNotes = this._parseFootNotes(this._findFirst("w:footnotes", json), opts);
            let tbl = this._parseTable(this._findFirst("w:tbl", json), opts);
            resolve({ Rows: tbl.rows, Numbering: opts.Numbering, Refs: opts.Refs, FootNotes: opts.FootNotes});
        });
    }

    _parseTextProps(props, rowNum, cellNum, options) {
        let result = {};
        if (props && props.elements && (props.elements.length > 0)) {
            for (let i = 0; i < props.elements.length; i++) {
                let elem = props.elements[i];
                if (elem.type === "element") {
                    switch (elem.name) {
                        case "w:b":
                            result.b = true;
                            break;
                        case "w:i":
                            result.i = true;
                            break;
                        case "w:rStyle":
                            break;
                        case "w:rFonts":
                            result.font = elem.attributes ? elem.attributes["w:ascii"] : "";
                            break;
                        default:
                            if (options && options.errors)
                                options.errors.push(`(${rowNum},${cellNum}) _parseTextProps: Unhandled element "${elem.name}".`);
                    }
                }
            }
        }
        return result;
    }

    _parseNumbering(numb, options) {
        let abstract = {};
        let result = {};
        if (numb && numb.elements && (numb.elements.length > 0)) {
            for (let i = 0; i < numb.elements.length; i++) {
                let elem = numb.elements[i];
                if (elem.type === "element") {
                    switch (elem.name) {
                        case "w:abstractNum":
                            if (elem.attributes && elem.attributes["w:abstractNumId"]) {
                                let id = elem.attributes["w:abstractNumId"];
                                let abstrNum = abstract[id] = { id: id, lvls: {} };
                                if (elem.elements && (elem.elements.length > 0)) {
                                    for (let j = 0; j < elem.elements.length; j++) {
                                        let elemAbs = elem.elements[j];
                                        if (elemAbs.type === "element") {
                                            switch (elemAbs.name) {
                                                case "w:lvl":
                                                    if (elemAbs.attributes && elemAbs.attributes["w:ilvl"]) {
                                                        let idLvl = elemAbs.attributes["w:ilvl"];
                                                        let lvl = abstrNum.lvls[idLvl] = {};
                                                        if (elemAbs.elements && (elemAbs.elements.length > 0)) {
                                                            for (let k = 0; k < elemAbs.elements.length; k++) {
                                                                let elemLvl = elemAbs.elements[k];
                                                                if (elemLvl.type === "element") {
                                                                    switch (elemLvl.name) {
                                                                        case "w:numFmt":
                                                                            if (elemLvl.attributes && elemLvl.attributes["w:val"]) {
                                                                                lvl.numFmt = elemLvl.attributes["w:val"];
                                                                            }
                                                                            break;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    break;
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                        case "w:num":
                            if (elem.attributes && elem.attributes["w:numId"]) {
                                let numId = elem.attributes["w:numId"];
                                if (elem.elements && (elem.elements.length > 0)) {
                                    for (let j = 0; j < elem.elements.length; j++) {
                                        let elemNum = elem.elements[j];
                                        if (elemNum.type === "element") {
                                            switch (elemNum.name) {
                                                case "w:abstractNumId":
                                                    if (elemNum.attributes && elemNum.attributes["w:val"]) {
                                                        let anum = elemNum.attributes["w:val"];
                                                        let objANum = abstract[anum];
                                                        if (!objANum)
                                                            throw new Error(`_parseNumbering: "w:abstractNumId" = ${anum} doesn't exist for "w:num" = ${numId}.`)
                                                        result[numId] = { id: numId, abstractId: anum, obj: objANum };
                                                    }
                                                    break;
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                        default:
                            if (options && options.errors)
                                options.errors.push(`(0,0) _parseNumbering: Unhandled element "${elem.name}".`);
                    }
                }
            }
        }
        return result;
    }

    _parseText(txt, options) {
        let result = { props: {}, text: "", html: "", reference: null };
        let stopProcessing = false;
        if (txt && txt.elements && (txt.elements.length > 0)) {
            for (let i = 0; (!stopProcessing) && (i < txt.elements.length); i++) {
                let elem = txt.elements[i];
                if (elem.type === "element") {
                    switch (elem.name) {
                        case "w:rPr":
                            result.props = this._parseTextProps(elem, options);
                            break;
                        case "w:fldChar":
                            if (elem.attributes) {
                                switch (elem.attributes["w:fldCharType"]) {
                                    case "begin":
                                        result.props.begin = true;
                                        stopProcessing = true;
                                        break;
                                    case "end":
                                        result.props.end = true;
                                        stopProcessing = true;
                                        break;
                                }
                            }
                            break;
                        case "w:instrText":
                            if (elem.elements && (elem.elements.length === 1) && elem.elements[0].text) {
                                let instr = elem.elements[0].text.match(/\bhyperlink\s+|"[^"]*"/ig);
                                if (instr && (instr.length > 1)) {
                                    result.props.link = instr[1].substr(1, instr[1].length - 2);
                                    stopProcessing = true;
                                }
                            }
                            break;
                        case "w:footnoteReference":
                            if (elem.attributes && elem.attributes["w:id"]) {
                                let refId = elem.attributes["w:id"];
                                let refNote = null;
                                if (options && options.FootNotes && options.FootNotes.fnotes[refId]) {
                                    refNote = options.FootNotes.fnotes[refId];
                                    if (!refNote.isUsed) {
                                        refNote.isUsed = true;
                                        options.FootNotes.used.push(refNote);
                                    }
                                }
                                if (!refNote)
                                    throw new Error(`(${options && options.rowNum ? options.rowNum : 0},` +
                                        `${options && options.cellNum ? options.cellNum : 0}) ` + `_parseText: Undefined footnote fererence "${refId}"`);
                                result.reference = { id: refId };
                                result.text = `[${refId}]`;
                                result.html = `<sup><a href="#_edn${refId}" name="_ednref${refId}">${result.text}</a></sup>`;
                            }
                            break;
                        case "w:t":
                            if (elem.elements && (elem.elements.length === 1) && elem.elements[0].text) {
                                let text = elem.elements[0].text;
                                let html = escape(text);
                                if (result.props.i)
                                    html = "<em>" + html + "</em>";
                                if (result.props.b)
                                    html = "<b>" + html + "</b>";
                                result.text += text;
                                result.html += html;
                            }
                            else { // Interpret an empty "w:t" as single space. Not sure if it's correct !!!
                                result.text += " ";
                                result.html += " ";
                            }
                            break;
                        default:
                            if (options && options.errors)
                                options.errors.push(`(${options.rowNum},${options.cellNum}) _parseText: Unhandled element "${elem.name}".`);
                    }
                }
            }
        }
        return result;
    }

    _parseParagraphProps(props, options) {
        let result = {};
        if (props && props.elements && (props.elements.length > 0)) {
            for (let i = 0; i < props.elements.length; i++) {
                let elem = props.elements[i];
                if (elem.type === "element") {
                    switch (elem.name) {
                        case "w:numPr":
                            result.numList = { numFmt: "bullet" };
                            let ilvl = "";
                            let numId = "";
                            if (elem.elements && (elem.elements.length > 0)) {
                                for (let j = 0; j < elem.elements.length; j++) {
                                    let elemNum = elem.elements[j];
                                    if (elemNum.type === "element") {
                                        switch (elemNum.name) {
                                            case "w:ilvl":
                                                if (elemNum.attributes)
                                                    ilvl = elemNum.attributes["w:val"];
                                                break;
                                            case "w:numId":
                                                if (elemNum.attributes)
                                                    numId = elemNum.attributes["w:val"];
                                                break;
                                        }
                                    }
                                }
                            }
                            if (options && options.Numbering) {
                                let numObj = options.Numbering[numId];
                                if (numObj) {
                                    numObj = numObj.obj.lvls[ilvl];
                                    if (numObj)
                                        result.numList.numFmt = numObj.numFmt;
                                }
                            }
                            break;
                        default:
                            if (options && options.errors)
                                options.errors.push(`(${options.rowNum},${options.cellNum}) _parseParagraphProps: Unhandled element "${elem.name}".`);
                    }
                }
            }
        }
        return result;
    }

    _parseHyperLink(hlink, options) {
        let result = { props: {}, text: "", html: "", link: null };
        if (hlink && hlink.attributes) {
            if (options && options.Refs) {
                let olink = options.Refs["External"];
                if (olink)
                    olink = olink[hlink.attributes["r:id"]];
                if (olink && olink.link.Target)
                    result.link = olink.link.Target;
            }
            else
                if (hlink.attributes["w:dest"])
                    result.link = hlink.attributes["w:dest"];
        }
        if (hlink && hlink.elements && (hlink.elements.length > 0)) {
            for (let i = 0; i < hlink.elements.length; i++) {
                let elem = hlink.elements[i];
                if (elem.type === "element") {
                    switch (elem.name) {
                        case "w:r":
                            let { text, html } = this._parseText(elem, options);
                            result.text += text;
                            result.html += html;
                            break;
                        default:
                            if (options && options.errors)
                                options.errors.push(`(${options.rowNum},${options.cellNum}) _parseHyperLink: Unhandled element "${elem.name}".`);
                    }
                }
            }
            if (result.link) {
                result.text = result.text + " [" + result.link + "]";
                result.html = `<a href="${escape(result.link)}">${result.html}</a>`;
            }
        }
        return result;
    }

    _parseParagraph(prg, options) {
        let result = { props: {}, text: "", html: "" };
        let textField = "";
        let htmlField = "";
        let fieldLink = null;
        let isField = false;
        if (prg && prg.elements && (prg.elements.length > 0)) {
            for (let i = 0; i < prg.elements.length; i++) {
                let elem = prg.elements[i];
                if (elem.type === "element") {
                    switch (elem.name) {
                        case "w:pPr":
                            result.props = this._parseParagraphProps(elem, options);
                            break;
                        case "w:hyperlink":
                            let { text: textLink, html: htmlLink, link } = this._parseHyperLink(elem, options);
                            result.text += textLink;
                            result.html += htmlLink;
                            break;
                        case "w:hlink":
                            let { text: textHlink, html: htmlHlink, link: linkHlink } = this._parseHyperLink(elem);
                            result.text += textHlink;
                            result.html += htmlHlink;
                            break;
                        case "w:r":
                            let { props, text, html } = this._parseText(elem, options);
                            if (props.begin) {
                                textField = "";
                                htmlField = "";
                                fieldLink = null;
                                isField = true;
                            }
                            else
                                if (props.link) {
                                    fieldLink = props.link;
                                }
                                else
                                    if (props.end) {
                                        if (fieldLink) {
                                            result.text += textField + " [" + fieldLink + "]";
                                            result.html += `<a href="${escape(fieldLink)}">${htmlField}</a>`;
                                        }
                                        else {
                                            result.text += textField;
                                            result.html += htmlField;
                                        }
                                        fieldLink = null;
                                        isField = false;
                                    }
                                    else {
                                        if (isField) {
                                            textField += text;
                                            htmlField += html;
                                        }
                                        else {
                                            result.text += text;
                                            result.html += html;
                                        }
                                    }
                            break;
                        default:
                            if (options && options.errors)
                                options.errors.push(`(${options.rowNum},${options.cellNum}) _parseParagraph: Unhandled element "${elem.name}".`);
                    }
                }
            }
            if (result.text[0] === Import.PARAGRAPH_MERGE_SYMBOL) {
                result.props.notParagraph = true;
                result.text = result.text.replace(Import.PARAGRAPH_MERGE_SYMBOL, "");
                result.html = result.html.replace(Import.PARAGRAPH_MERGE_SYMBOL, "");
            }
        }
        return result;
    }

    _parseCell(cell, options) {
        let result = { obj: cell, content: { text: "", paragraphs: [] } };
        if (cell && cell.elements && (cell.elements.length > 0)) {
            for (let i = 0; i < cell.elements.length; i++) {
                let elem = cell.elements[i];
                if (elem.type === "element") {
                    switch (elem.name) {
                        case "w:p":
                            let paragraph = this._parseParagraph(elem, options);
                            result.content.text += "\r\n" + paragraph.text;
                            result.content.paragraphs.push(paragraph);
                            break;
                        default:
                            if (options && options.errors)
                                options.errors.push(`(${options.rowNum},${options.cellNum}) _parseCell: Unhandled element "${elem.name}".`);
                    }
                }
            }
        }
        return result;
    }

    _parseTable(table, options) {
        let result = { obj: table, rows: [] };
        if (table) {
            let rows = [];
            this._findAll("w:tr", table, rows);
            if (options)
                options.rowNum = 1;
            rows.forEach((rowObj) => {
                let row = { obj: rowObj, cells: [] };
                let cells = [];
                this._findAll("w:tc", rowObj, cells);
                if (options)
                    options.cellNum = 1;
                cells.forEach((cell) => {
                    row.cells.push(this._parseCell(cell, options));
                    if (options)
                        options.cellNum++;
                });
                result.rows.push(row);
                if (options)
                    options.rowNum++;
            });
        };
        return result;
    }

    _parseFootNotes(notes, options) {
        let result = { obj: notes, fnotes: {}, used: [] };
        if (notes) {
            let fnotes = [];
            this._findAll("w:footnote", notes, fnotes);
            fnotes.forEach((obj) => {
                if (obj.attributes && obj.attributes["w:id"]) {
                    let fnote = { obj: obj, id: obj.attributes["w:id"], isUsed: false, content: { text: "", paragraphs: [] } };
                    if (obj && obj.elements && (obj.elements.length > 0)) {
                        for (let i = 0; i < obj.elements.length; i++) {
                            let elem = obj.elements[i];
                            if (elem.type === "element") {
                                switch (elem.name) {
                                    case "w:p":
                                        if (options) {
                                            options.cellNum = 0;
                                            options.rowNum = 0;
                                        }
                                        let paragraph = this._parseParagraph(elem, options);
                                        fnote.content.text += "\r\n" + (i ? paragraph.text : (`[${fnote.id}] ` + paragraph.text));
                                        fnote.content.paragraphs.push(paragraph);
                                        break;
                                    default:
                                        if (options && options.errors)
                                            options.errors.push(`_parseFootNotes [${fnote.id}]: Unhandled element "${elem.name}".`);
                                }
                            }
                        }
                        let text = `[${fnote.id}]`;
                        let html = `<sup><a href="#_ednref${fnote.id}" name="_edn${fnote.id}">${text}</a></sup>`;
                        if (fnote.content.paragraphs.length > 0)
                            fnote.content.paragraphs[0].html = html + fnote.content.paragraphs[0].html;
                    }
                    result.fnotes[fnote.id] = fnote;;
                }
            });
        };
        return result;
    }

    _parseRefsBlock(refs, refsList, options) {
        if (refs) {
            let refsArr = [];
            this._findAll("Relationship", refs, refsArr);
            refsArr.forEach((obj) => {
                if (obj.attributes && obj.attributes["Id"] && obj.attributes["TargetMode"]) {
                    let ref = { obj: obj, link: obj.attributes };
                    let mode = refsList[obj.attributes["TargetMode"]];
                    if (!mode) {
                        mode = {};
                        refsList[obj.attributes["TargetMode"]] = mode;
                    }
                    mode[obj.attributes["Id"]] = ref;
                }
            });
        };
    }

    _parseRefs(doc, options) {
        let result = {};
        if (doc) {
            let refBlocks = [];
            this._findAll("Relationships", doc, refBlocks, true);
            refBlocks.forEach((obj) => {
                this._parseRefsBlock(obj, result, options);
            });
        };
        return result;
    }

    _findAll(tag, root, nodes, isDeep, tp) {
        let type = tp ? tp : "element";
        if (root && root.elements && (root.elements.length > 0)) {
            for (let i = 0; i < root.elements.length; i++) {
                let elem = root.elements[i];
                if ((elem.type === type) && (elem.name == tag))
                    nodes.push(elem);
                if (isDeep)
                    this._findAll(tag, elem, nodes, isDeep, tp);
            }
        }
    }

    _findFirst(tag, root, tp) {
        let node = null;
        let type = tp ? tp : "element";
        if (root && root.elements && (root.elements.length > 0)) {
            for (let i = 0; (node === null) && (i < root.elements.length); i++) {
                let elem = root.elements[i];
                if ((elem.type === type) && (elem.name == tag)) {
                    node = elem;
                    break;
                }
                node = this._findFirst(tag, elem, tp);
            }
        }
        return node;
    }
};