import React from 'react';

import {get as getCourse,} from "../../actions/course/courseActions";
import {getTest, createTest, loadingSelector} from "adm-ducks/single-test";

import LoadingPage from "../../components/common/loading-page";
import ErrorDialog from '../../components/dialog/error-dialog'
import EditorForm from '../../components/test-editor/editor-form'

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

const NEW_TEST = {
    Id: null,
    TestTypeId: null,
    CourseId: null,
    LessonId: null,
    Name: null,
    Method: 1,
    MaxQ: 0,
    FromLesson: false,
    IsTimeLimited: false,
}

export class TestEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editMode: this.props.testId > 0,
            loading: true,
        }
    }

    componentDidMount() {
        const {testId} = this.props;

        this._loadCourseInfo()
            .then(() => {
                if (this.state.editMode) {
                    this.props.getTest(testId)
                } else {
                    this.props.createTest(this._getNewTest())
                }

                this.setState({loading : false})
            })
    }

    componentDidUpdate(prevProps, prevState) {
        let _needReload = (prevProps.testId !== this.props.testId) && !isNaN(this.props.testId)
        if (_needReload) {
            this.props.getTest(this.props.testId)

            if (!prevState.editMode) {
                this.setState({editMode: true})
            }
        }
    }

    render() {
        let {fetching,} = this.props

        return fetching || this.state.loading ?
            <LoadingPage/>
            :
            <div className="editor test_editor">
                <EditorForm editMode={this.state.editMode}/>
                <ErrorDialog/>
            </div>
    }

    _getNewTest() {
        let _test = Object.assign({}, NEW_TEST)

        if (this.props.course) {
            _test.CourseId = this.props.course.id
        }

        return _test
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
        testId: Number(ownProps.match.params.testId),
        courseId: Number(ownProps.match.params.courseId),
        course: state.singleCourse.current,

        fetching: state.singleCourse.fetching ||
            loadingSelector(state),

        ownProps: ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getCourse, getTest, createTest}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TestEditor);