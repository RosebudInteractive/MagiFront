import React from 'react'
import PropTypes from "prop-types"

export default class VideoBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const _visible = this.props.course && (this.props.course.VideoIntroLink || this.props.course.VideoIntwLink),
            _bothVideoExists = this.props.course.VideoIntroLink && this.props.course.VideoIntwLink,
            _introDuration = this.props.course && this.props.course.IntroDFmt && <span className="duration">{this.props.course.IntroDFmt}</span>,
            // _introDuration = <span className="duration">7:46</span>,
            _interviewDuration = this.props.course && this.props.course.IntwDFmt && <span className="duration">{this.props.course.IntwDFmt}</span>
            // _interviewDuration = <span className="duration">7:46</span>

        return _visible ?
            <div className={"course__video-block" + (!_bothVideoExists ? " _single" : "")}>
                {
                    this.props.course.VideoIntroLink ?
                        <div className="video-block__item">
                            <div className="video-frame__wrapper">
                                <iframe width="100%" height="100%" src={this.props.course.VideoIntroLink}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen/>
                            </div>
                            <div className="video-frame__title">
                                <span className="title">Презентация курса</span>
                                {_introDuration}
                                <span className="arrow">→</span>
                            </div>
                        </div>
                        :
                        null
                }
                {
                    this.props.course.VideoIntwLink ?
                        <div className="video-block__item">
                            <div className="video-frame__wrapper">
                                <iframe width="100%" height="100%" src={this.props.course.VideoIntwLink} frameBorder="0"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen/>
                            </div>
                            <div className="video-frame__title">
                                <span className="title">Интервью с автором</span>
                                {_interviewDuration}
                                <span className="arrow">→</span>
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