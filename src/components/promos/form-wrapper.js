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
import {Prompt} from "react-router-dom";
import BottomControls from "../bottom-contols/buttons";
import {promosSelector, selectedIdSelector, editModeSelector, closeEditor, insertBook, updateBook} from "adm-ducks/promo-codes"
// import AuthorsTab from "./tabs/authors-tab";
import {showErrorDialog} from "../../actions/app-actions";
// import moment from "../course-editor/tabs/subscription-tab";

const TABS = {
    MAIN: 'main',
    PRODUCTS: 'products',
}

const NEW_PROMO = {
    Code: 'null',
    Description: null,
    Perc: null,
    Counter: 0,
    FirstDate: null,
    LastDate: null,
    Products: [],
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

    componentDidUpdate(prevProps) {
        // if (prevProps.courseSaving && !this.props.courseSaving && !this.props.courseError) {
        //     this.props.destroy();
        //     this._init()
        // }

        // if (prevProps.initialized && ((+prevProps.percent !== +this.props.percent) || (+prevProps.price !== +this.props.price))) {
        //     let _discountPrice = (this.props.percent && $.isNumeric(this.props.percent)) ? this.props.price * (1 - this.props.percent / 100) : this.props.price;
        //
        //     _discountPrice = Math.trunc(_discountPrice);
        //
        //     this.props.changeFieldValue('PromoEditor', 'perc', _discountPrice);
        // }

        // if (prevProps.initialized && ((prevProps.isPaid !== this.props.isPaid) || (prevProps.paidTp !== this.props.paidTp))) {
        //     if ((+this.props.paidTp === FREE_FOR_REG_USER) && !this.props.paidRegDate) {
        //         const _date = moment(new Date())
        //         this.props.changeFieldValue('CourseSubscriptionForm', 'PaidRegDate', _date);
        //     }
        // }
    }

    _init() {
        let {editMode, promos, promoId} = this.props,
            _promo = editMode ?
                promos.find((item) => { return item.Id === promoId })
                :
                NEW_PROMO

        if (_promo) {
            this.props.initialize({
                code: _promo.Code,
                description: _promo.Description,
                perc: _promo.Perc,
                counter: _promo.Counter,
                firstDate: _promo.FirstDate,
                lastDate: _promo.LastDate,
                products: _promo.Products,
            });
        }
    }

    render() {
        const {hasChanges} = this.props;

        return <div className="editor course_editor">
            <Prompt when={hasChanges}
                    message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
            <div className='editor__head'>
                <div className="tabs tabs-1" key='tab1'>
                    <div className="tab-links">
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.MAIN ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.MAIN) }}>Основные
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.PRODUCTS ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.PRODUCTS) }}>Курсы
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <MainTab visible={this.state.currentTab === TABS.MAIN} editMode={this.state.editMode}/>
                        {/*<AuthorsTab visible={this.state.currentTab === TABS.AUTHORS} editMode={this.state.editMode}/>*/}
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
        // let {editorValues, editMode, bookId,} = this.props,
        //     _values = Object.assign({}, editorValues)
        //
        // let _checkResult = checkBookExtLinks(_values.extLinksValues)
        //
        // if (_checkResult && _checkResult.length) {
        //     let _message = 'Недопустимые ссылки:\n' + _checkResult.join('\n')
        //     this.props.showErrorDialog(_message)
        //     return
        // }
        //
        // _values.extLinksValues = getExtLinks(_values.extLinksValues)
        // _values.course = (_values.course && +_values.course) ? +_values.course : null
        //
        // if (!editMode) {
        //     this.props.insertBook(_values)
        // } else {
        //     _values.Id = bookId;
        //     _values.Order = this._order
        //
        //     this.props.updateBook(_values)
        // }

    }

    _cancel() {
        this.props.resetReduxForm('BookEditor')
    }

    _enableApplyChanges() {
        return this.props.editorValid
    }
}

const validate = (values) => {

    const errors = {}

    if (!values.code) {
        errors.code = 'Значение не может быть пустым'
    }

    if (!values.perc) {
        errors.perc = 'Значение не может быть пустым'
    } else {
        if (!$.isNumeric(values.perc)) {
            errors.perc = 'Значение должно быть числовым'
        }

        if (values.perc > 100) {
            errors.perc = 'Скидка не может быть более 100%'
        }
    }

    // if (!values.counter && values.counter !== undefined &&
    //     !values.firstDate && values.firstDate !== undefined &&
    //     !values.lastDate && values.lastDate !== undefined) {
    //     errors.counter = 'Одно из полей должно быть заполнено'
    //     errors.firstDate = 'Одно из полей должно быть заполнено'
    //     errors.lastDate = 'Одно из полей должно быть заполнено'
    // }

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
    return bindActionCreators({closeEditor, insertBook, updateBook, resetReduxForm: reset, showErrorDialog}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PromoEditorWrapper)