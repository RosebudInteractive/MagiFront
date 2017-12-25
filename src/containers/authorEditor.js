import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as authorActions from "../actions/authorActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT
} from '../constants/Common';

const requiredField = {
    FirstName: 'FirstName',
    LastName: 'LastName'
};

class AuthorEditor extends React.Component {
    constructor(props) {
        super(props);
        const {
            authorActions,
            authorId,
        } = this.props;


        if (authorId > 0) {
            this.editMode = EDIT_MODE_EDIT;
            authorActions.get(authorId);
        } else {
            this.editMode = EDIT_MODE_INSERT;
            authorActions.create();
        }

        this._validateResult = {};
        this._dataLoaded = false;
    }

    componentWillUnmount() {
        this.props.authorActions.clear()
    }

    _goBack(){
        this.props.history.push('/authors');
    }

    _save(values) {
        this.props.authorActions.save(values, this.props.editMode);
    }

    _cancel() {
        this._dataLoaded = false;
        this.props.authorActions.cancelChanges();
    }

    render() {
        const {
            author,
            message,
            errorDlgShown,
        } = this.props;
        return (
            <div className="episodes-content">
                <Webix ui={::this.getUI()} data={author}/>
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

    _notifyDataLoaded() {
        this._dataLoaded = true;
    }

    _changeData(obj) {
        this.props.authorActions.changeData(obj);
    }

    _hasChanges() {
        return this.props.hasChanges;
    }

    _enableApplyChanges() {
        let _array = Object.values(this._validateResult);
        return _array.every((value) => {
            return value === true
        })
    }

    _externalValidate(field) {
        if (this._dataLoaded) {
            let _isValid = field.validate();
            this._validateResult[field.data.name] = _isValid;
        }
    }

    getUI() {
        let that = this;

        return {
            view: "form",
            width: 700,
            elements: [
                {
                    view: "button", name: 'btnOk', value: '<<< Назад',
                    click: () => {
                        this._goBack();
                    }
                },
                {
                    view: "text", name: requiredField.FirstName, label: "Имя",
                    placeholder: "Введите имя",
                    labelWidth: 120,
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
                    labelWidth: 120,
                    validate: window.webix.rules.isNotEmpty,
                    invalidMessage: "Значение не может быть пустым",
                    on: {
                        onChange: function () {
                            that._externalValidate(this);
                        },
                    },
                },
                {view: "textarea", name: "Description", label: "Описание", placeholder: "Описание", height: 150, labelWidth: 120,},
                {
                    cols: [
                        {},
                        {},
                        {
                            view: "button", value: "ОК", name: 'btnOk',
                            click: function () {
                                if (this.getFormView().validate()) {
                                    that._save(this.getFormView().getValues());
                                }
                            }
                        },
                        {
                            view: "button", value: "Отмена", name: 'btnCancel',
                            click: function () {
                                this.getFormView().clearValidation();
                                that._cancel();
                            }
                        }
                    ]
                }
            ],
            on: {
                onChange: function () {
                    that._changeData(::this.getValues());
                },
                onValues: function () {
                    that._notifyDataLoaded();

                    that._hasChanges() ?
                        this.elements.btnCancel.enable() : this.elements.btnCancel.disable();

                    (that._hasChanges() && that._enableApplyChanges()) ?
                        this.elements.btnOk.enable() : this.elements.btnOk.disable();
                },
            }
        }
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorEditor);