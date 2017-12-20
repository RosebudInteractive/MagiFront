import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as authorsActions from "../actions/AuthorActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {EDIT_MODE_INSERT } from '../constants/Common';

class AuthorForm extends React.Component {
    constructor(props) {
        super(props);

        this._initialValue = Object.assign({}, this._getCurrentAuthor());
        this._currentValue = Object.assign({}, this._initialValue);
    }

    _getCurrentAuthor() {
        if (this.props.editMode === EDIT_MODE_INSERT) {
            return null
        } else {
            return this.props.authors.find((elem) => {
                return elem.id === this.props.selected
            })
        }
    }

    saveAuthor(values) {
        this.props.authorsActions.saveAuthor(values, this.props.editMode);
        this._initialValue = Object.assign({}, this._currentValue);
    }

    _cancel() {
        this.props.authorsActions.hideEditDialog();
        this._currentValue = Object.assign({}, this._initialValue);
    }

    render() {
        const {
            // selected,
            message,
            errorDlgShown,
        } = this.props;
        return (
            <div className="episodes-content">
                <Webix ui={::this.getUI()} data={::this._getCurrentAuthor()}/>
                {
                    errorDlgShown ?
                        <ErrorDialog
                            message={message}
                            data={this._currentValue}
                        />
                        :
                        ""
                }
            </div>
        )
    }

    _changeData(obj) {
        this._currentValue.FirstName = obj.FirstName;
        this._currentValue.LastName = obj.LastName;
        this._currentValue.Description = obj.Description;

        this.render();
    }

    _hasChanges() {
        return (this._currentValue.FirstName !== this._initialValue.FirstName) ||
            (this._currentValue.LastName !== this._initialValue.LastName) ||
            (this._currentValue.Description !== this._initialValue.Description)
    }

    getUI() {
        let that = this;

        return {
            view: "form",
            width: 400,
            elements: [
                {view: "text", name: "FirstName", label: "Имя", placeholder: "Введите имя"},
                {view: "text", name: "LastName", label: "Фамилия", placeholder: "Введите фамилию"},
                {view: "textarea", name: "Description", label: "Описание", placeholder: "Описание", height: 150,},
                {
                    cols: [
                        {},
                        {
                            view: "button", value: "ОК", name: 'btnOk',
                            click: function () {
                                if (this.getFormView().validate()) {
                                    that.saveAuthor(this.getFormView().getValues());
                                }
                            }
                        },
                        {
                            view: "button", value: "Отмена", name: 'btnCancel',
                            click: function () {
                                that._cancel();
                            }
                        }
                    ]
                }
            ],
            rules: {
                FirstName: window.webix.rules.isNotEmpty,
                LastName: window.webix.rules.isNotEmpty,
            },
            on: {
                onChange: function () {
                    this.validate();
                    that._changeData(::this.getValues());
                },
                onValues: function () {
                    // if (that._hasChanges()) {
                        this.elements.btnOk.enable();
                        this.elements.btnCancel.enable()
                    // } else {
                    //     this.elements.btnOk.disable();
                    //     this.elements.btnCancel.disable()
                    // }

                    if (that._needRevalidate) {
                        this.validate();
                        that._needRevalidate = false;
                    }
                },
            }
        }
    }
}

function mapStateToProps(state, ownProps) {
    return {
        authors: state.authors.authors,
        editMode: state.authors.editMode,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        selected: Number(ownProps.match.params.id),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        authorsActions: bindActionCreators(authorsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorForm);