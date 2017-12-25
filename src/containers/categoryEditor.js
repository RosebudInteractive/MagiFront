import React  from 'react'
import Webix from '../components/Webix';

import * as categoryActions from "../actions/categoryActions";
import * as categoriesActions from "../actions/categoriesListActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ObjectEditor, {labelWidth, } from './objectEditor';

class CategoryForm extends ObjectEditor {

    getObject() {
        return this.props.category
    }

    getRootRout() {
        return '/categories'
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

    _initEditMode(){
        super._initEditMode();
        let {
            categoryId,
            categories,
            categoryActions,
            categoriesListActions
        } = this.props;

        categoryActions.get(categoryId);
        if (categories.length === 0) {
            categoriesListActions.getCategories()
        }
    }

    _initInsertMode() {
        super._initInsertMode();
        let {
            categories,
            categoryActions,
            categoriesListActions
        } = this.props;

        if (categories.length === 0) {
            categoriesListActions.getCategories()
        }

        categoryActions.create();
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