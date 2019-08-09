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
import '../common/form.sass'
import BottomControls from "../bottom-contols/buttons";
import {questionsSelector, selectedQuestionIdSelector, questionInEditModeSelector,
    closeQuestionEditor, insertQuestion, updateQuestion, raiseNotExistQuestionError} from "adm-ducks/single-test"
import {showErrorDialog} from "../../actions/app-actions";
import {TextBox} from "../common/input-controls";
import TextArea from "../common/text-area";
import Select from "../common/select-control";
import RadioBox from "../common/radio-box-control";

const NEW_QUESTION = {
        AnswTime: 10,
        Text: null,
        Picture: null,
        PictureMeta: null,
        AnswType: 1,
        Score: 1,
        StTime: null,
        EndTime: null,
        AllowedInCourse: null,
        AnswBool: null,
        AnswInt: null,
        AnswText: null,
        CorrectAnswResp: null,
        WrongAnswResp: null,
        Answers: [],
    },
    ANSWER_TYPES = [
        //1- число, 2-да/нет, 3-1 из многих, 4-N из многих, 5-текст
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

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        let {editMode, questions, questionId} = this.props,
            _question = editMode ?
                questions.find((item) => { return item.Id === questionId })
                :
                NEW_QUESTION

        if (_question) {
            this.props.initialize({
                answTime: _question.AnswTime,
                text: _question.Text,
                picture: _question.Picture,
                pictureMeta: _question.PictureMeta,
                answType: _question.AnswType,
                score: _question.Score,
                stTime: _question.StTime,
                endTime: _question.EndTime,
                allowedInCourse: _question.AllowedInCourse,
                answBool: _question.AnswBool,
                answInt: _question.AnswInt,
                answText: _question.AnswText,
                correctAnswResp: _question.CorrectAnswResp,
                wrongAnswResp: _question.WrongAnswResp,
                answers: _question.Answers,
            });
        } else {
            this.props.raiseNotExistPromoError()
        }
    }

    componentDidUpdate(prevProps) {
        // if (this.props.promoId !== prevProps.promoId) {
        //     this._init()
        // }
    }

    render() {
        const {hasChanges} = this.props;

        return <div className="editor course_editor">
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <div className={"tab-wrapper controls-wrapper"}>
                            <Field component={TextArea} name="text" label="Текст вопроса" enableHtml={false}/>
                            <Field component={TextBox} name="answTime" label="Время на вопрос" placeholder="Введите время, отводимое на ответ"/>
                            <Field component={Select} name="answType" label="Тип ответа" options={ANSWER_TYPES}/>
                            <Field component={TextBox} name="score" label="Количество баллов за правильный ответ"/>
                            <Field component={TextBox} name="stTime" label="Начало времени эпизода, где можно послушать об этом"/>
                            <Field component={TextBox} name="endTime" label="Конец времени эпизода, где можно послушать об этом"/>
                            <Field component={RadioBox} name="allowedInCourse" label="Отображать в сводном тесте" options={RADIO_BOX_VALUES}/>
                            <Field component={TextBox} name="answText" label="Правильный ответ" />
                            <Field component={TextBox} name="correctAnswResp" label="Текст в случае правильного ответа" />
                            <Field component={TextBox} name="wrongAnswResp" label="Текст в случае ошибочного ответа" />
                        </div>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this.props.closeQuestionEditor}/>
            </div>
        </div>
    }

    _save() {
        // let {editorValues, editMode, promoId,} = this.props,
        //     _values = Object.assign({}, editorValues)
        //
        // if (!+_values.counter && !_values.firstDate && !_values.lastDate) {
        //     const _message = 'Одно из полей "Счетчик", "Дата начала" или "Дата окончания" должно быть заполнено'
        //     this.props.showErrorDialog(_message)
        //     return
        // }
        //
        // if (!_values.description) {
        //     _values.description = `Промокод "${_values.code}"`
        //     _values.description += _values.perc ? ` в ${_values.perc}%` : ''
        //     _values.description += _values.counter ? ` количеством ${_values.counter}шт.` : ''
        //     _values.description += _values.firstDate ? ` c ${_values.firstDate.format("D.MM.YY")}` : ''
        //     _values.description += _values.lastDate ? ` по ${_values.lastDate.format("D.MM.YY")}` : ''
        // }
        //
        // if (!editMode) {
        //     this.props.insertPromo(_values)
        // } else {
        //     _values.Id = promoId;
        //
        //     this.props.updatePromo(_values)
        // }

    }

    _cancel() {
        this.props.resetReduxForm('EDITOR_NAME')
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

        questions: questionsSelector(state),
        questionId: selectedQuestionIdSelector(state),
        editMode: questionInEditModeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({closeQuestionEditor, insertQuestion, updateQuestion, raiseNotExistQuestionError, resetReduxForm: reset, showErrorDialog,}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QuestionEditorWrapper)