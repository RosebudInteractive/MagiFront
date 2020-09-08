import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as categoriesActions from "../../actions/categoriesListActions";
import * as commonDlgActions from '../../actions/CommonDlgActions';

import Webix from '../../components/Webix';
import YesNoDialog from "../../components/dialog/yes-no-dialog";
import ErrorDialog from '../../components/dialog/error-dialog';
import LoadingPage from "../../components/common/loading-page";
import {
    resizeHandler,
    restoreGridPosition,
    saveGridScrollPos,
    selectGridItem,
    selectItemWithNoRefresh
} from "../../tools/grid-common-functions";
import $ from "jquery";

class CategoriesPage extends React.Component {

    constructor(props) {
        super(props)

        this._isFirstSelected = false;
        this._isLastSelected = false;

        this._resizeHandler = resizeHandler.bind(this)
        this._restoreGridPosition = restoreGridPosition.bind(this)
        this._saveScrollPos = saveGridScrollPos.bind(this)
        this._select = selectGridItem.bind(this)
        this._selectNoRefresh = selectItemWithNoRefresh.bind(this)
    }

    get tableId() {
        return "categories-grid"
    }

    UNSAFE_componentWillMount() {
        this.props.categoriesActions.getCategories();
    }

    componentDidMount(){
        $(window).on('resize', this._resizeHandler);
        this._resizeHandler();

        this._selected = null;
    }

    UNSAFE_componentWillReceiveProps(nextProps,) {
        if (this.props.fetching && !nextProps.fetching) {

            this._selected = (nextProps.categories.length > 0) ?
                nextProps.categories[0].id
                :
                null;

            this._isFirstSelected = !!this._selected
        }

        this._saveScrollPos()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.fetching && !this.props.fetching) {
            this._resizeHandler();
        }

        this._restoreGridPosition()
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        const {
            categories,
            fetching,
            hasError,
            deleteDlgShown,
            errorDlgShown,
        } = this.props;

        return <div className="categories">
            {
                fetching ?
                    <LoadingPage/>
                    :
                    <div className="categories-content">
                        <div className="action-bar">
                            <button className='tool-btn new'
                                    onClick={::this.onAddBtnClick}
                            />
                            <button
                                className={'tool-btn edit' + (this._selected === null ? " disabled" : "")}
                                onClick={::this.onEditBtnClick}
                                disabled={(this._selected === null)}
                            />
                            <button
                                className={'tool-btn delete' + (this._selected === null ? " disabled" : "")}
                                onClick={::this._confirmDelete}
                                disabled={(this._selected === null)}
                            />
                        </div>
                        <div className="grid-container">
                            <Webix ui={::this.getUI()} data={categories} />
                        </div>
                    </div>
            }
            { deleteDlgShown && <YesNoDialog yesAction={::this.deleteCategory} noAction={::this.cancelDelete} message={"Удалить категорию" + this._getSelectedCategoryName() + "?"}/> }
            { (errorDlgShown || hasError) && <ErrorDialog/> }
        </div>
    }

    onAddBtnClick() {
        this.props.history.push('/adm/categories/new');
    }

    onEditBtnClick() {
        this.props.history.push('/adm/categories/edit/' + this._selected);
    }

    deleteCategory() {
        this.props.categoriesActions.deleteCategory(this._selected)
    }

    _confirmDelete() {
        this.props.commonDlgActions.showDeleteConfirmation()
    }

    cancelDelete() {
        this.props.categoriesActions.cancelDelete()
    }

    _getSelectedCategoryName() {
        let _category = null;

        if (this._selected) {
            _category = this.props.categories.find((item) => {
                return item.id === this._selected
            })
        }

        return _category ? ' "' + _category.Name + '"' : ''
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            id: this.tableId,
            scroll: 'y',
            height: 500,
            select: 'row',
            editable: false,
            columns: [
                {id: 'Name', header: 'Название', width: 400},
                {id: "ParentName", header: "Родительская категория", fillspace: true},
            ],
            on: {
                onAfterSelect: function (selObj) {
                    if ((parseInt(selObj.id) !== that._selected) && this.getItem(selObj.id)) {
                        that._selected = null;
                        let _obj = {
                            isFirst: this.getFirstId() === selObj.id,
                            isLast: this.getLastId() === selObj.id,
                            id: +selObj.id,
                        };
                        that._select(_obj);
                    }
                },
                onAfterRender: function () {
                    if ((that._selected) && this.getItem(that._selected)) {
                        let _selectedItem = this.getSelectedItem()

                        if (!_selectedItem || (_selectedItem.Id !== that._selected)) {
                            this.select(that._selected)
                        }

                        let _obj = {
                            isFirst: this.getFirstId() === that._selected,
                            isLast: this.getLastId() === that._selected,
                            id: that._selected,
                        };

                        that._selectNoRefresh(_obj);
                    }
                },
            }
        };
    }
}

function mapStateToProps(state) {
    return {
        categories: state.categoriesList.categories,
        fetching: state.categoriesList.fetching,

        hasError: state.commonDlg.hasError,
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesPage);