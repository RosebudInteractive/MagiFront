import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {
    booksSelector,
    createBook,
    deleteBook,
    editCurrentBook,
    getBooks,
    loadedSelector,
    loadingSelector,
    moveDown,
    moveUp,
    saveChanges,
    showEditorSelector,
} from "adm-ducks/books";
import {cancelDelete, showDeleteConfirmation} from '../../actions/CommonDlgActions';
import BookEditor from '../../components/books/editor'

import Webix from '../../components/Webix';
import YesNoDialog from "../../components/dialog/yes-no-dialog";
import ErrorDialog from '../../components/dialog/error-dialog';
import LoadingPage from "../../components/common/loading-page";
import PropTypes from "prop-types";
import $ from "jquery";
import {
    resizeHandler,
    restoreGridPosition,
    saveGridScrollPos,
    selectGridItem,
    selectItemWithNoRefresh
} from "../../tools/grid-common-functions";

const TIMEOUT = 500;

class BooksPage extends React.Component {

    static propTypes = {
        showEditor: PropTypes.bool,
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._isFirstSelected = false;
        this._isLastSelected = false;

        this._timer = null

        this._resizeHandler = resizeHandler.bind(this)
        this._restoreGridPosition = restoreGridPosition.bind(this)
        this._saveScrollPos = saveGridScrollPos.bind(this)
        this._select = selectGridItem.bind(this)
        this._selectNoRefresh = selectItemWithNoRefresh.bind(this)
    }

    get tableId() {
        return "books-grid"
    }

    UNSAFE_componentWillMount() {
        if (this.props.showEditor) {
            if (this.props.editMode) {
                this.props.actions.editCurrentBook(this.props.bookId)
            } else {
                this.props.actions.createBook();
            }
        }

        this.props.actions.getBooks();
        this._selected = null;
    }

    componentDidMount() {
        $(window).on('resize', this._resizeHandler);
    }

    UNSAFE_componentWillReceiveProps(nextProps,) {
        if (!this.props.loaded && nextProps.loaded) {

            this._selected = (nextProps.books.length > 0) ?
                nextProps.bookId ?
                    nextProps.bookId
                    :
                    nextProps.books[0].id
                :
                null;


            this._isFirstSelected = !!this._selected
        }

        this._saveScrollPos()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.loading && !this.props.loading) {
            this._resizeHandler();
        }

        this._restoreGridPosition()
    }

    componentWillUnmount() {
        this.props.actions.saveChanges()
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        const {
            books,
            loading,
            loaded,
            deleteDlgShown,
            showBookEditor,
        } = this.props;

        return !loading && loaded ?
            <div className="courses">
                <div className="courses-content">
                    <div className="action-bar">
                        <button className='tool-btn new'
                                onClick={::this._onAddBtnClick}
                        />
                        <button
                            className={'tool-btn edit' + (this._selected === null ? " disabled" : "")}
                            onClick={::this._onEditBtnClick}
                            disabled={(this._selected === null)}
                        />
                        <button
                            className={'tool-btn delete' + (this._selected === null ? " disabled" : "")}
                            onClick={::this._confirmDelete}
                            disabled={(this._selected === null)}
                        />
                        <button key='btnUp' className='tool-btn up'
                                disabled={(!this._selected) || (this._isFirstSelected)} onClick={::this._moveUp}/>
                        <button key='btnDown' className='tool-btn down'
                                disabled={(!this._selected) || (this._isLastSelected)} onClick={::this._moveDown}/>
                    </div>
                    <div className="grid-container">
                        <div className="webix-grid-wrapper">
                            <Webix ui={::this.getUI(::this._select)} data={books}/>
                        </div>
                    </div>
                </div>
                {
                    (deleteDlgShown && !showBookEditor) ?
                        <YesNoDialog
                            yesAction={::this._deleteBook}
                            noAction={::this._cancelDelete}
                            message={"Удалить книгу" + this._getSelectedBooksName() + "?"}
                        />
                        :
                        null
                }
                {!showBookEditor ? <ErrorDialog/> : null}
                <BookEditor onPrevClick={this._isFirstSelected ? null : ::this._onEditPrev}
                            onNextClick={this._isLastSelected ? null : ::this._onEditNext}/>
            </div>
            :
            <LoadingPage/>
    }

    _onAddBtnClick() {
        this.props.actions.createBook();
    }

    _onEditBtnClick() {
        this.props.actions.editCurrentBook(this._selected);
    }

    _deleteBook() {
        this.props.actions.deleteBook(this._selected)
    }

    _confirmDelete() {
        this.props.actions.showDeleteConfirmation(this._selected)
    }

    _cancelDelete() {
        this.props.actions.cancelDelete()
    }

    _onEditPrev() {
        const _index = this.props.books.findIndex((item) => {
            return item.id === this.props.bookId
        })

        if (_index > 0) {
            window.$$(this.tableId).select(this.props.books[_index - 1].id)
        }

        this._onEditBtnClick()
    }

    _onEditNext() {
        const _index = this.props.books.findIndex((item) => {
            return item.id === this.props.bookId
        })

        if (_index < this.props.books.length - 1) {
            window.$$(this.tableId).select(this.props.books[_index + 1].id)
        }

        this._onEditBtnClick()
    }

    _getSelectedBooksName() {
        let _book = null;

        if (this._selected) {
            _book = this.props.books.find((item) => {
                return item.id === this._selected
            })
        }

        return _book ? ' "' + _book.Name + '"' : ''
    }

    _moveUp() {
        this.props.actions.moveUp(this._selected);
        this._restartTimeout()
    }

    _moveDown() {
        this.props.actions.moveDown(this._selected);
        this._restartTimeout()
    }

    _restartTimeout() {
        if (this._timer) {
            clearTimeout(this._timer)
        }

        this._timer = setTimeout(() => {
            clearTimeout(this._timer)
            this.props.actions.saveChanges()
        }, TIMEOUT)
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
                {id: 'Name', header: ['Название книги', {content:"textFilter"}], width: 230},
                {id: "Description", header: ['Описание курса', {content:"textFilter"}], fillspace: true},
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
                }
            }
        };
    }
}

function mapStateToProps(state, ownProps) {
    return {
        loaded: loadedSelector(state),
        loading: loadingSelector(state),
        books: booksSelector(state),

        deleteDlgShown: state.commonDlg.deleteDlgShown,
        showBookEditor: showEditorSelector(state),

        bookId: ownProps.match ? Number(ownProps.match.params.id) : null,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getBooks,
            createBook,
            editCurrentBook,
            deleteBook,
            showDeleteConfirmation,
            cancelDelete,
            moveUp,
            moveDown,
            saveChanges,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BooksPage);
