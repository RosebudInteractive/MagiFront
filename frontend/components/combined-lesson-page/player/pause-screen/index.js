import React from "react"
import PropTypes from 'prop-types'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {lessonsSelector} from "ducks/lesson-menu";
import "./pause-screen.sass"
import TestButtons from "../../test-buttons";

const TIMEOUT = 2000

class PauseScreen extends React.Component {
    static propTypes = {
        lesson: PropTypes.object,
        finished: PropTypes.bool,
        paused: PropTypes.bool
    }

    constructor(props) {
        super(props)

        this.state = {
            fade: false
        }

        this._timer = null
    }

    componentDidMount() {
        $(".js-pause-screen").on('mousemove', () => {
            if (this.state.fade) { this.setState({fade : false}) }
            this._startTimer()
        });
    }

    componentDidUpdate(prevProps) {
        const _prevVisible = prevProps.finished || prevProps.paused,
            _currentVisible = this.props.finished || this.props.paused

        if (!_prevVisible && _currentVisible) {
            this._startTimer();
        }

        if (_prevVisible && !_currentVisible) {
            clearTimeout(this._timer)
            if (this.state.fade) { this.setState({fade : false}) }
        }
    }

    render() {
        const {lesson, finished, paused, starting} = this.props

        if (starting) return null

        const _lesson = this._getLesson(),
            _tests = _lesson.Tests,
            _hidden = !(finished || paused)

        return _tests && (_tests.length > 0) ?
            <div className={"player__pause-screen js-pause-screen" + (_hidden ? " _hidden" : "") + (this.state.fade ? " _fade" : "")}>
                <div className="pause-screen__content-wrapper">
                    <div className="pause-screen_lesson-title font-universal__title-large">{lesson.Name}</div>
                    <div className="pause-screen_lesson-descr font-universal__book-large">{lesson.ShortDescription}</div>
                    <TestButtons lessonId={lesson.Id}/>
                </div>
            </div>
            :
            <div className={"player-frame__screen" + (finished ? " finished" : "") + (paused ? "" : " hide")}/>
    }

    _getLesson() {
        const {lessonList} = this.props

        let _lessons = []
        lessonList.forEach((lesson) => {
            _lessons.push(lesson)
            if (lesson.Lessons && (lesson.Lessons.length > 0)) {
                lesson.Lessons.forEach((sublesson) => {_lessons.push(sublesson)})
            }
        })

        return _lessons.find((lesson) => {
            return lesson.Id === this.props.lesson.Id
        })
    }

    _startTimer() {
        if (this._timer) {
            clearTimeout(this._timer);
        }

        this._timer = setTimeout(() => {
            this._stopTimer()
        }, TIMEOUT)
    }

    _stopTimer() {
        if (this._timer) {
            clearTimeout(this._timer);
        }

        this.setState({fade: true})
    }
}

const mapStateToProps = (state) => {
    return {
        lessonList: lessonsSelector(state),
        starting: state.player.starting,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PauseScreen);