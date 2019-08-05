import React from 'react';

import {get as getCourse, getCourseAuthors} from "../../actions/course/courseActions";
import {create as createLesson, get as getLesson} from "../../actions/lesson/lesson-actions";
import {loadParentLessonInfo} from "../../actions/lesson/parent-lesson-actions";
import {getParameters, parametersFetchingSelector,} from "adm-ducks/params";

import LoadingPage from "../../components/common/loading-page";
import ErrorDialog from '../../components/dialog/error-dialog'
import EditorForm from '../../components/lesson-editor/editor-form'

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

const NEW_LESSON = {
    Name: '',
    Description: null,
    CourseId: null,
    Cover: null,
    CoverMeta: null,
    extLinksValues: null,
    AuthorId: null,
    State: 'D',
    IsAuthRequired: true,
}

export class LessonEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editMode: this.props.lessonId > 0,
            loading: true,
        }
    }

    componentDidMount() {
        const {courseId, parentLessonId, lessonId} = this.props;

        this._loadCourseInfo()
            .then(() => { return this.props.loadParentLessonInfo(parentLessonId, courseId)})
            .then(() => {
                if (this.state.editMode) {
                    this.props.getLesson(lessonId, courseId)
                } else {
                    this.props.createLesson(this._getNewLesson())
                }

                this.setState({loading : false})
            })

        this.props.getCourseAuthors(courseId)
        this.props.getParameters()
        this.props.loadParentLessonInfo(parentLessonId, courseId)
    }

    componentDidUpdate(prevProps, prevState) {
        let _needRefreshAfterSave = prevProps.savingLesson && !this.props.savingLesson && !this.props.lessonError,
            _needSwitchToEditMode = !prevState.editMode && _needRefreshAfterSave

        if (_needSwitchToEditMode) {
            let _newRout = `/adm/courses/edit/${this.props.courseId}/lessons/edit/${this.props.parentLesson.id}/sub-lessons/edit/${this.props.lesson.id}`;
            this.props.history.push(_newRout);
            this.setState({editMode: true})
        }

        if (_needRefreshAfterSave) {
            this.props.getLesson(this.props.lesson.id, this.props.courseId)
        }
    }

    render() {
        let {fetching,} = this.props

        return fetching || this.state.loading ?
            <LoadingPage/>
            :
            <div className="editor lesson_editor">
                 <EditorForm editMode={this.state.editMode} isSublesson={true}/>
                 <ErrorDialog/>
             </div>
    }

    _getNewLesson() {
        let _lesson = Object.assign({}, NEW_LESSON)


        if (this.props.course) {
            _lesson.CourseId = this.props.course.id
            _lesson.CourseName = this.props.course.Name
            _lesson.Number = this.props.course.Lessons ? (this.props.course.Lessons.length + 1) : 1
            _lesson.LessonType = 'L'
            _lesson.CurrParentName = this.props.parentLesson.name
            _lesson.CurrParentId = this.props.parentLesson.id

            if (this.props.course.IsPaid) {
                _lesson.IsFreeInPaidCourse = true
            }
        }

        return _lesson
    }

    _loadCourseInfo() {
        const {courseId, course,} = this.props;

        let _needLoadCourse = (!course) || (course.id !== courseId)

        if (_needLoadCourse) {
            return this.props.getCourse(courseId);
        } else {
            return Promise.resolve()
        }
    }
}

function mapStateToProps(state, ownProps) {
    return {
        parentLessonId: Number(ownProps.match.params.id),
        courseId: Number(ownProps.match.params.courseId),
        lessonId: Number(ownProps.match.params.subLessonId),
        course: state.singleCourse.current,
        lesson: state.singleLesson.current,
        parentLesson: state.parentLesson,

        savingLesson: state.singleLesson.saving,
        lessonError: state.singleLesson.error,

        fetching: state.courseAuthors.fetching ||
            state.singleLesson.fetching ||
            state.singleCourse.fetching ||
            state.parentLesson.loading ||
            parametersFetchingSelector(state),

        ownProps: ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getCourse, getCourseAuthors, createLesson, getLesson, getParameters, loadParentLessonInfo,}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonEditor);