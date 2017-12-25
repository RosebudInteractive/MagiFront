import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as categoriesActions from "../actions/categoriesListActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {EDIT_MODE_INSERT } from '../constants/Common';

class CategoryForm extends React.Component {

    getCurrentCategory() {
        if (this.props.editMode === EDIT_MODE_INSERT) {
            return null
        } else {
            return this.props.categories.find((elem) => {
                return elem.id === this.props.selected
            })
        }
    }

    saveCategory(values) {
        this.props.categoriesActions.saveCategory(values, this.props.editMode)
    }

    cancelEdit() {
        this.props.categoriesActions.hideEditDialog();
    }

    render() {
        const {
            selected,
            message,
            errorDlgShown,
        } = this.props;
        return (
            <div className="episodes-content">
                <Webix ui={::this.getUI(::this.saveCategory, this.cancelEdit)} data={::this.getCurrentCategory()}/>
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

    getCategoriesArray(){
        const {
            categories,
            selected
        } = this.props;

        let _filtered = categories.filter((value) => {
            return value.id !== selected;
        });

        return _filtered.map((elem) => {
            return {id: elem.id, value: elem.Name};
        })
    }

    getUI(save, cancel) {
        let _options = this.getCategoriesArray();

        return {
            view: "form", width: 400, elements: [
                {view: "text", name: "Name", label: "Наименование", placeholder: "Введите наименование"},
                {view: "combo", name: "ParentId", label: "Родительская категория", placeholder: "Введите категорию",
                    options : _options},
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
                            view: "button", value: "Отмена", click: function(){
                            if (cancel)
                                cancel();
                        }
                        }
                    ]
                }
            ],
            rules: {
                Name: window.webix.rules.isNotEmpty,
            }
        }
    }
}

function mapStateToProps(state, ownProps) {
    return {
        categories: state.categories.categories,
        editMode: state.categories.editMode,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        selected: Number(ownProps.match.params.id),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        categoriesActions: bindActionCreators(categoriesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryForm);