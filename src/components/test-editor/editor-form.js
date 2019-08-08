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
import {testSelector} from "adm-ducks/single-test";
import PropTypes from "prop-types";
import {EDIT_MODE_EDIT, EDIT_MODE_INSERT} from "../../constants/Common";

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
        const {hasChanges, saving} = this.props;

        return <React.Fragment>
            <SavingBlock visible={saving}/>
            {/*<Prompt when={hasChanges}*/}
            {/*        message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>*/}
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
        </React.Fragment>
    }

    _init() {
        let {test,} = this.props,
            _test = test ? test : {}

        if (_test) {
            this.props.initialize({
                testTypeId: test.TestTypeId,
                courseId: test.CourseId,
                lessonId: test.LessonId,
                name: test.Name,
                method: test.Method,
                maxQ: test.MaxQ,
                fromLesson: test.FromLesson,
                isTimeLimited: test.IsTimeLimited,
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
        const {courseId, lessonId, sublessonId} = this.props,
            _isSublesson = !!sublessonId

        if (_isSublesson) {
            history.push(`/adm/courses/edit/${courseId}/lessons/edit/${lessonId}/sub-lessons/edit/${sublessonId}`);
        } else {
            history.push(`/adm/courses/edit/${courseId}/lessons/edit/${lessonId}`);
        }
    }

    _cancel() {
        this.props.resetReduxForm(EDITOR_NAME)
        // this.props.cancelChanges()
    }

    _save() {
        let {editorValues, editorValid, episode, lesson} = this.props;

        if (!editorValid) {
            return
        }

        let _obj = {
            Id: test.Id,
            TestTypeId: test.TestTypeId,
            CourseId: test.CourseId,
            LessonId: test.LessonId,
            Name: test.Name,
            Method: test.Method,
            MaxQ: test.MaxQ,
            FromLesson: test.FromLesson,
            IsTimeLimited: test.IsTimeLimited,
        };

        this._fillToc(_obj.Toc);
        this._fillContent(_obj.Content);

        this.props.save(_obj, this.props.editMode ? EDIT_MODE_EDIT : EDIT_MODE_INSERT);
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

    if (!values.episodeType) {
        errors.episodeType = 'Значение не может быть пустым'
    }

    if (!values.URL) {
        errors.URL = 'Значение не может быть пустым'
    }

    if (!values.authorId) {
        errors.authorId = 'Значение не может быть пустым'
    }

    if (values.fixed && !values.fixDescription) {
        errors.fixDescription = 'Значение не может быть пустым'
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

        hasChanges: state.singleEpisode.hasChanges ||
            state.episodeToc.hasChanges ||
            state.episodeContent.hasChanges ||
            isDirty(EDITOR_NAME)(state),

        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),


        lesson: state.singleLesson.current,
        saving: state.singleEpisode.saving,

        content: state.episodeContent.current,
        episodeToc: state.episodeToc.current,

        activeTabs: activeTabsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({resetReduxForm: reset, setActiveTab,}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TestEditorWrapper)