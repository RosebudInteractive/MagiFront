import React  from 'react'
import Webix from '../components/Webix';

import * as authorActions from "../actions/authorActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {EDIT_MODE_INSERT} from "../constants/Common";

import ObjectEditor, {labelWidth, } from './object-editor';
import {disableButtons, enableButtons,} from "adm-ducks/app";

class AuthorEditor extends ObjectEditor {

    getObject() {
        return this.props.author
    }

    getRootRout() {
        return '/adm/authors'
    }

    get objectIdPropName() {
        return 'authorId'
    }

    get objectName() {
        return 'author'
    }

    get objectActions() {
        return this.props.authorActions;
    }

    get portraitMeta() {
        return this._portraitMeta;
    }

    set portraitMeta(value) {
        if ((!!value) && (typeof (value) === 'string')) {
            this._portraitMeta = JSON.parse(value)
        } else {
            this._portraitMeta = value
        }
    }

    _getPortraitInfo() {
        let _meta = this.portraitMeta;
        return {
            path: _meta ? ('/data/' + (_meta.content.s ? (_meta.path +  _meta.content.s) : this.portrait)) : null,
            heightRatio: _meta ? (_meta.size.height / _meta.size.width ) : 0
        };
    }

    _save(value) {
        value.PortraitMeta = JSON.stringify(this.portraitMeta)

        super._save(value);
    }

    UNSAFE_componentWillReceiveProps(next) {
        const {
            author,
        } = next;

        if (this.editMode === EDIT_MODE_INSERT) {
            if (!author) {
                this.objectActions.create();
            }
        }

        this.portrait = author ? author.Portrait : null;
        this.portraitMeta = author ? author.PortraitMeta : null;
    }

    _getWebixForm(){
        let _data = this.getObject();
        return <Webix ui={::this.getUI()} data={_data}/>
    }

    _getExtElements() {
        let that = this;

        return [
            {
                view: "text", name: 'FirstName', label: "Имя",
                placeholder: "Введите имя",
                labelWidth: labelWidth,
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "text", name: "LastName", label: "Фамилия",
                placeholder: "Введите фамилию",
                labelWidth: labelWidth,
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "text", name: "Occupation", label: "Профессия",
                placeholder: "Укажите професию",
                labelWidth: labelWidth,
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "text", name: "Employment", label: "Место работы",
                placeholder: "Укажите место работы",
                labelWidth: labelWidth,
            },
            {
                view: 'text',
                name: 'URL',
                label: 'URL',
                placeholder: "Введите URL",
                labelWidth: labelWidth,
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                cols: [
                    {
                        rows: [
                            {
                                view: "label",
                                label: "Портрет автора",
                                width: labelWidth,
                                height: 38,
                            }
                        ]

                    },
                    {
                        rows: [
                            {
                                view: 'text',
                                name: 'Portrait',
                                id: 'portrait-file',
                                readonly: true,
                                width: 360,
                                on: {
                                    onChange: function () {
                                        that._externalValidate(this);
                                        let _coverTemplate = window.$$('cover_template');
                                        if (!this.getValue()) {
                                            this.show();
                                            _coverTemplate.hide()
                                        } else {
                                            this.hide();
                                            _coverTemplate.show()
                                        }
                                    },
                                },
                            },
                            {
                                view: 'text',
                                name: 'PortraitMeta',
                                id: 'portrait-meta',
                                hidden: true,
                            },
                            {
                                view: 'template',
                                datatype: 'image',
                                id: 'cover_template',
                                template: (obj) => {
                                    return '<img class="cover" src="' + obj.src + '" />'
                                },
                                width: 360,
                                borderless: true,
                                on: {
                                    onBeforeRender: (object) => {
                                        let _coverInfo = that._getPortraitInfo();
                                        object.src = _coverInfo.path;
                                        let _width = window.$$('cover_template').config.width;
                                        window.$$('cover_template').config.height = _width * _coverInfo.heightRatio;
                                        window.$$('cover_template').resize()
                                    },
                                    validate: function (value) {
                                        return that._checkEpisodesState(value)
                                    },
                                }

                            },
                            {}
                        ]


                    },
                    {
                        width: 10,
                    },
                    {
                        view: "uploader",
                        id: "file-uploader",
                        type: "iconButton",
                        icon: 'upload',
                        upload: " /api/adm/upload",
                        multiple: false,
                        datatype: "json",
                        accept: "image/*",
                        validate: window.webix.rules.isNotEmpty,
                        invalidMessage: "Значение не может быть пустым",
                        inputHeight: 38,
                        width: 38,
                        on: {
                            onBeforeFileAdd: (item) => {
                                let _type = item.file.type.toLowerCase();
                                if (!_type) {
                                    window.webix.message("Поддерживаются только изображения");
                                    return false;
                                }

                                let _metaType = _type.split('/')[0];
                                if (_metaType !== "image") {
                                    window.webix.message("Поддерживаются только изображения");
                                    return false;
                                }

                                that.props.disableButtons()
                            },
                            onUploadComplete: (response) => {
                                let _portraitMeta = JSON.stringify(response[0].info);
                                window.$$('portrait-file').setValue(response[0].file);
                                window.$$('portrait-meta').setValue(_portraitMeta);
                                window.$$('cover_template').refresh();
                                that.props.enableButtons()
                            },
                            onFileUploadError: () => {
                                that.props.appActions.showErrorDialog('При загрузке файла произошла ошибка')
                                that.props.enableButtons()
                            },
                        }
                    },
                ]
            },
            {
                view: "textarea",
                name: "ShortDescription",
                label: "Краткое описание",
                placeholder: "Краткое описание",
                height: 100,
                labelWidth: labelWidth,
            },
            {
                view: "textarea",
                name: "Description",
                label: "Описание",
                placeholder: "Описание",
                height: 200,
                labelWidth: labelWidth,
            }
        ];
    }
}

function mapStateToProps(state, ownProps) {
    return {
        author: state.author.current,
        hasChanges : state.author.hasChanges,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        authorId: parseInt(ownProps.match.params.id),
        fetching: state.author.fetching,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        authorActions: bindActionCreators(authorActions, dispatch),
        disableButtons: bindActionCreators(disableButtons, dispatch),
        enableButtons: bindActionCreators(enableButtons, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorEditor);