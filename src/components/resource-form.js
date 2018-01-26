import React from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';
import * as languagesActions from "../actions/languages-actions";
import ErrorDialog from './ErrorDialog';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

class ResourceForm extends React.Component {

    constructor(props) {
        super(props);
        if (!this.props.isLanguagesLoaded)
            this.props.languagesActions.getLanguages();
    }

    _save(value) {
        value.LanguageId ?
            value.Language = this._getLanguageName(value.LanguageId) :
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

    getUI(save, cancel) {
        return {
            view: "form", width: 400, elements: [
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
                    view: "text",
                    labelPosition: "top",
                    name: "FileName",
                    label: "Имя файла",
                    placeholder: "Введите URL",
                    validate: window.webix.rules.isNotEmpty,
                    invalidMessage: "Значение не может быть пустым",
                },
                {
                    cols: [
                        {
                            view: "combo",
                            name: "LanguageId",
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
                    label: "Тип ресурса",
                    placeholder: "Введите категорию",
                    options: [{id: 'P', value: 'Изображение'}, {id: 'V', value: 'Видео'},],
                    validate: window.webix.rules.isNotEmpty,
                    invalidMessage: "Значение не может быть пустым",
                    // on: {
                    //     onChange: function () {
                    //         that._externalValidate(this);
                    //     },
                    // },
                },
                {
                    cols: [
                        {},
                        {
                            view: "button", value: "ОК", click: function () {
                            if (save)
                                if (this.getFormView().validate()) {
                                    save(this.getFormView().getValues());
                                }
                        }
                        },
                        {
                            view: "button", value: "Отмена", click: function () {
                            if (cancel)
                                cancel();
                        }
                        }
                    ]
                }
            ]
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
        languagesActions: bindActionCreators(languagesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceForm);

