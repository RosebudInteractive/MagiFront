import React from 'react'
import PropTypes from 'prop-types'
import './extended-info.sass'
import AuthorsBlock from "./authors-block/authors-block";
import VideoBlock from "./video-block";

export default class ExtendedInfo extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {visible, course} = this.props

        return <div className={"course-wrapper__extended-info" + (visible ? " _visible" : "")}>
            <AuthorsBlock authors={course.Authors}/>
            <VideoBlock course={course}/>
            <TargetAudience targetAudience={course.TargetAudience}/>
            <Aims aims={course.Aims}/>
        </div>
    }
}

/**
 * @return {null}
 */
function TargetAudience(props) {
    const _text = props.targetAudience;

    return _text ?
        <div className="extended-info__target-audience block-wrapper">
            <div className="target-audience__title block-title">Кому подойдет этот курс</div>
            <div className="target-audience__text block-descr" dangerouslySetInnerHTML={{__html: _text}}/>
        </div>
        :
        null
}


/**
 * @return {null}
 */
function Aims(props) {
    const _text = props.aims;

    return _text ?
        <div className="extended-info__aims block-wrapper">
            <div className="aims__title block-title">Чему вы научитесь</div>
            <div className="aims__text block-descr" dangerouslySetInnerHTML={{__html: _text}}/>
        </div>
        :
        null
}