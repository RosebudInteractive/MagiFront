import React from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';
import * as languagesActions from "../actions/languages-actions";
import ErrorDialog from './ErrorDialog';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as appActions from "../actions/app-actions";

class ResourceForm extends React.Component {

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
            message
        } = this.props;

        return (
            <div>
                {
                    fetching ?
                        <p>Загрузка...</p>
                        :
                        <div className="dlg">
                            <div className="dlg-bg">
                            </div>
                            <div className="dlg-window">
                                <Webix ui={::this.getUI(::this._save, cancel)} data={data}/>
                            </div>
                        </div>
                }
                {
                    errorDlgShown ?
                        <ErrorDialog
                            message={message}
                        />
                        :
                        ""
                }
            </div>
        )
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

    _handleFiles() {
        let fileList = this.files; /* теперь вы можете работь со списком файлов */
        fileList.forEach((file) => {
            console.log(file)
        })
    }

    getUI(save, cancel) {
        let that = this;

        return {
            view: "form",
            width: 400,
            elements: [

                {
                    view: "text",
                    labelPosition: "top",
                    name: "Name",
                    label: "Название",
                    placeholder: "Введите название",
                    validate: window.webix.rules.isNotEmpty,
                    invalidMessage: "Значение не может быть пустым",
                },
                {
                    view: "textarea",
                    labelPosition: "top",
                    height: 150,
                    name: "Description",
                    label: "Описание",
                    placeholder: "Введите описание"
                },
                {
                    cols: [
                        {
                            view: "text",
                            labelPosition: "top",
                            id:'file-name',
                            name: "FileName",
                            label: "Имя файла",
                            placeholder: "Введите URL",
                            validate: window.webix.rules.isNotEmpty,
                            invalidMessage: "Значение не может быть пустым",
                            width: 329,
                        },
                        {
                            rows: [
                                {
                                },
                                {
                                    view: "uploader",
                                    id: "file-uploader",
                                    apiOnly: true,
                                    upload: "/upload",
                                    multiple: false,
                                    datatype: "json",
                                    accept: "image/*",
                                    // accept: "image/*, video/*",
                                    type: "iconButton",
                                    icon: 'upload',
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
                                            window.$$('file-name').setValue(response[0].file);

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
                                        onFileUpload: () => {
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
                                    type:"iconButton",
                                    icon: 'refresh',
                                    // value: "R",
                                    // background
                                    height: 38,
                                    click: function () {
                                        this._refreshLanguages()
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
            on:{
                onValues: function () {
                    window.$$('file-uploader').files.attachEvent("onBeforeDelete", function(id){
                        // todo : ОТПРАВКА СООБЩЕНИЯ СЕРВЕРУ ОБ УДАЛЕНИИ ФАЙЛА
                        let _item = window.$$('uploader_1').files.getItem(id);
                        window.webix.message('Удален ' + _item[0].file);
                        //return false to block operation
                        return true;
                    });
                }
            }
        }
    }
}

ResourceForm.propTypes = {
    data: PropTypes.object.isRequired,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
};

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

