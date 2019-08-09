import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {getFormValues, isDirty, isValid, reduxForm, reset} from "redux-form";
import SavingBlock from "../common/saving-page";
import {Prompt} from "react-router-dom";
import BottomControls from "../bottom-contols/buttons";
import MainTab from "./tabs/main-tab";
import QuestionsTab from "./tabs/questions-tab";

import {activeTabsSelector, setActiveTab} from "adm-ducks/app";
import {testSelector, questionsSelector, showQuestionEditorSelector, savingSelector, insertTest, updateTest, backToCourse,} from "adm-ducks/single-test";
import PropTypes from "prop-types";
import ErrorDialog from "../dialog/error-dialog";
import QuestionEditor from "../question-editor/editor";

const EDITOR_NAME = "TestEditor"

const TABS = {
    MAIN: 'MAIN',
    QUESTIONS: 'QUESTIONS',
}

class TestEditorForm extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        courseId: PropTypes.number,
    }

    constructor(props) {
        super(props)

        this.state = {
            currentTab: TABS.MAIN,
        }
    }

    componentWillMount() {

    }

    componentDidMount() {
        let _activeTab = this.props.activeTabs.get(EDITOR_NAME)
        if (_activeTab) {
            this.setState({
                currentTab: _activeTab,
            })
        }

        this._init()
    }

    componentWillUnmount() {
        this.props.setActiveTab({page: EDITOR_NAME, value: this.state.currentTab})
    }


    render() {
        const {hasChanges, saving, showQuestionEditor} = this.props;

        return <React.Fragment>
            <SavingBlock visible={saving}/>
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
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.QUESTIONS ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.QUESTIONS) }}>Вопросы
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <MainTab visible={this.state.currentTab === TABS.MAIN} editMode={this.props.editMode}/>
                        <QuestionsTab visible={this.state.currentTab === TABS.QUESTIONS} editMode={this.props.editMode}/>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this._goBack}/>
            </div>
            { !showQuestionEditor ? <ErrorDialog/> : null }
            <QuestionEditor/>
            {/*<QuestionEditor onPrevClick={this._isFirstSelected ? null : ::this._onEditPrev}*/}
            {/*             onNextClick={this._isLastSelected ? null : ::this._onEditNext}/>*/}
        </React.Fragment>
    }

    _init() {
        let {test, questions} = this.props,
            _test = test ? test : {}

        if (_test) {
            this.props.initialize({
                testTypeId: test.TestTypeId,
                courseId: test.CourseId,
                lessonId: test.LessonId,
                name: test.Name,
                method: test.Method,
                maxQ: test.MaxQ,
                fromLesson: !!test.FromLesson,
                isTimeLimited: !!test.IsTimeLimited,
                questions: questions
            })
        }
    }

    _switchTo(tabName) {
        if (this.state.currentTab !== tabName) {
            this.setState({
                currentTab: tabName
            })
        }
    }

    _enableApplyChanges() {
        return this.props.editorValid
    }

    _goBack() {
        this.props.backToCourse(this.props.course.Id)
    }

    _cancel() {
        this.props.resetReduxForm(EDITOR_NAME)
    }

    _save() {
        let {editorValues, editorValid, test} = this.props;

        if (!editorValid) {
            return
        }

        let _obj = {
            Id: test.Id ? test.Id : -1,
            TestTypeId: +editorValues.testTypeId,
            CourseId: editorValues.courseId ? +editorValues.courseId : null,
            LessonId: editorValues.lessonId ? +editorValues.lessonId : null,
            Name: editorValues.name,
            Method: editorValues.method,
            MaxQ: +editorValues.maxQ,
            FromLesson: !!+editorValues.fromLesson,
            IsTimeLimited: !!+editorValues.isTimeLimited,
        };

        // this._fillToc(_obj.Toc);
        // this._fillContent(_obj.Content);
        if (this.props.editMode) {
            this.props.updateTest(_obj);
        } else {
            this.props.insertTest(_obj);
        }


    }

    _fillToc(array) {
        this.props.editorValues.toc.map((item) => {
            array.push({
                Id: item.Id,
                Number: item.Number,
                StartTime: item.StartTime,
                Topic: item.Topic,
            })
        });
    }

    _fillContent(array) {
        this.props.editorValues.content.map((item) => {
            array.push({
                Id: item.Id,
                Content: item.Content,
                StartTime: item.StartTime,
                Duration: item.Duration,
                Topic: item.Topic,
                ResourceId: item.ResourceId,
            })
        });
    }
}


const validate = (values) => {
    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.method) {
        errors.method = 'Значение не может быть пустым'
    }

    if (!values.testTypeId) {
        errors.testTypeId = 'Значение не может быть пустым'
    }

    if (values.maxQ && !$.isNumeric(values.maxQ)) {
        errors.maxQ = 'Значение должно быть числовым'
    }

    return errors
}

let TestEditorWrapper = reduxForm({
    form: EDITOR_NAME,
    validate,
})(TestEditorForm);

function mapStateToProps(state) {
    return {
        test: testSelector(state),
        course: state.singleCourse.current,
        questions: questionsSelector(state),
        showQuestionEditor: showQuestionEditorSelector(state),

        hasChanges: isDirty(EDITOR_NAME)(state),

        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),

        activeTabs: activeTabsSelector(state),
        saving: savingSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({resetReduxForm: reset, setActiveTab, insertTest, updateTest, backToCourse}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TestEditorWrapper)