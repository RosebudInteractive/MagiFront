import React from "react"
import PropTypes from 'prop-types'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {lessonsSelector} from "ducks/lesson-menu";
import "./pause-screen.sass"
import TestButtons from "../../test-buttons";
import LessonTooltip from "../../lesson-tooltip";
import {getSiblingsLessons} from "tools/player/functions";

const TIMEOUT = 5000

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
            fade: false,
            hiding: false,
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
            if (this.state.fade) {
                this.setState({fade : false})
            } else {
                this.setState({hiding : true})
                setTimeout(() => {
                    this.setState({
                        fade : false,
                        hiding : false
                    })
                }, 700)
            }
        }
    }

    componentWillUnmount() {
        $(".js-pause-screen").unbind('mousemove');
        $(".js-pause-screen").unbind('touchend');
    }

    render() {
        const {lesson, finished, paused, starting, course, isPaidCourse, lessonList} = this.props

        const {current, next} = getSiblingsLessons(lessonList, lesson.Id),
            _tests = current.Tests,
            _hidden = !(finished || paused || this.state.hiding)

        let _className = "player__pause-screen js-pause-screen" + (_hidden ? " _hidden" : "") +
            (this.state.hiding ? " _hiding" : "") +
            (this.state.fade ? " _fade" : "") +
            (finished ? " _finished" : "")

        return <div className={_className}>
            {
                (!starting || finished) &&
                <div className="pause-screen__content-wrapper">
                    { !finished && <div className="pause-screen_lesson-title font-universal__title-large">{lesson.Name}</div> }
                    { !finished && <div className="pause-screen_lesson-descr font-universal__book-large">{lesson.ShortDescription}</div> }
                    { _tests && (_tests.length > 0) && <TestButtons lessonId={lesson.Id}/> }
                    { finished && next && <LessonTooltip lesson={next} course={course} isPaidCourse={isPaidCourse} currentLessonUrl={current.URL}/> }
                </div>
            }
        </div>
    }

    _bindHandler() {
        let _screen = $(".js-pause-screen")

        if (_screen && (_screen.length > 0)) {
            _screen.on('mousemove', () => {
                if (this.state.fade) { this.setState({fade : false}) }
                this._startTimer()
            })

            _screen.on('touchend', (e) => {
                if (this.state.fade) {
                    this.setState({fade : false})
                    e.preventDefault()
                    e.stopPropagation()
                }

                this._startTimer()
            })

            this._handlerBinded = true
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