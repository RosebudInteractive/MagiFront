import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import MainTab from './tabs/main-tab'
import SocialNetworkTab from './tabs/social-network-tab'
import EpisodesTab from './tabs/episodes-tab'
import ReferencesTab from './tabs/references-tab'
import ResourcesTab from './tabs/resources-tab'
import BottomControls from "../bottom-contols/buttons";
import {
    reduxForm,
    reset,
    isDirty,
    getFormValues,
    isValid
} from 'redux-form'
import {Prompt} from "react-router-dom";
import {showErrorDialog} from "../../actions/app-actions";
import history from '../../history'

const TABS = {
    MAIN: 'main',
    SOCIAL_NETWORKS: 'social_networks',
    EPISODES_AND_SUBS: 'episodes_and_subs',
    REFERENCES: 'references',
    RESOURCES: 'resources',
}

const NEW_LESSON = {
    Name: '',
    Description: null,
    CourseId: null,
    Cover: null,
    CoverMeta: null,
    extLinksValues: null,
    AuthorId: null,
}

class LessonEditorForm extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            currentTab: TABS.MAIN,
        }
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        let {editMode, lesson,} = this.props,
            _lesson = editMode ? lesson : this._getNewLesson()

        if (_lesson) {
            this.props.initialize({
                courseId: _lesson.CourseId,
                courseName: _lesson.CourseName,
                name: _lesson.Name,
                number: _lesson.Number,
                lessonType: _lesson.LessonType,
                URL: _lesson.URL,
                authorId: _lesson.AuthorId,
                cover: {
                    file: _lesson.Cover,
                    meta: _lesson.CoverMeta,
                },
                state: _lesson.State,
                description: _lesson.Description,
                extLinksValues: _lesson.extLinksValues,
                snName: _lesson.SnName,
                snDescription: _lesson.SnDescription,
                snPost: _lesson.SnPost,
            });
        }
    }

    _getNewLesson() {
        let _lesson = Object.assign({}, NEW_LESSON)

        if (this.props.course) {
            _lesson.CourseId = this.props.course.id
            _lesson.CourseName = this.props.course.Name
            _lesson.Number = this.props.course.Lessons ? (this.props.course.Lessons.length + 1) : 1
            _lesson.LessonType = 'L'
        }

        return _lesson
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
                            onClick={() => {this._switchTo(TABS.MAIN)}}>Основные
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.SOCIAL_NETWORKS ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.SOCIAL_NETWORKS)}}>Социальные сети
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.EPISODES_AND_SUBS ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.EPISODES_AND_SUBS)}}>Эпизоды и доп.лекции
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.REFERENCES ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.REFERENCES)}}>Литература
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.RESOURCES ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.RESOURCES)}}>Ресурсы
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <MainTab visible={this.state.currentTab === TABS.MAIN} editMode={this.props.editMode}/>
                        <SocialNetworkTab visible={this.state.currentTab === TABS.SOCIAL_NETWORKS} editMode={this.props.editMode}/>
                        <EpisodesTab visible={this.state.currentTab === TABS.EPISODES_AND_SUBS} editMode={this.props.editMode}/>
                        <ReferencesTab visible={this.state.currentTab === TABS.REFERENCES} editMode={this.props.editMode}/>
                        <ResourcesTab visible={this.state.currentTab === TABS.RESOURCES} editMode={this.props.editMode}/>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this._goBack}/>
            </div>
        </div>
    }

    //<ReferencesTab visible={this.state.currentTab === TABS.RESOURCES} editMode={this.state.editMode}/>

    _switchTo(tabName) {
        if (this.state.currentTab !== tabName) {
            this.setState({
                currentTab: tabName
            })
        }
    }

    _goBack() {
        history.push(`/adm/courses/edit/${this.props.course.id}`);
    }

    _cancel() {
        this.props.resetReduxForm('LessonEditor')
    }

    _save() {

    }

    _enableApplyChanges() {
        return true
    }

}

const validate = (values) => {

    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.lessonType) {
        errors.lessonType = 'Значение не может быть пустым'
    }

    if (!values.URL) {
        errors.URL = 'Значение не может быть пустым'
    }

    if (!values.authorId) {
        errors.authorId = 'Значение не может быть пустым'
    }
    //
    // if (!values.cover || !values.cover.file) {
    //     errors.cover = 'Значение не может быть пустым'
    // }

    return errors
}

let LessonEditorWrapper = reduxForm({
    form: 'LessonEditor',
    validate,
})(LessonEditorForm);

function mapStateToProps(state) {
    return {
        hasChanges: isDirty('LessonEditor')(state),
        editorValues: getFormValues('LessonEditor')(state),
        editorValid: isValid('LessonEditor')(state),

        course: state.singleCourse.current,
        lesson: state.singleLesson.current,

        // books: booksSelector(state),
        // bookId: bookIdSelector(state),
        // editMode: editModeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({resetReduxForm: reset, showErrorDialog}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonEditorWrapper)