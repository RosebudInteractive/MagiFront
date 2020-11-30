import React from 'react';

import {get as getCourse, getCourseAuthors} from "../../actions/course/courseActions";
import {create as createLesson, get as getLesson} from "../../actions/lesson/lesson-actions";
import {getParameters, parametersFetchingSelector,} from "adm-ducks/params";

import LoadingPage from "../../components/common/loading-page";
import ErrorDialog from '../../components/dialog/error-dialog'
import EditorForm from '../../components/lesson-editor/editor-form'

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import "../../components/lesson-editor/lesson-editor.sass"

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
        const {courseId, lessonId} = this.props;

        this._loadCourseInfo()
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
    }

    componentDidUpdate(prevProps, prevState) {
        let _needRefreshAfterSave = prevProps.savingLesson && !this.props.savingLesson && !this.props.lessonError,
            _needSwitchToEditMode = !prevState.editMode && _needRefreshAfterSave

        if (_needSwitchToEditMode) {
            let _newRout = `/adm/courses/edit/${this.props.courseId}/lessons/edit/${this.props.lesson.id}`;
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
                <EditorForm editMode={this.state.editMode}/>
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
        lessonId: Number(ownProps.match.params.id),
        courseId: Number(ownProps.match.params.courseId),
        course: state.singleCourse.current,
        lesson: state.singleLesson.current,

        savingLesson: state.singleLesson.saving,
        lessonError: state.singleLesson.error,

        fetching: state.courseAuthors.fetching ||
            state.singleLesson.fetching ||
            state.singleCourse.fetching ||
            parametersFetchingSelector(state),

        ownProps: ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getCourse, getCourseAuthors, createLesson, getLesson, getParameters,}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonEditor);