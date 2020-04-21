import React from "react"
import PropTypes from 'prop-types'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {lessonsSelector} from "ducks/lesson-menu";
import {TEST_TYPE} from "../../../constants/common-consts";
import TestButton from "./button";
import "./test-buttons.sass"

class TestButtons extends React.Component {
    static propTypes = {
        lessonId: PropTypes.number,
    }

    render() {
        let _tests = this._getTests()

        return _tests && (_tests.length > 0) &&
            <div className="test-buttons-block">
                <TestButton test={this._getStartedTest(_tests)}/>
                <TestButton test={this._getFinishedTest(_tests)}/>
            </div>
    }

    _getTests() {
        const {lessonList, lessonId} = this.props

        let _lessons = []
        lessonList.forEach((lesson) => {
            _lessons.push(lesson)
            if (lesson.Lessons && (lesson.Lessons.length > 0)) {
                lesson.Lessons.forEach((sublesson) => {_lessons.push(sublesson)})
            }
        })

        let _lesson = _lessons.find((lesson) => {
            return lesson.Id === lessonId
        })

        return _lesson.Tests
    }

    _getStartedTest(tests) {
        return tests && (tests.length > 0) && tests.find(item => item.TestTypeId === TEST_TYPE.STARTED)
    }

    _getFinishedTest(tests) {
        return tests && (tests.length > 0) && tests.find(item => item.TestTypeId === TEST_TYPE.FINISHED)
    }

}

const mapStateToProps = (state) => {
    return {
        lessonList: lessonsSelector(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TestButtons);