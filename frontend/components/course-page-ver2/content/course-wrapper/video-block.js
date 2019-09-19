import React from 'react'
import PropTypes from "prop-types"
import {COURSE_VIDEO_TYPE} from "../../../../constants/common-consts";

const RATIO = 1.78

export default class VideoBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        videoType: PropTypes.string,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            const _video = $(`#${this._getId()}`)

            if (_video) {
                _video.height(_video.width() / RATIO)
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
        const {course, videoType} = this.props

        if (!course) {return null}

        const _visible = (course.VideoIntroLink && videoType === COURSE_VIDEO_TYPE.PREVIEW) || (course.VideoIntwLink && videoType === COURSE_VIDEO_TYPE.INTERVIEW),
            _title = videoType === COURSE_VIDEO_TYPE.PREVIEW ? "Презентация курса" : "Интервью с автором",
            _duration = videoType === COURSE_VIDEO_TYPE.PREVIEW ? course.IntroDFmt : course.IntwDFmt,
            _source = videoType === COURSE_VIDEO_TYPE.PREVIEW ? course.VideoIntroLink : course.VideoIntwLink,
            _durationDiv = _duration && <span className="duration">{_duration}<span className="arrow">→</span></span>


        return _visible ?
            <div className={"course__video-block" + (videoType === COURSE_VIDEO_TYPE.INTERVIEW ? ' _interview' : '')}>
                <div className="video-block__item">
                    <div className="video-frame__wrapper" id={this._getId()}>
                        <iframe width="100%" height="100%" src={_source}
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen/>
                    </div>
                    <div className="video-frame__title">
                        <div className="title__wrapper">
                            <span className="title">{_title}</span>
                            {_durationDiv}
                        </div>
                    </div>
                </div>
            </div>
            :
            null
    }

    _getId() {
        return `${this.props.videoType.toLocaleLowerCase()}-video`
    }

}