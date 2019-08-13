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
import '../../../common/form.sass'
import './answer-editor.sass'
import BottomControls from "../../../bottom-contols/buttons";
import PropTypes from "prop-types";
import {CheckBox, TextBox} from "../../../common/input-controls";


const EDITOR_NAME = "AnswerForm"

class QuestionEditorForm extends React.Component {

    static propTypes = {
        answer: PropTypes.object,
        onSave: PropTypes.func,
        onCancel: PropTypes.func,
        onClose: PropTypes.func,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        const {answer} = this.props

        if (answer) {
            this.props.initialize({
                Text: answer.Text,
                IsCorrect: answer.IsCorrect,
            });
        }
    }

    componentDidUpdate(prevProps) {
        // if (this.props.promoId !== prevProps.promoId) {
        //     this._init()
        // }
    }

    render() {
        const {hasChanges} = this.props;

        return <div className="editor answer_editor">
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <Field component={TextBox} name="Text" label="Ответ" placeholder="Введите текст ответа"/>
                        <Field component={CheckBox} name="IsCorrect" label="Правильный ответ"/>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this._close}/>
            </div>
        </div>
    }

    _save() {
        let {editorValues, question} = this.props

        if (this.props.onSave) {
            this.props.onSave({...editorValues, Number: question.id, Id: question.Id})
        }
    }

    _cancel() {
        this.props.resetReduxForm('EDITOR_NAME')
        if (this.props.onCancel) {
            this.props.onCancel()
        }
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

    if (!values.text) {
        errors.text = 'Значение не может быть пустым'
    }

    if (!values.answTime) {
        errors.answTime = 'Значение не может быть пустым'
    } else {
        if (!$.isNumeric(values.answTime)) {
            errors.answTime = 'Значение должно быть числовым'
        }
    }

    if (!values.score) {
        errors.score = 'Значение не может быть пустым'
    } else {
        if (!$.isNumeric(values.score)) {
            errors.score = 'Значение должно быть числовым'
        }
    }

    return errors
}

let QuestionEditorWrapper = reduxForm({
    form: EDITOR_NAME,
    validate,
})(QuestionEditorForm);

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

export default connect(mapStateToProps, mapDispatchToProps)(QuestionEditorWrapper)