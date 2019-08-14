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
import '../../common/form.sass'
import './question-editor.sass'
import BottomControls from "../../bottom-contols/buttons";
import PropTypes from "prop-types";
import MainTab from "./tabs/main-tab";
import AnswersTab from "./tabs/answers-tab";

const EDITOR_NAME = "QuestionEditor",
    TABS = {
        MAIN: 'MAIN',
        ANSWERS: 'ANSWERS',
    }

class QuestionEditorForm extends React.Component {

    static propTypes = {
        question: PropTypes.object,
        onSave: PropTypes.func,
        onClose: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            currentTab: TABS.MAIN,
        }
    }

    componentWillMount() {
        this._init()
    }

    _init() {
        const {question} = this.props

        if (question && question.Answers) {
            question.Answers.forEach((item) => {
                item.id = item.Id
            })
        }

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
        if (this.props.question !== prevProps.question) {
            this._init()
        }
    }

    render() {
        const {hasChanges} = this.props;

        return <div className="editor question_editor">
            <div className='editor__head'>
                <div className="tabs tabs-1" key='tab1'>
                    <div className="tab-links">
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.MAIN ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.MAIN) }}>Основные
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.ANSWERS ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.ANSWERS) }}>Ответы
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <MainTab visible={this.state.currentTab === TABS.MAIN} editMode={this.props.editMode}/>
                        <AnswersTab visible={this.state.currentTab === TABS.ANSWERS} editMode={this.props.editMode}/>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel}/>
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
        let {editorValues, question} = this.props

        if (this.props.onSave) {
            this.props.onSave({...editorValues, id: question.id, Id: question.Id, Number: question.Number})
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

    if (!values.Text) {
        errors.Text = 'Значение не может быть пустым'
    }

    if (!values.AnswTime) {
        errors.AnswTime = 'Значение не может быть пустым'
    } else {
        if (!$.isNumeric(values.AnswTime)) {
            errors.AnswTime = 'Значение должно быть числовым'
        }
    }

    if (!values.Score) {
        errors.Score = 'Значение не может быть пустым'
    } else {
        if (!$.isNumeric(values.Score)) {
            errors.Score = 'Значение должно быть числовым'
        }
    }

    if ((+values.AnswType === 1) && values.AnswInt && !$.isNumeric(values.AnswInt)) {
        errors.AnswInt = 'Значение должно быть числовым'
    }

    if ((+values.AnswType === 3) || (+values.AnswType === 4)) {
        if (!_hasCorrectAnswer(values.Answers)) {
            errors.Answers = 'Необходимо указать правильный ответ'
        }
    }

    if ((+values.AnswType === 3) && _hasMultipeCorrectAnswers(values.Answers)) {
        errors.Answers = 'Необходимо указать только один правильный ответ'
    }

    if ((+values.AnswType === 5) && !values.AnswText) {
        errors.AnswText = 'Значение не может быть пустым'
    }

    return errors
}

function _hasCorrectAnswer(answers) {
    return answers.some((item) => {
        return item.IsCorrect
    })
}

function _hasMultipeCorrectAnswers(answers) {
    let _count = 0

    answers.forEach((item) => {
        if (item.IsCorrect) {
            _count++
        }
    })

    return _count > 1
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