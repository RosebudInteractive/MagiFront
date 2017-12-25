import React  from 'react'
import Webix from '../components/Webix';
// import ErrorDialog from '../components/ErrorDialog';

import * as authorActions from "../actions/authorActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import {
//     EDIT_MODE_INSERT,
//     EDIT_MODE_EDIT
// } from '../constants/Common';

import ObjectEditor, {labelWidth, } from './objectEditor';

class AuthorEditor extends ObjectEditor {

    getObject() {
        return this.props.author
    }

    getRootRout() {
        return '/authors'
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

    _initEditMode(){
        super._initEditMode();
        const {
            authorActions,
            authorId,
        } = this.props;

        authorActions.get(authorId);
    }

    _initInsertMode() {
        super._initInsertMode();
        this.props.authorActions.create();
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
                view: "textarea",
                name: "Description",
                label: "Описание",
                placeholder: "Описание",
                height: 150,
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorEditor);