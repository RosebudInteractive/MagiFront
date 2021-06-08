import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import {getPaidCourseInfo,} from "ducks/billing";
import {
    _calcIsFinishedAndPlayedPart,
    _getTooltip,
    _goToLesson,
    _play,
    _unlock,
    SVG
} from "../common/play-block-functions";
import {unlockLesson} from "ducks/player";
import browserHistory from "../../history";

class PlayBlock extends React.Component {

    constructor(props) {
        super(props)

        this._redirect = false
        this._redirectWithoutPlay = false

        this._play = _play.bind(this);
        this._goToLesson = _goToLesson.bind(this)
        this._getTooltip = _getTooltip.bind(this)
        this._unlock = _unlock.bind(this)
        this._calcIsFinishedAndPlayedPart = _calcIsFinishedAndPlayedPart.bind(this)
    }

    static propTypes = {
        lesson: PropTypes.object,
        course: PropTypes.object,
        cover: PropTypes.string,
        isAdmin: PropTypes.bool,
    }

    _getButton(isFinished) {
        const {lesson, course, authorized} = this.props;

        let _isPaidCourse = (course.IsPaid && !course.IsGift && !course.IsBought),
            _button = null;

        if (_isPaidCourse && !lesson.IsFreeInPaidCourse) {
            return <button className="lecture__btn paused" onClick={::this._goToLesson}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: SVG.CROWN}}/>
            </button>
        } else if (lesson.IsAuthRequired && !authorized) {
            _button = (
                <button type="button" className="lecture__btn paused" onClick={::this._unlock}>
                    <svg width="27" height="30" dangerouslySetInnerHTML={{__html: SVG.LOCK}}/>
                </button>
            )
        } else {
            _button = (
                isFinished
                    ?
                    <button type="button" className="lecture__btn paused" onClick={::this._play}>
                        <svg width="34" height="34" dangerouslySetInnerHTML={{__html: SVG.REPLAY}}/>
                    </button>
                    :
                    <button type="button" className="lecture__btn" onClick={::this._play}>
                        <svg width="41" height="36" dangerouslySetInnerHTML={{__html: SVG.PLAY}}/>
                    </button>
            )
        }

        return _button;
    }

    render() {
        const {lesson, course, cover, authorized,} = this.props;

        if (this._redirect) {
            this._redirect = false;
            browserHistory.push('/' + course.URL + '/' + lesson.URL + '?play')
            return null//<Redirect push to={'/' + course.URL + '/' + lesson.URL + '?play'}/>;
        }

        if (this._redirectWithoutPlay) {
            this._redirectWithoutPlay = false;
            browserHistory.push('/' + course.URL + '/' + lesson.URL)
            return null//<Redirect push to={'/' + course.URL + '/' + lesson.URL}/>;
        }

        const _lessonLocked = (lesson.IsAuthRequired && !authorized),
            _imgStyle = {backgroundImage: "url(" + cover + ")"},
            _radius = 97.25;

        let {isFinished: _isFinished, playedPart: _playedPart} = this._calcIsFinishedAndPlayedPart(),
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;

        return (
            <div className='lecture__play-block'>
                <div className="lecture__image-wrapper" style={_imgStyle}/>
                {
                    !_lessonLocked ?
                        <div className="lecture__loader" id="cont" data-pct="100">
                            <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200"
                                 version="1.1"
                                 xmlns="http://www.w3.org/2000/svg">
                                <circle className="bar" id="bar" r={_radius} cx="100" cy="100" fill="transparent"
                                        strokeDasharray={[_timeLineLength, _fullLineLength - _timeLineLength]}
                                        strokeDashoffset={_offset} style={{strokeWidth: '6px'}}/>
                            </svg>
                        </div>
                        :
                        null
                }
                {this._getButton(_isFinished)}
                <div className="lecture__tooltip">{this._getTooltip(_isFinished)}</div>
                <div className='duration'>{lesson.DurationFmt}</div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        lessonInfoStorage: state.lessonInfoStorage,
        paused: state.player.paused,
        playingLesson: state.player.playingLesson,
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        getPaidCourseInfo: bindActionCreators(getPaidCourseInfo, dispatch),
        unlockLesson: bindActionCreators(unlockLesson, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);
