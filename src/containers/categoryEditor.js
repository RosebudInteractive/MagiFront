import React  from 'react'
import Webix from '../components/Webix';

import * as categoryActions from "../actions/categoryActions";
import * as categoriesActions from "../actions/categoriesListActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ObjectEditor, {labelWidth, } from './object-editor';
import {EDIT_MODE_INSERT} from "../constants/Common";

class CategoryForm extends ObjectEditor {

    getObject() {
        return this.props.category
    }

    getRootRout() {
        return '/adm/categories'
    }

    get objectIdPropName() {
        return 'categoryId'
    }

    get objectName() {
        return 'category'
    }

    get objectActions() {
        return this.props.categoryActions;
    }

    _save(value) {
        let _obj = {
            id: value.id,
            Id: value.id,
            Name: value.Name,
            ParentId: value.ParentId ? value.ParentId  : null,
            ParentName: value.ParentName,
            URL: value.URL
        };

        super._save(_obj)
    }

    componentWillReceiveProps(next) {
        const {
            category,
        } = next;

        if (this.editMode === EDIT_MODE_INSERT) {
            if (!category) {
                this.objectActions.create();
            }
        }
    }

    _initEditMode(){
        super._initEditMode();
        this._refreshCategoriesList();
    }

    _initInsertMode() {
        super._initInsertMode();
        this._refreshCategoriesList();
    }

    _refreshCategoriesList(){
        let {
            categories,
            categoriesListActions
        } = this.props;

        if (categories.length === 0) {
            categoriesListActions.getCategories()
        }
    }

    _getWebixForm(){
        let _data = this.getObject();
        return <Webix ui={::this.getUI()} data={_data}/>
    }

    _getExtElements() {
        let that = this;
        let _options = this._getCategoriesArray();

        return [
            {
                view: "text",
                name: "Name",
                label: "Наименование",
                placeholder: "Введите наименование",
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
                view: "combo",
                name: "ParentId",
                label: "Родительская категория",
                placeholder: "Введите категорию",
                options : _options,
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
        ];
    }

    _getCategoriesArray(){
        const {
            categories,
            categoryId
        } = this.props;

        let _filtered = categories.filter((value) => {
            return value.id !== categoryId;
        });

        return _filtered.map((elem) => {
            return {id: elem.id, value: elem.Name};
        })
    }
}

function mapStateToProps(state, ownProps) {
    return {
        categories: state.categoriesList.categories,
        category: state.category.current,
        hasChanges : state.category.hasChanges,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        categoryId: Number(ownProps.match.params.id),
        fetching: state.category.fetching || state.categoriesList.fetching,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        categoryActions: bindActionCreators(categoryActions, dispatch),
        categoriesListActions: bindActionCreators(categoriesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryForm);