import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import LoadingPage from '../components/common/loading-page'
import BottomControls from '../components/bottom-contols/buttons'
import ErrorDialog from '../components/dialog/error-dialog'
import CourseCategoryDialog from "../components/course-editor/dialogs/category-dialog";
import CourseFormWrapper from '../components/course-editor/form-wrapper'
import CourseAuthorDialog from '../components/course-editor/dialogs/author-dialog'
import AuthorsTab from '../components/course-editor/tabs/authors-and-categories'
import LessonsTab from '../components/course-editor/tabs/lessons'

import * as singleCourseActions from "../actions/course/courseActions";
import {showErrorDialog} from '../actions/app-actions';
import {getAuthors} from "../actions/authorsListActions";
import {getCategories} from "../actions/categoriesListActions";
import {getLanguages} from "../actions/languages-actions";
import {checkExtLinks, getExtLinks} from "../tools/link-tools";
import {getParameters, setFixedCourse,} from "adm-ducks/params";
import {getFormValues, isValid, isDirty, reset, setSubmitSucceeded, untouch} from 'redux-form'
import {Prompt} from "react-router-dom";

import {EDIT_MODE_EDIT, EDIT_MODE_INSERT} from '../constants/Common'

const TABS = {
    MAIN: 'main',
    AUTHORS: 'authors',
    LESSONS: 'lessons'
}

class CourseEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editMode: this.props.courseId > 0,
            currentTab: TABS.MAIN,
        }
    }

    componentDidMount() {
        this.props.getAuthors();
        this.props.getCategories();
        this.props.getLanguages();
        this.props.getParameters()

        if (this.state.editMode) {
            this.props.courseActions.get(this.props.courseId)
        } else {
            this.props.courseActions.create()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let _needRefreshAfterSave = prevProps.savingCourse && !this.props.savingCourse && !this.props.courseError,
            _needSwitchToEditMode = !prevState.editMode && _needRefreshAfterSave

        if (_needSwitchToEditMode) {
            let _newRout = `/adm/courses/edit/${this.props.course.id}`;
            this.props.history.push(_newRout);
            this.setState({editMode: true})
        }

        if (_needRefreshAfterSave) {
            this.props.courseActions.get(this.props.course.id)
        }
    }

    render() {
        const {fetching, hasChanges, courseId} = this.props;

        return (
            fetching ?
                <LoadingPage/>
                :
                <div className="editor course_editor">
                    <Prompt when={hasChanges}
                            message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
                    <div className='editor__head'>
                        <div className="tabs tabs-1" key='tab1'>
                            <div className="tab-links">
                                <div
                                    className={"tabs-1 tab-link" + (this.state.currentTab === TABS.MAIN ? ' tab-link-active' : '')}
                                    onClick={::this._switchToMainTab}>Основные
                                </div>
                                <div
                                    className={"tabs-1 tab-link" + (this.state.currentTab === TABS.AUTHORS ? ' tab-link-active' : '')}
                                    onClick={::this._switchToAuthorsTab}>Авторы и категории
                                </div>
                                <div
                                    className={"tabs-1 tab-link" + (this.state.currentTab === TABS.LESSONS ? ' tab-link-active' : '')}
                                    onClick={::this._switchToLessonsTab}>Лекции
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="editor__main-area">
                        <div className="main-area__container">
                            <CourseFormWrapper visible={this.state.currentTab === TABS.MAIN}
                                               editMode={this.state.editMode}/>
                            <AuthorsTab editMode={this.state.editMode}
                                        visible={this.state.currentTab === TABS.AUTHORS}/>
                            <LessonsTab editMode={this.state.editMode} courseId={courseId}
                                        visible={this.state.currentTab === TABS.LESSONS}/>
                        </div>

                        <ErrorDialog/>
                        <CourseAuthorDialog/>
                        <CourseCategoryDialog/>
                    </div>
                    <div className="editor__footer">
                        <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                        onAccept={::this._save} onCancel={::this._cancel} onBack={::this._goBack}/>
                    </div>
                </div>
        )
    }

    _switchToMainTab() {
        this.setState({
            currentTab: TABS.MAIN
        })
    }

    _switchToAuthorsTab() {
        this.setState({
            currentTab: TABS.AUTHORS
        })
    }

    _switchToLessonsTab() {
        this.setState({
            currentTab: TABS.LESSONS
        })
    }

    _goBack() {
        this.props.history.push('/adm/courses');
    }


    _save() {
        let {editorValues, editorValid, courseId} = this.props;

        if (!editorValid) {
            return
        }

        this.props.setFixedCourse({
            courseId: courseId,
            description: editorValues.fixDescription,
            active: editorValues.fixed
        })

        let _checkResult = checkExtLinks(editorValues.extLinksValues)

        if (_checkResult && _checkResult.length) {
            let _message = 'Недопустимые ссылки:\n' + _checkResult.join('\n')
            this.props.showErrorDialog(_message)
            return
        }

        this.props.courseActions.setExtLinks(getExtLinks(editorValues.extLinksValues))

        let _obj = {
            id: courseId,
            Id: courseId,
            Name: editorValues.name,
            State: editorValues.state,
            Cover: editorValues.cover.file,
            CoverMeta: editorValues.cover.meta,
            LanguageId: editorValues.languageId,
            URL: editorValues.URL,
            Description: editorValues.description,
            Mask: editorValues.cover.mask,
            Authors: [],
            Categories: [],
            Lessons: [],
            ExtLinks: getExtLinks(editorValues.extLinksValues),
            OneLesson: !!editorValues.oneLesson,
        };

        _obj.Authors.push(...this.props.courseAuthors);
        _obj.Categories.push(...this.props.courseCategories);
        this._fillLessons(_obj.Lessons);

        this.props.courseActions.save(_obj, this.state.editMode ? EDIT_MODE_EDIT : EDIT_MODE_INSERT);
    }

    _cancel() {
        this.props.courseActions.cancelChanges()
        this.props.resetReduxForm('CourseEditor')
    }

    _fillLessons(array) {
        this.props.courseLessons.map((lesson) => {
            array.push({
                LessonId: lesson.Id,
                State: lesson.State,
                ReadyDate: new Date(lesson.ReadyDate),
            })
        })
    }

    _checkLessonsState(newState) {
        if (!newState) {
            return false
        }

        if (newState === 'P') {
            return this.props.courseLessons.some((lesson) => {
                return lesson.State === 'R'
            })
        } else {
            return true
        }
    }

    _enableApplyChanges() {
        return this.props.editorValid && (this.props.courseAuthors.length > 0) && (this.props.courseCategories.length > 0)
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseId: ownProps.match ? Number(ownProps.match.params.id) : null,

        course: state.singleCourse.current,
        savingCourse: state.singleCourse.saving,
        courseError: state.singleCourse.error,
        authors: state.authorsList.authors,
        categories: state.categoriesList.categories,

        courseAuthors: state.courseAuthors.current,
        courseCategories: state.courseCategories.current,
        courseLessons: state.courseLessons.current,

        hasChanges: state.singleCourse.hasChanges ||
            state.courseAuthors.hasChanges ||
            state.courseCategories.hasChanges ||
            state.courseLessons.hasChanges || isDirty('CourseEditor')(state),

        fetching: state.authorsList.fetching || state.categoriesList.fetching || state.languages.fetching || state.singleCourse.fetching,
        editorValues: getFormValues('CourseEditor')(state),
        editorValid: isValid('CourseEditor')(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showErrorDialog: bindActionCreators(showErrorDialog, dispatch),
        courseActions: bindActionCreators(singleCourseActions, dispatch),
        getAuthors: bindActionCreators(getAuthors, dispatch),
        getCategories: bindActionCreators(getCategories, dispatch),
        getLanguages: bindActionCreators(getLanguages, dispatch),

        getParameters: bindActionCreators(getParameters, dispatch),
        setFixedCourse: bindActionCreators(setFixedCourse, dispatch),
        resetReduxForm: bindActionCreators(reset, dispatch),
        setSubmitSucceeded: bindActionCreators(setSubmitSucceeded, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseEditor);