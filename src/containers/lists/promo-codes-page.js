import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {
    getPromoCodes,
    createPromo,
    editCurrentPromo,
    deleteBook,
    promosSelector,
    loadingSelector,
    loadedSelector,
    showEditorSelector,
} from "adm-ducks/promo-codes";
import {showDeleteConfirmation, cancelDelete} from '../../actions/CommonDlgActions';
import PromoEditor from '../../components/promos/editor'

import Webix from '../../components/Webix';
import YesNoDialog from "../../components/dialog/yes-no-dialog";
import ErrorDialog from '../../components/dialog/error-dialog';
import LoadingPage from "../../components/common/loading-page";
import PropTypes from "prop-types";
import {Route} from "react-router-dom";

class PromosPage extends React.Component {

    static propTypes = {
        showEditor: PropTypes.bool,
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._isFirstSelected = false;
        this._isLastSelected = false;
    }

    componentWillMount() {
        if (this.props.showEditor) {
            if (this.props.editMode) {
                this.props.editCurrentPromo(this.props.promoId)
            } else {
                this.props.createPromo();
            }

        }

        this.props.getPromoCodes();
        this._selected = null;
    }

    componentWillUnmount() {
        // this.props.actions.saveChanges()
    }


    _onEditBtnClick() {
        this.props.editCurrentPromo(this._selected);
    }

    _deleteBook() {
        // this.props.actions.deleteBook(this._selected)
    }

    _confirmDelete() {
        // this.props.actions.showDeleteConfirmation(this._selected)
    }

    _cancelDelete() {
        // this.props.actions.cancelDelete()
    }

    _select(selectedObj) {
        let _needForceUpdate = (this._selected !== +selectedObj.id) || (this._isFirstSelected !== selectedObj.isFirst) || (this._isLastSelected !== selectedObj.isLast);

        this._isFirstSelected = selectedObj.isFirst;
        this._isLastSelected = selectedObj.isLast;
        this._selected = +selectedObj.id;

        if (_needForceUpdate) {
            this.forceUpdate()
        }
    }

    componentWillReceiveProps(nextProps,) {
        if (!this.props.loaded && nextProps.loaded) {

            this._selected = (nextProps.promos.length > 0) ? nextProps.promos[0].id : null;
            this._isFirstSelected = !!this._selected
        }
    }

    render() {
        const {
            promos,
            loading,
            deleteDlgShown,
            showPromoEditor,
        } = this.props;

        return loading ?
            <LoadingPage/>
            :
            <div className="courses">
                <div className="courses-content">
                    <div className="action-bar">
                        <button className='tool-btn new'
                                onClick={::this.props.createPromo}
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
                    </div>
                    <div className="grid-container">
                        <div className="webix-grid-wrapper">
                            <Webix ui={::this.getUI(::this._select)} data={promos}/>
                        </div>
                    </div>
                </div>
                {
                    (deleteDlgShown && !showPromoEditor)?
                        <YesNoDialog
                            yesAction={::this._deleteBook}
                            noAction={::this._cancelDelete}
                            message={"Удалить промокод" + this._getSelectedBooksName() + "?"}
                        />
                        :
                        null
                }
                { !showPromoEditor ? <ErrorDialog/> : null }
                <PromoEditor/>
                {/*<Route path={'/promos/new'} render={(props) => <PromosPage {...props} showEditor={true} editMode={false}/>}/>*/}
                {/*<Route path={'/promos/edit/:id'} render={(props) => <PromosPage {...props} showEditor={true} editMode={true}/>}/>*/}
            </div>
    }

    _getSelectedBooksName() {
        let _promo = null;

        if (this._selected) {
            _promo = this.props.promos.find((item) => {
                return item.id === this._selected
            })
        }

        return _promo ? ' "' + _promo.Code + '"' : ''
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            id: 'courses-grid',
            scroll: false,
            autoheight: true,
            select: 'row',
            editable: false,
            columns: [
                {id: 'Code', header: 'Код', width: 230},
                {id: "Description", header: "Описание", fillspace: true},
            ],
            on: {
                onAfterSelect: function (selObj) {
                    let _obj = {
                        isFirst: this.getFirstId() === +selObj.id,
                        isLast: this.getLastId() === +selObj.id,
                        id: +selObj.id,
                    };
                    that._select(_obj);
                },
                onAfterRender: function () {
                    if ((that._selected) && this.getItem(that._selected)) {
                        let _selectedItem = this.getSelectedItem()

                        if (!_selectedItem || (_selectedItem.Id !== that._selected)) {
                            this.select(that._selected)
                        }
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
        promos: promosSelector(state),

        deleteDlgShown: state.commonDlg.deleteDlgShown,
        showPromoEditor: showEditorSelector(state),

        promoId: ownProps.match ? Number(ownProps.match.params.id) : null,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ getPromoCodes, createPromo, editCurrentPromo,
            // deleteBook,
            showDeleteConfirmation,
            cancelDelete,
            // moveUp,
            // moveDown,
            // saveChanges,
        }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PromosPage);