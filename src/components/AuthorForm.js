import React  from 'react'
// import PropTypes from 'prop-types'
import Webix from '../components/Webix';

import * as authorsActions from "../actions/AuthorActions";
// import * as commonDlgActions from '../actions/CommonDlgActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {EDIT_MODE_INSERT } from '../constants/Common'

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
        return (
            <div className="episodes-content">
                <Webix ui={::this.getUI(::this.saveAuthor, this.cancelEdit)} data={::this.getCurrentAuthor()}/>
            </div>
        )
    }

    getUI(save, cancel) {
        return {
            view: "form", width: 400, elements: [
                {view: "text", name: "FirstName", label: "Имя", placeholder: "Введите имя"},
                {view: "text", name: "LastName", label: "Фамилия", placeholder: "Введите фамилию"},
                {view: "textarea", name: "Description", label: "Описание", placeholder: "Описание", height: 150,},
                {
                    cols: [
                        {},
                        {
                            view: "button", value: "ОК", click: function(){
                            if (save)
                                save(this.getFormView().getValues());
                        }
                        },
                        {
                            view: "button", value: "Отмена", click: function(){
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

function mapStateToProps(state) {
    return {
        authors: state.authors.authors,
        selected: state.authors.selected,
        editMode: state.authors.editMode,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        authorsActions: bindActionCreators(authorsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorForm);