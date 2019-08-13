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
        onCancel: PropTypes.func,
        onClose: PropTypes.func,
    };

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
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this._close}/>
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