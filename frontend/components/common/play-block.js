import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import * as userActions from '../../actions/user-actions'
import {_play, _goToLesson, _getTooltip, _calcIsFinishedAndPlayedPart, SVG} from "./play-block-functions";
import {getPaidCourseInfo,} from "ducks/billing";

class PlayBlock extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        course: PropTypes.object,
        cover: PropTypes.string,
        isAdmin: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._redirect = false
        this._redirectWithoutPlay = false

        this._play = _play.bind(this);
        this._goToLesson = _goToLesson.bind(this)
        this._getTooltip = _getTooltip.bind(this)
        this._calcIsFinishedAndPlayedPart = _calcIsFinishedAndPlayedPart.bind(this)
    }

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _getButton(isFinished) {
        const {lesson, course, authorized} = this.props;

        let _isPaidCourse = (course.IsPaid && !course.IsGift && !course.IsBought);

        if (_isPaidCourse && !lesson.IsFreeInPaidCourse) {
            return <button className="play-block__btn paused" onClick={::this._goToLesson}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: SVG.CROWN}}/>
            </button>
        } else if (lesson.IsAuthRequired && !authorized) {
            return <button className="play-block__btn paused" onClick={::this._unlock}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: SVG.LOCK}}/>
            </button>
        } else {
            return <button className={"play-block__btn" + (isFinished ? ' paused' : '')} onClick={::this._play}>
                {isFinished
                    ?
                    <svg width="34" height="34" dangerouslySetInnerHTML={{__html: SVG.REPLAY}}/>
                    :
                    <svg width="41" height="36" dangerouslySetInnerHTML={{__html: SVG.PLAY}}/>
                }
            </button>
        }
    }

    render() {
        const {lesson, course, cover, authorized,} = this.props;

        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + course.URL + '/' + lesson.URL + '?play'}/>;
        }

        if (this._redirectWithoutPlay) {
            this._redirectWithoutPlay = false;
            return <Redirect push to={'/' + course.URL + '/' + lesson.URL}/>;
        }

        const _lessonLocked = (lesson.IsAuthRequired && !authorized),
            _radius = 98.75;

        let {isFinished : _isFinished, playedPart : _playedPart} = this._calcIsFinishedAndPlayedPart(),
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;

        return (
            <div className="lecture-full__play-block">
                <div className="play-block play-block--big">
                    <div className="play-block__image-wrapper"
                         style={{backgroundImage: 'url(/data/' + cover + ')'}}/>
                    {
                        !_lessonLocked ?
                            <div className="play-block__loader">
                                <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200"
                                     version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <circle className="bar" id="bar" r={_radius} cx="100" cy="100" fill="transparent"
                                            strokeDasharray={[_timeLineLength, _fullLineLength - _timeLineLength]}
                                            strokeDashoffset={_offset}
                                    />
                                </svg>
                            </div>
                            :
                            null
                    }

                    {this._getButton(_isFinished)}
                    <div className="play-block__tooltip">{this._getTooltip(_isFinished)}</div>
                    <div className="play-block__duration">{lesson.DurationFmt}</div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        lessonInfoStorage: state.lessonInfoStorage,
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        getPaidCourseInfo: bindActionCreators(getPaidCourseInfo, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);