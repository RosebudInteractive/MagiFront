import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as authorsActions from "../actions/AuthorActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {EDIT_MODE_INSERT } from '../constants/Common';

class AuthorForm extends React.Component {

    getCurrentAuthor() {
        if (this.props.editMode === EDIT_MODE_INSERT) {
            return null
        } else {
            return this.props.authors.find((elem) => {
                return elem.id === this.props.selected
            })
        }
    }

    saveAuthor(values) {
        this.props.authorsActions.saveAuthor(values, this.props.editMode)
    }

    cancelEdit() {
        this.props.authorsActions.hideEditDialog();
    }

    render() {
        const {
            selected,
            message,
            errorDlgShown,
        } = this.props;
        return (
            <div className="episodes-content">
                <Webix ui={::this.getUI(::this.saveAuthor, this.cancelEdit)} data={::this.getCurrentAuthor()}/>
                {
                    errorDlgShown ?
                        <ErrorDialog
                            message={message}
                            data={selected}
                        />
                        :
                        ""
                }
            </div>
        )
    }

    getUI(save, cancel) {
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
                            view: "button", value: "ОК",
                            click: function () {
                                let _validated = this.getFormView().validate();
                                if ((save) && _validated) {
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
            ],
            rules: {
                FirstName: window.webix.rules.isNotEmpty,
                LastName: window.webix.rules.isNotEmpty,
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