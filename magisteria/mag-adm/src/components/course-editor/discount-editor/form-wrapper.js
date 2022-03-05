import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {
    reduxForm,
    reset,
    isDirty,
    getFormValues,
    isValid, Field,
} from 'redux-form'
import '../../common/form.sass'
import './discount-editor.sass'
import BottomControls from "../../bottom-contols/buttons";
import PropTypes from "prop-types";
import {TextBox} from "../../common/input-controls";
import Datepicker from "../../common/date-time-control";
import TimeInput, {LAST_UNIT} from "../../common/masked-controls/time-input";

const EDITOR_NAME = "DiscountEditor"

class DiscountEditorForm extends React.Component {

    static propTypes = {
        discount: PropTypes.object,
        onSave: PropTypes.func,
        onClose: PropTypes.func,
    };

    constructor(props) {
        super(props);
    }

    UNSAFE_componentWillMount() {
        this._init()
    }

    _init() {
        const {discount} = this.props

        if (discount) {
            this.props.initialize({
                Code: discount.Code,
                Perc: discount.Perc,
                TotalTime: discount.TtlMinutes * 60,
                FirstDate: discount.FirstDate,
                LastDate: discount.LastDate,
                Description: discount.Description,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.discount !== prevProps.discount) {
            this._init()
        }
    }

    render() {
        const {hasChanges} = this.props;

        return <div className="editor discount_editor">
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <div className="controls-wrapper no-tabs-form">
                            <Field component={Datepicker} name="FirstDate" label="Начало действия" showTime={true} disabled={false}/>
                            <Field component={Datepicker} name="LastDate" label="Окончание действия" showTime={true} disabled={false}/>
                            <Field component={TextBox} name="Code" label="Код скидки"/>
                            <Field component={TextBox} name="Perc" label="Процент скидки" placeholder="Введите значение" disabled={false}/>
                            <Field component={TimeInput} name="TotalTime" label="Время жизни скидки" lastUnit={LAST_UNIT.MINUTES} placeholder="Введите значение" disabled={false}/>
                            <Field component={TextBox} name="Description" label="Описание скидки" placeholder="Введите описание"/>
                        </div>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel}/>
            </div>
        </div>
    }

    _save() {
        let {editorValues, discount} = this.props

        if (this.props.onSave) {
            this.props.onSave({...editorValues, id: discount.id, Id: discount.Id, TtlMinutes: Math.round(editorValues.TotalTime / 60)})
        }
    }

    _cancel() {
        this.props.resetReduxForm(EDITOR_NAME)
    }

    _close() {
        if (this.props.onClose) {
            this.props.onClose()
        }
    }

    _enableApplyChanges() {
        return this.props.editorValid
    }
}

const validate = (values) => {

    const errors = {}

    if (!values.Code) {
        errors.Code = 'Значение не может быть пустым'
    }

    if (!values.Perc) {
        errors.Perc = 'Значение не может быть пустым'
    }

    if (!values.TtlMinutes) {
        errors.TtlMinutes = 'Значение не может быть пустым'
    }

    if (!$.isNumeric(values.TtlMinutes)) {
        errors.TtlMinutes = 'Значение должно быть числовым'
    }

    if (!$.isNumeric(values.Perc)) {
        errors.Perc = 'Значение должно быть числовым'
    }

    if (values.Perc >= 100) {
        errors.Perc = 'Скидка не может быть 100% или более'
    }

    if (!values.FirstDate) {
        errors.FirstDate = 'Значение не может быть пустым'
    }

    if (!values.LastDate) {
        errors.LastDate = 'Значение не может быть пустым'
    }

    if (values.FirstDate && values.LastDate && (values.FirstDate.isSameOrAfter(values.LastDate))) {
        errors.LastDate = 'Дата окончания должна быть больше даты начала'
    }

    return errors
}

let DiscountEditorWrapper = reduxForm({
    form: EDITOR_NAME,
    validate,
})(DiscountEditorForm);

function mapStateToProps(state) {
    return {
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({resetReduxForm: reset,}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DiscountEditorWrapper)
