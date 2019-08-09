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
import './question-editor.sass'
import BottomControls from "../../bottom-contols/buttons";
import {TextBox} from "../../common/input-controls";
import TextArea from "../../common/text-area";
import Select from "../../common/select-control";
import RadioBox from "../../common/radio-box-control";
import PropTypes from "prop-types";

const ANSWER_TYPES = [
        {id: 1, value: 'Число'},
        {id: 2, value: 'Да/Нет'},
        {id: 3, value: '1 из многих'},
        {id: 4, value: 'N из многих'},
        {id: 2, value: 'Текст'},
    ],
    EDITOR_NAME = "QuestionEditor",
    RADIO_BOX_VALUES = [
        {value: 1, text: "Да"},
        {value: 0, text: "Нет"},
    ]

class QuestionEditorForm extends React.Component {

    static propTypes = {
        question: PropTypes.object,
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
        const {question} = this.props

        if (question) {
            this.props.initialize({
                AnswTime: question.AnswTime,
                Text: question.Text,
                Picture: question.Picture,
                PictureMeta: question.PictureMeta,
                AnswType: question.AnswType,
                Score: question.Score,
                StTime: question.StTime,
                EndTime: question.EndTime,
                AllowedInCourse: question.AllowedInCourse,
                AnswBool: question.AnswBool,
                AnswInt: question.AnswInt,
                AnswText: question.AnswText,
                CorrectAnswResp: question.CorrectAnswResp,
                WrongAnswResp: question.WrongAnswResp,
                Answers: question.Answers,
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

        return <div className="editor question_editor">
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <div className={"tab-wrapper controls-wrapper"}>
                            <Field component={TextArea} name="Text" label="Текст вопроса" enableHtml={false}/>
                            <Field component={TextBox} name="AnswTime" label="Время на вопрос" placeholder="Введите время, отводимое на ответ"/>
                            <Field component={Select} name="AnswType" label="Тип ответа" options={ANSWER_TYPES}/>
                            <Field component={TextBox} name="Score" label="Количество баллов за правильный ответ"/>
                            <Field component={TextBox} name="StTime" label="Начало времени эпизода, где можно послушать об этом"/>
                            <Field component={TextBox} name="EndTime" label="Конец времени эпизода, где можно послушать об этом"/>
                            <Field component={RadioBox} name="AllowedInCourse" label="Отображать в сводном тесте" options={RADIO_BOX_VALUES}/>
                            <Field component={TextBox} name="AnswText" label="Правильный ответ" />
                            <Field component={TextBox} name="CorrectAnswResp" label="Текст в случае правильного ответа" />
                            <Field component={TextBox} name="WrongAnswResp" label="Текст в случае ошибочного ответа" />
                        </div>
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
            this.props.onSave({...editorValues, id: question.id, Id: question.Id})
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