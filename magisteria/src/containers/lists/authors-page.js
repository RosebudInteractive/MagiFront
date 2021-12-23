import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as authorsActions from "../../actions/authorsListActions";
import * as commonDlgActions from '../../actions/CommonDlgActions';

import Webix from '../../components/Webix';
import YesNoDialog from "../../components/dialog/yes-no-dialog";
import ErrorDialog from '../../components/dialog/error-dialog';
import history from '../../history'
import {
    resizeHandler,
    restoreGridPosition,
    saveGridScrollPos,
    selectGridItem,
    selectItemWithNoRefresh
} from "../../tools/grid-common-functions";
import $ from "jquery";
import LoadingPage from "../../components/common/loading-page";

class AuthorsPage extends React.Component {

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
        this.props.authorsActions.getAuthors();
    }

    componentDidMount(){
        $(window).on('resize', this._resizeHandler);
        this._resizeHandler();

        this._selected = null;
    }

    UNSAFE_componentWillReceiveProps(nextProps,) {
        if (this.props.fetching && !nextProps.fetching) {

            this._selected = (nextProps.authors.length > 0) ?
                nextProps.authors[0].id
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
            authors,
            fetching,
            errorDlgShown,
            deleteDlgShown,
        } = this.props;

        return <div className="authors">
            {
                fetching ?
                    <LoadingPage/>
                    :
                    <div className="authors-content">
                        <div className="action-bar">
                            <button className='tool-btn new' onClick={::this.onAddBtnClick} />
                            <button
                                className={'tool-btn edit' + (this._selected === null ? " disabled" : "")}
                                onClick={::this.onEditBtnClick}
                                disabled={this._selected === null}
                            />
                            <button
                                className={'tool-btn delete' + (this._selected === null ? " disabled" : "")}
                                onClick={::this._confirmDelete}
                                disabled={this._selected === null}
                            />
                        </div>
                        <div className="grid-container">
                            <Webix ui={::this.getUI()} data={authors}/>
                        </div>
                    </div>
            }
            { errorDlgShown && <ErrorDialog/> }
            { deleteDlgShown && <YesNoDialog yesAction={::this.deleteAuthor} noAction={::this.cancelDelete} message={"Удалить автора" + this._getSelectedAuthorName() + "?"}/> }
        </div>
    }

    onAddBtnClick() {
        history.push('/adm/authors/new');
    }

    onEditBtnClick() {
        history.push('/adm/authors/edit/' + this._selected);
    }

    deleteAuthor() {
        this.props.authorsActions.deleteAuthor(this._selected)
    }

    _confirmDelete() {
        this.props.commonDlgActions.showDeleteConfirmation()
    }

    cancelDelete() {
        this.props.authorsActions.cancelDelete()
    }

    _getSelectedAuthorName() {
        let _author = null;

        if (this._selected) {
            _author = this.props.authors.find((item) => {
                return item.id === this._selected
            })
        }

        return _author ? ' "' + `${_author.FirstName} ${_author.LastName}` + '"' : ''
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
                {id: 'FirstName', header: 'Имя', width: 200},
                {id: 'LastName', header: 'Фамилия', width: 300},
                {id: "Description", header: "Описание", fillspace: true},
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
        authors: state.authorsList.authors,
        fetching: state.authorsList.fetching,

        hasError: state.commonDlg.hasError,
        deleteDlgShown: state.commonDlg.deleteDlgShown,
        errorDlgShown: state.commonDlg.errorDlgShown,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        authorsActions: bindActionCreators(authorsActions, dispatch),
        commonDlgActions : bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorsPage);