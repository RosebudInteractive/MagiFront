import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as categoriesActions from "../actions/categoriesListActions";
import * as commonDlgActions from '../actions/CommonDlgActions';

import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog";
import ErrorDialog from '../components/ErrorDialog';

class Categories extends React.Component {
    componentDidMount(){
        this.props.categoriesActions.getCategories();
        this._selected = null;
    }

    onAddBtnClick() {
        this.props.history.push('/adm/categories/new');
    }

    onEditBtnClick() {
        this.props.history.push('/adm/categories/edit/' + this.props.selected);
    }

    deleteCategory() {
        this.props.categoriesActions.deleteCategory(this.props.selected)
    }

    _confirmDelete() {
        this.props.commonDlgActions.showDeleteConfirmation(this.props.selected)
    }

    cancelDelete() {
        this.props.categoriesActions.cancelDelete()
    }

    select(id) {
        this.props.categoriesActions.selectCategory(id);
    }

    render() {
        const {
            categories,
            fetching,
            hasError,
            message,
            selected,
            deleteDlgShown,
            errorDlgShown,
        } = this.props;
        this._selected = selected;

        return <div className="categories">
            {
                fetching ?
                    <p>Загрузка...</p>
                    :
                    hasError ?
                        <p>{message}</p>
                        :
                        <div className="categories-content">
                            <div className="action-bar" style={{marginTop: 5, marginBottom: -10, marginLeft: 2}}>
                                <button className='tool-btn new'
                                        onClick={::this.onAddBtnClick}
                                />{' '}
                                <button
                                    className={'tool-btn edit' + (selected === null ? " disabled" : "")}
                                    onClick={::this.onEditBtnClick}
                                    disabled={(selected === null)}
                                />{' '}
                                <button
                                    className={'tool-btn delete' + (selected === null ? " disabled" : "")}
                                    onClick={::this._confirmDelete}
                                    disabled={(selected === null)}
                                />
                            </div>
                            <div className="grid-container">
                                <Webix ui={::this.getUI()} data={categories} />
                            </div>
                        </div>
            }
            {
                deleteDlgShown ?
                    <YesNoDialog
                        yesAction={::this.deleteCategory}
                        noAction={::this.cancelDelete}
                        message="Удалить категорию?"
                        data={selected}
                    />
                    :
                    ""
            }
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
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
                {id: 'Name', header: 'Название', width: 400},
                {id: "ParentName", header: "Родительская категория", fillspace: true},
            ],
            on: {
                onAfterSelect: function(selObj) {
                    if (selObj.id !== that._selected)
                    that._selected = null;
                    that.select(selObj.id);
                },
                onAfterRender: function() {
                    if ((that._selected) && this.getItem(that._selected)) {
                        this.select(that._selected)
                    }
                }
            }
        };
    }
}

function mapStateToProps(state) {
    return {
        categories: state.categoriesList.categories,
        selected: state.categoriesList.selected,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        deleteDlgShown: state.commonDlg.deleteDlgShown,
        errorDlgShown: state.commonDlg.errorDlgShown,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        categoriesActions: bindActionCreators(categoriesActions, dispatch),
        commonDlgActions : bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Categories);