import React from "react"
import PropTypes from 'prop-types'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {lessonsSelector} from "ducks/lesson-menu";
import "./pause-screen.sass"
import TestButtons from "../../test-buttons";
import LessonTooltip from "../../lesson-tooltip";

const TIMEOUT = 2000

class PauseScreen extends React.Component {
    static propTypes = {
        lesson: PropTypes.object,
        finished: PropTypes.bool,
        paused: PropTypes.bool,
        course: PropTypes.object,
        isPaidCourse: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            fade: false
        }

        this._timer = null
        this._handlerBinded = false
    }

    componentDidMount() {
        this._bindHandler()
    }

    componentDidUpdate(prevProps) {
        const _prevVisible = prevProps.finished || prevProps.paused,
            _currentVisible = this.props.finished || this.props.paused

        if (!_prevVisible && _currentVisible) {
            if (!this._handlerBinded) {
                this._bindHandler()
            } else {
                this._startTimer();
            }
        }

        if (_prevVisible && !_currentVisible) {
            clearTimeout(this._timer)
            if (this.state.fade) { this.setState({fade : false}) }
        }
    }

    componentWillUnmount() {
        $(".js-pause-screen").unbind('mousemove');
        $(".js-pause-screen").unbind('touchend');
    }

    render() {
        const {lesson, finished, paused, starting, course, isPaidCourse} = this.props

        const {current, next} = this._getLessons(),
            _tests = current.Tests,
            _hidden = !(finished || paused)

        let _className = "player__pause-screen js-pause-screen" + (_hidden ? " _hidden" : "") + (this.state.fade ? " _fade" : "") + (finished ? " _finished" : "")

        return <div className={_className}>
            {
                (!starting || finished) &&
                <div className="pause-screen__content-wrapper">
                    { !finished && <div className="pause-screen_lesson-title font-universal__title-large">{lesson.Name}</div> }
                    { !finished && <div className="pause-screen_lesson-descr font-universal__book-large">{lesson.ShortDescription}</div> }
                    { _tests && (_tests.length > 0) && <TestButtons lessonId={lesson.Id}/> }
                    { finished && <LessonTooltip lesson={next} course={course} isPaidCourse={isPaidCourse} currentLessonUrl={current.URL}/> }
                </div>
            }
        </div>
    }

    _bindHandler() {
        let _screen = $(".js-pause-screen")

        if (_screen && (_screen.length > 0)) {
            _screen.on('mousemove', () => {
                if (this.state.fade) { this.setState({fade : false}) }
                this._handlerBinded = true
                this._startTimer()
            })

            _screen.on('touchend', (e) => {
                const _isPhone = (($(window).height() <= 414) || ($(window).width() <= 414))

                if (_isPhone) return

                if (this.state.fade) {
                    this.setState({fade : false})
                    e.preventDefault()
                    e.stopPropagation()
                }

                this._handlerBinded = true
                this._startTimer()
            })
        }
    }

    _getLessons() {
        const {lessonList} = this.props

        let _lessons = []
        lessonList.forEach((lesson) => {
            _lessons.push(lesson)
            if (lesson.Lessons && (lesson.Lessons.length > 0)) {
                lesson.Lessons.forEach((sublesson) => {_lessons.push(sublesson)})
            }
        })

        let _index = _lessons.findIndex((lesson) => {
            return lesson.Id === this.props.lesson.Id
        })

        return {
            current: (_index >= 0) ? _lessons[_index] : null,
            next: (_index < _lessons.length - 2) ? _lessons[_index + 1] : null
        }
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