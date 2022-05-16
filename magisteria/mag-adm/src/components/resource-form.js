import React from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';
import * as languagesActions from "../actions/languages-actions";
import ErrorDialog from './dialog/error-dialog';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as appActions from "../actions/app-actions";

class ResourceForm extends React.Component {

    static propTypes = {
        data: PropTypes.object.isRequired,
        save: PropTypes.func.isRequired,
        cancel: PropTypes.func.isRequired,
        onPrevClick: PropTypes.func,
        onNextClick: PropTypes.func,
        scrollable: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        if (!this.props.isLanguagesLoaded)
            this.props.languagesActions.getLanguages();
    }

    _save(value) {
        value.ResLanguageId ?
            value.Language = this._getLanguageName(value.ResLanguageId) :
            value.Language = '';
        value.Id = this.props.data.Id;
        this.props.save(value)
    }

    render() {
        const {
            data,
            cancel,
            fetching,
            errorDlgShown,
            message,
            scrollable
        } = this.props;

        return <React.Fragment>
            {
                fetching ?
                    <p>Загрузка...</p>
                    :
                    <div className="dlg">
                        <div className="dlg-bg"/>
                        <div className={"dlg-window" + (scrollable ? " scrollable" : "")}>
                            <div className={"scroll-button button-prev" + (!this.props.onPrevClick ? " disabled" : "")} onClick={::this._onPrevClick}/>
                            <Webix ui={::this.getUI(::this._save, cancel)} data={data}/>
                            <div className={"scroll-button button-next" + (!this.props.onNextClick ? " disabled" : "")} onClick={::this._onNextClick}/>
                        </div>
                    </div>
            }
            {
                errorDlgShown ?
                    <ErrorDialog
                        message={message}
                    />
                    :
                    null
            }
        </React.Fragment>
    }

    _onPrevClick() {
        if (this.props.onPrevClick) {
            if (this._doBeforeScroll()) {
                this.props.onPrevClick()
            }
        }
    }

    _onNextClick() {
        if (this.props.onNextClick) {
            if (this._doBeforeScroll()) {
                this.props.onNextClick()
            }
        }
    }

    _doBeforeScroll() {
        const _form = window.$$("resource-form")

        if (_form) {
            if (_form.validate()) {
                let _obj = _form.getValues();
                let _id = window.$$('file-uploader').files.data.order[0];
                let _file = window.$$('file-uploader').files.getItem(_id);
                if (_file) {
                    _obj.FileName = _file[0].file;
                    _obj.MetaData = JSON.stringify(_file[0].info);
                }

                this._save(_obj);

                return true
            } else {
                return false
            }
        } else {
            return true
        }
    }

    _refreshLanguages() {
        this.props.languagesActions.getLanguages();
    }

    _getLanguagesArray() {
        let _array = [];
        _array.push({id: null, value: 'Не указан'});

        let _languages = this.props.languages.map((elem) => {
            return {id: elem.id, value: elem.Language};
        });

        return _array.concat(_languages);
    }

    _getLanguageName(id) {
        let _lang = this.props.languages.find((elem) => {
            return elem.id === id
        });

        return _lang ? _lang.Language : '';
    }

    getUI(save, cancel) {
        let that = this;

        return {
            view: "form",
            id: "resource-form",
            width: 400,
            elements: [

                {
                    view: "text",
                    labelPosition: "top",
                    name: "Name",
                    id: 'Name',
                    label: "Название",
                    placeholder: "Введите название",
                },
                {
                    view: "textarea",
                    labelPosition: "top",
                    height: 150,
                    name: "Description",
                    id: "Description",
                    label: "Описание",
                    placeholder: "Введите описание"
                },
                {
                    view: "text",
                    labelPosition: "top",
                    name: "FileId",
                    id: 'file-id',
                    label: "ID файла",
                    placeholder: "",
                },
                {
                    view: "text",
                    label: "Alt",
                    labelPosition: "top",
                    name: 'AltAttribute',
                    placeholder: "",
                },
                {
                    view: "checkbox",
                    label: "Отображать в галереe",
                    name: 'ShowInGalery',
                    labelWidth: 347,
                },
                {
                    cols: [
                        {
                            view: "text",
                            labelPosition: "top",
                            id: 'file-name',
                            name: "FileName",
                            label: "Имя файла",
                            placeholder: "Введите URL",
                            validate: window.webix.rules.isNotEmpty,
                            invalidMessage: "Значение не может быть пустым",
                            width: 329,
                        },
                        {
                            rows: [
                                {},
                                {
                                    view: "uploader",
                                    id: "file-uploader",
                                    apiOnly: true,
                                    upload: "/api/adm/upload",
                                    multiple: false,
                                    datatype: "json",
                                    accept: "image/*",
                                    type: "icon",
                                    icon: 'fa-upload',
                                    height: 38,
                                    on: {
                                        onBeforeFileAdd: (item) => {
                                            let _type = item.file.type.toLowerCase();
                                            if (!_type) {
                                                window.webix.message("Поддерживаются только изображения");
                                                return false;
                                            }

                                            let _metaType = _type.split('/')[0];
                                            if (_metaType !== "image") { // && _metaType !== 'video') {
                                                window.webix.message("Поддерживаются только изображения");
                                                return false;
                                            }

                                            window.$$('res-form-btnOk').disable();
                                            window.$$('res-form-btnCancel').disable();
                                        },
                                        onUploadComplete: (response) => {
                                            let _type = response[0].info['mime-type'].toLowerCase();
                                            if (_type) {
                                                let _metaType = _type.split('/')[0];
                                                if (_metaType === "image") {
                                                    window.$$('ResType').setValue('P');
                                                }
                                                if (_metaType === 'video') {
                                                    window.$$('ResType').setValue('V');
                                                }
                                            }
                                        },
                                        onFileUpload: (file, response) => {
                                            let _name = response[0].info.name ? response[0].info.name : null,
                                                _description = response[0].info.description ? response[0].info.description : null,
                                                _fileId = response[0].info.fileId ? response[0].info.fileId : null

                                            window.$$('file-name').setValue(response[0].file);
                                            window.$$('Name').setValue(_name);
                                            window.$$('Description').setValue(_description);
                                            window.$$('file-id').setValue(_fileId);
                                            window.$$('res-form-btnOk').enable();
                                            window.$$('res-form-btnCancel').enable();
                                        },
                                        onFileUploadError: () => {
                                            window.$$('res-form-btnOk').enable();
                                            window.$$('res-form-btnCancel').enable();
                                            that.props.appActions.showErrorDialog('При загрузке файла произошла ошибка')
                                        }
                                    }
                                },
                            ]
                        },

                    ]
                },
                {
                    cols: [
                        {
                            view: "combo",
                            name: "ResLanguageId",
                            label: "Язык",
                            placeholder: "Выберите язык",
                            labelPosition: "top",
                            options: this._getLanguagesArray(),
                            width: 329,

                        },
                        {
                            rows: [
                                {},
                                {
                                    view: "button",
                                    type:"icon",
                                    icon:"fa-refresh",
                                    height: 38,
                                    click: function () {
                                        that._refreshLanguages()
                                    }
                                }
                            ]

                        }
                    ]
                },
                {
                    view: "combo",
                    labelPosition: "top",
                    name: "ResType",
                    id: 'ResType',
                    label: "Тип ресурса",
                    placeholder: "Введите категорию",
                    options: [{id: 'P', value: 'Изображение'}, {id: 'V', value: 'Видео'},],
                    validate: window.webix.rules.isNotEmpty,
                    invalidMessage: "Значение не может быть пустым",
                    disabled: true,
                },
                {
                    cols: [
                        {},
                        {
                            view: "button", value: "ОК", id: 'res-form-btnOk',
                            click: function () {
                                if (save)
                                    if (this.getFormView().validate()) {
                                        let _obj = this.getFormView().getValues();
                                        let _id = window.$$('file-uploader').files.data.order[0];
                                        let _file = window.$$('file-uploader').files.getItem(_id);
                                        if (_file) {
                                            _obj.FileName = _file[0].file;
                                            _obj.MetaData = JSON.stringify(_file[0].info);
                                        }

                                        save(_obj);
                                    }
                            }
                        },
                        {
                            view: "button", value: "Отмена", id: 'res-form-btnCancel',
                            click: function () {
                                if (cancel)
                                    cancel();
                            }
                        }
                    ]
                }
            ],
            on: {
                onValues: function () {
                    window.$$('file-uploader').files.attachEvent("onBeforeDelete", function (id) {
                        // todo : ОТПРАВКА СООБЩЕНИЯ СЕРВЕРУ ОБ УДАЛЕНИИ ФАЙЛА
                        let _item = window.$$('uploader_1').files.getItem(id);
                        window.webix.message('Удален ' + _item[0].file);
                        //return false to block operation
                        return true;
                    });
                },
                onChange: function () {
                    this.clearValidation();
                }
            }
        }
    }
}

function mapStateToProps(state) {
    return {
        languages: state.languages.languages,
        isLanguagesLoaded: state.languages.loaded,

        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        fetching: state.languages.fetching
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        languagesActions: bindActionCreators(languagesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceForm);

