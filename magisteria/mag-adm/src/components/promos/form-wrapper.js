import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {
    reduxForm,
    reset,
    isDirty,
    getFormValues,
    isValid,
} from 'redux-form'
import MainTab from './tabs/main-tab'
import '../common/form.sass'
import BottomControls from "../bottom-contols/buttons";
import {promosSelector, selectedIdSelector, editModeSelector, closeEditor, insertPromo, updatePromo, raiseNotExistPromoError} from "adm-ducks/promo-codes"
import ProductTab from "./tabs/product-tab";
import {showErrorDialog} from "../../actions/app-actions";
import moment from "moment";

const TABS = {
    MAIN: 'main',
    PRODUCTS: 'products',
}

const NEW_PROMO = {
    Code: '',
    Description: null,
    Perc: null,
    Counter: null,
    FirstDate: null,
    LastDate: null,
    Products: [],
    Rest: null,
}

class PromoEditorForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentTab: TABS.MAIN,
        }
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        let {editMode, promos, promoId} = this.props,
            _promo = editMode ?
                promos.find((item) => { return item.Id === promoId })
                :
                NEW_PROMO

        if (_promo) {
            let _firstDate = _promo.FirstDate ?
                typeof _promo.FirstDate === 'string' ?
                    moment(new Date(_promo.FirstDate))
                    :
                    _promo.FirstDate
                :
                '',
                _lastDate = _promo.LastDate ?
                    typeof _promo.LastDate === 'string' ?
                        moment(new Date(_promo.LastDate))
                        :
                        _promo.LastDate
                    :
                    ''


            this.props.initialize({
                code: _promo.Code,
                description: _promo.Description,
                perc: _promo.Perc,
                counter: _promo.Counter,
                firstDate: _firstDate,
                lastDate: _lastDate,
                products: _promo.Products,
                rest: _promo.Rest,
            });
        } else {
            this.props.raiseNotExistPromoError()
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.promoId !== prevProps.promoId) {
            this._init()
        }
    }

    render() {
        const {hasChanges} = this.props;

        return <div className="editor course_editor">
            <div className='editor__head'>
                <div className="tabs tabs-1" key='tab1'>
                    <div className="tab-links">
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.MAIN ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.MAIN) }}>????????????????
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.PRODUCTS ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.PRODUCTS) }}>??????????
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <MainTab visible={this.state.currentTab === TABS.MAIN} editMode={this.state.editMode}/>
                        <ProductTab visible={this.state.currentTab === TABS.PRODUCTS} editMode={this.state.editMode}/>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this.props.closeEditor}/>
            </div>
        </div>
    }

    _switchTo(tabName) {
        if (this.state.currentTab !== tabName) {
            this.setState({
                currentTab: tabName
            })
        }
    }

    _save() {
        let {editorValues, editMode, promoId,} = this.props,
            _values = Object.assign({}, editorValues)

        if (!+_values.counter && !_values.firstDate && !_values.lastDate) {
            const _message = '???????? ???? ?????????? "??????????????", "???????? ????????????" ?????? "???????? ??????????????????" ???????????? ???????? ??????????????????'
            this.props.showErrorDialog(_message)
            return
        }

        if (!_values.description) {
            _values.description = `???????????????? "${_values.code}"`
            _values.description += _values.perc ? ` ?? ${_values.perc}%` : ''
            _values.description += _values.counter ? ` ?????????????????????? ${_values.counter}????.` : ''
            _values.description += _values.firstDate ? ` c ${_values.firstDate.format("D.MM.YY")}` : ''
            _values.description += _values.lastDate ? ` ???? ${_values.lastDate.format("D.MM.YY")}` : ''
        }

        if (!editMode) {
            this.props.insertPromo(_values)
        } else {
            _values.Id = promoId;

            this.props.updatePromo(_values)
        }

    }

    _cancel() {
        this.props.resetReduxForm('PromoEditor')
    }

    _enableApplyChanges() {
        return this.props.editorValid
    }
}

const validate = (values) => {

    const errors = {}

    if (!values.code) {
        errors.code = '???????????????? ???? ?????????? ???????? ????????????'
    }

    if (!values.perc) {
        errors.perc = '???????????????? ???? ?????????? ???????? ????????????'
    } else {
        if (!$.isNumeric(values.perc)) {
            errors.perc = '???????????????? ???????????? ???????? ????????????????'
        }

        if (values.perc > 100) {
            errors.perc = '???????????? ???? ?????????? ???????? ?????????? 100%'
        }
    }

    return errors
}

let PromoEditorWrapper = reduxForm({
    form: 'PromoEditor',
    validate,
})(PromoEditorForm);

function mapStateToProps(state) {
    return {
        hasChanges: isDirty('PromoEditor')(state),
        editorValues: getFormValues('PromoEditor')(state),
        editorValid: isValid('PromoEditor')(state),

        promos: promosSelector(state),
        promoId: selectedIdSelector(state),
        editMode: editModeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({closeEditor, insertPromo, updatePromo, resetReduxForm: reset, showErrorDialog, raiseNotExistPromoError}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PromoEditorWrapper)