import React from 'react'
import PropTypes from "prop-types"

const RATIO = 1.6

export default class VideoBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            const _intro = $('#intro-video'),
                _interview = $('#interview-video')

            if (_intro) {
                _intro.height(_intro.width() / RATIO)
            }

            if (_interview) {
                _interview.height(_interview.width() / RATIO)
            }
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this._resizeHandler);

        this._resizeHandler()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._resizeHandler);
    }

    render() {
        const _visible = this.props.course && (this.props.course.VideoIntroLink || this.props.course.VideoIntwLink),
            _bothVideoExists = this.props.course.VideoIntroLink && this.props.course.VideoIntwLink,
            _introDuration = this.props.course && this.props.course.IntroDFmt && <span className="duration">{this.props.course.IntroDFmt}</span>,
            _interviewDuration = this.props.course && this.props.course.IntwDFmt && <span className="duration">{this.props.course.IntwDFmt}</span>

        return _visible ?
            <div className={"course__video-block" + (!_bothVideoExists ? " _single" : "")}>
                {
                    this.props.course.VideoIntroLink ?
                        <div className="video-block__item">
                            <div className="video-frame__wrapper" id="intro-video">
                                <iframe width="100%" height="100%" src={this.props.course.VideoIntroLink}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen/>
                            </div>
                            <div className="video-frame__title">
                                <div className="title__wrapper">
                                    <span className="title">Презентация курса</span>
                                    {_introDuration}
                                    <span className="arrow">→</span>
                                </div>
                            </div>
                        </div>
                        :
                        null
                }
                {
                    this.props.course.VideoIntwLink ?
                        <div className="video-block__item">
                            <div className="video-frame__wrapper" id="interview-video">
                                <iframe width="100%" height="100%" src={this.props.course.VideoIntwLink}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen/>
                            </div>
                            <div className="video-frame__title">
                                <div className="title__wrapper">
                                    <span className="title">Интервью с автором</span>
                                    {_interviewDuration}
                                    <span className="arrow">→</span>
                                </div>
                            </div>
                        </div>
                        :
                        null
                }
            </div>

            :
            null
    }

}