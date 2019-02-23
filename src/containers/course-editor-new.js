import React from 'react'

import LoadingPage from '../components/common/loading-page'
import BottomControls from '../components/bottom-contols'
import ErrorDialog from '../components/dialog/error-dialog'
import CourseFormWrapper from '../components/course-editor/form-wrapper'
import CourseAuthorDialog from '../components/course-editor/dialogs/author-dialog'

import * as singleCourseActions from "../actions/course/courseActions";

import * as appActions from '../actions/app-actions';
import * as authorsActions from "../actions/authorsListActions";
import * as categoriesActions from "../actions/categoriesListActions";
import * as languagesActions from "../actions/languages-actions";

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import FixControl from '../components/course-editor/fix-course-wrapper';

import {checkExtLinks, getExtLinks} from "../tools/link-tools";
import {
    disableButtons,
    enableButtons,
} from "adm-ducks/app";
import {
    getParameters,
    setFixedCourse,
} from "adm-ducks/params";
import {getFormValues, isValid, isDirty, reset, focus} from 'redux-form'
import {Prompt} from "react-router-dom";
import CourseCategoryDialog from "../components/course-editor/dialogs/category-dialog";
import DetailsWrapper from "../components/course-editor/details";

class CourseEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editMode: this.props.courseId > 0
        }
    }

    componentDidMount() {
        this.props.authorsActions.getAuthors();
        this.props.categoriesActions.getCategories();
        this.props.languagesActions.getLanguages();
        this.props.getParameters()

        if (this.state.editMode) {
            this.props.courseActions.get(this.props.courseId)
        } else {
            this.props.courseActions.create()
        }
    }

    render() {
        const {fetching, hasChanges, courseId} = this.props;

        // if (fetching) {
        //     this._dataLoaded = false;
        //     this._validateResult = {};
        // }

        return (
            fetching ?
                <LoadingPage/>
                :
                <div className="editor course_editor">
                    <Prompt when={hasChanges}
                            message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
                    <div className='editor__head'>
                        <button className={"adm__button "} onClick={::this._goBack}>{"<<< Назад"}</button>
                    </div>
                    <div className="editor__main-area">
                        <div className="main-area__container">
                            <CourseFormWrapper/>
                            <DetailsWrapper editMode={this.state.editMode} courseId={courseId}/>
                            <ErrorDialog/>
                            <CourseAuthorDialog/>
                            <CourseCategoryDialog/>
                        </div>
                    </div>
                    <div className="editor__footer">
                        < BottomControls editor={this} onAccept={::this._save} onCancel={::this._cancel}/>
                    </div>
                </div>
        )
    }

    _goBack() {
        this.props.history.push('/adm/courses');
    }


    _save(value) {
        this.props.focusReduxForm('FixingBlock', 'description')

        if (!this.props.fixFormValid) {
            return
        }
        this.props.setFixedCourse({courseId: value.id, ...this.props.fixFormValues})

        let _checkResult = checkExtLinks(value.extLinksValues)

        if (_checkResult && _checkResult.length) {
            let _message = 'Недопустимые ссылки:\n' + _checkResult.join('\n')
            this.props.appActions.showErrorDialog(_message)
            return
        }

        this.props.courseActions.setExtLinks(getExtLinks(value.extLinksValues))

        let _obj = {
            id: value.id,
            Id: value.id,
            Name: value.Name,
            State: value.State,
            Cover: value.Cover,
            CoverMeta: JSON.stringify(this.coverMeta),
            LanguageId: value.LanguageId,
            URL: value.URL,
            Description: value.Description,
            Mask: value.Mask,
            Authors: [],
            Categories: [],
            Lessons: [],
            ExtLinks: getExtLinks(value.extLinksValues),
            OneLesson: !!value.OneLesson,
        };

        _obj.Authors.push(...this.props.courseAuthors);
        _obj.Categories.push(...this.props.courseCategories);
        this._fillLessons(_obj.Lessons);

        super._save(_obj);
    }

    _cancel() {
        super._cancel()

        this.props.resetReduxForm('FixingBlock')
    }

    get coverMeta() {
        return this._coverMeta;
    }

    set coverMeta(value) {
        if ((!!value) && (typeof (value) === 'string')) {
            this._coverMeta = JSON.parse(value)
        } else {
            this._coverMeta = value
        }
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

    _canFixCourse() {
        let _data = this.getObject()

        return ((_data && !_data.OneLesson) || (window.$$('one-lesson-checkbox') && !window.$$('one-lesson-checkbox').getValue()))
    }


    _enableApplyChanges() {
        let _enable = super._enableApplyChanges();

        return _enable && (this.props.courseAuthors.length > 0) && (this.props.courseCategories.length > 0)
    }

    handleChangeDataOnWebixForm() {
        if (!window.$$('one-lesson-checkbox')) return

        if (this.props.courseLessons.length <= 1) {
            window.$$('one-lesson-checkbox').enable()
        } else {
            window.$$('one-lesson-checkbox').disable()
        }

    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseId: ownProps.match ? Number(ownProps.match.params.id) : null,

        course: state.singleCourse.current,

        authors: state.authorsList.authors,
        categories: state.categoriesList.categories,

        courseAuthors: state.courseAuthors.current,
        courseCategories: state.courseCategories.current,
        courseLessons: state.courseLessons.current,

        // languages: state.languages.languages,
        // fixFormHasChanges: isDirty('FixingBlock')(state),
        hasChanges: state.singleCourse.hasChanges ||
            state.courseAuthors.hasChanges ||
            state.courseCategories.hasChanges ||
            state.courseLessons.hasChanges || isDirty('FixingBlock')(state),

        fetching: state.authorsList.fetching || state.categoriesList.fetching || state.languages.fetching || state.singleCourse.fetching,
        fixFormValues: getFormValues('FixingBlock')(state),
        fixFormValid: isValid('FixingBlock')(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        courseActions: bindActionCreators(singleCourseActions, dispatch),
        authorsActions: bindActionCreators(authorsActions, dispatch),
        categoriesActions: bindActionCreators(categoriesActions, dispatch),
        languagesActions: bindActionCreators(languagesActions, dispatch),


        disableButtons: bindActionCreators(disableButtons, dispatch),
        enableButtons: bindActionCreators(enableButtons, dispatch),
        getParameters: bindActionCreators(getParameters, dispatch),
        setFixedCourse: bindActionCreators(setFixedCourse, dispatch),
        resetReduxForm: bindActionCreators(reset, dispatch),
        focusReduxForm: bindActionCreators(focus, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseEditor);