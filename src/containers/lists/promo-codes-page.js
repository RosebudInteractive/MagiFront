import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {
    getPromoCodes,
    createPromo,
    editCurrentPromo,
    deletePromo,
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

    _onEditBtnClick() {
        this.props.editCurrentPromo(this._selected);
    }

    _deletePromo() {
        this.props.deletePromo(this._selected)
    }

    _confirmDelete() {
        this.props.showDeleteConfirmation()
    }

    _cancelDelete() {
        this.props.cancelDelete()
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

            this._selected = (nextProps.promos.length > 0) ?
                nextProps.promoId ?
                    nextProps.promoId
                    :
                    nextProps.promos[0].id
                :
                null;

            this._isFirstSelected = !!this._selected
        }
    }

    render() {
        const {
            loading,
            loaded,
            deleteDlgShown,
            showPromoEditor,
        } = this.props;

        return !loading && loaded ?
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
                            <Webix ui={::this.getUI(::this._select)} data={this._getData()}/>
                        </div>
                    </div>
                </div>
                {
                    (deleteDlgShown && !showPromoEditor)?
                        <YesNoDialog
                            yesAction={::this._deletePromo}
                            noAction={::this._cancelDelete}
                            message={"Удалить промокод" + this._getSelectedPromoName() + "?"}
                        />
                        :
                        null
                }
                { !showPromoEditor ? <ErrorDialog/> : null }
                <PromoEditor onPrevClick={this._isFirstSelected ? null : ::this._onEditPrev}
                             onNextClick={this._isLastSelected ? null : ::this._onEditNext}/>
            </div>
            :
            <LoadingPage/>
    }

    _onEditPrev() {
        const _index = this.props.promos.findIndex((item) => {
            return item.id === this.props.promoId
        })

        if (_index > 0) {
            window.$$("promos-grid").select(this.props.promos[_index - 1].id)
        }

        this._onEditBtnClick()
    }

    _onEditNext() {
        const _index = this.props.promos.findIndex((item) => {
            return item.id === this.props.promoId
        })

        if (_index < this.props.promos.length - 1) {
            window.$$("promos-grid").select(this.props.promos[_index + 1].id)
        }

        this._onEditBtnClick()
    }

    _getData() {
        return this.props.promos.map((item) => {
            let _data = Object.assign({}, item)

            _data.Rest = item.Counter ? item.Rest : '-'

            return _data
        })
    }

    _getSelectedPromoName() {
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
            id: 'promos-grid',
            scroll: false,
            autoheight: true,
            select: 'row',
            editable: false,
            columns: [
                {id: 'Code', header: 'Код', width: 230},
                {id: "Description", header: "Описание", fillspace: true},
                {id: "Rest", header: "Осталось", width: 150},
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
                },
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
    return bindActionCreators({ getPromoCodes, createPromo, editCurrentPromo, deletePromo, showDeleteConfirmation, cancelDelete, }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PromosPage);