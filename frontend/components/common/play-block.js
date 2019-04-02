import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import * as userActions from '../../actions/user-actions'
import * as storageActions from '../../actions/lesson-info-storage-actions'
import {TooltipTitles} from "../../tools/page-tools";
import {FINISH_DELTA_TIME} from "../../constants/player";

class PlayBlock extends React.Component {

    static propTypes = {
        id: PropTypes.number,
        cover: PropTypes.string,
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
        audios: PropTypes.array,
        isAuthRequired: PropTypes.bool,
        duration: PropTypes.string,
        totalDuration: PropTypes.number,
        isPaidCourse: PropTypes.bool,
        isLessonFree: PropTypes.bool,
    }

    _play() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this._redirect = true;
        this.forceUpdate()
        this.props.playerStartActions.startPlay(this.props.id)
    }

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _getButton(isFinished) {
        const _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _replay = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>',
            _crown = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>',
            _lock = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"/>'

        let {isAuthRequired, authorized, isPaidCourse, isLessonFree} = this.props

        if (isPaidCourse && !isLessonFree) {
            return <button className="play-block__btn paused" onClick={::this._unlock}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: _crown}}/>
            </button>
        } else if (isAuthRequired && !authorized) {
            return <button className="play-block__btn paused" onClick={::this._unlock}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: _lock}}/>
            </button>
        } else {
            return <button className={"play-block__btn" + (isFinished ? ' paused' : '')} onClick={::this._play}>
                {isFinished
                    ?
                    <svg width="34" height="34" dangerouslySetInnerHTML={{__html: _replay}}/>
                    :
                    <svg width="41" height="36" dangerouslySetInnerHTML={{__html: _play}}/>
                }
            </button>
        }
    }

    _getTooltip(isFinished) {
        let {isAuthRequired, authorized, isPaidCourse, isLessonFree} = this.props,
            _tooltip = null;

        if (isPaidCourse && !isLessonFree) {
            return TooltipTitles.IS_PAID
        }
        else if (isAuthRequired && !authorized) {
            _tooltip = TooltipTitles.locked
        } else {
            _tooltip = isFinished ? TooltipTitles.replay : TooltipTitles.play
        }

        return _tooltip;
    }

    render() {
        const _radius = 98.75;

        let {isAuthRequired, authorized} = this.props,
            _lessonLocked = (isAuthRequired && !authorized);

        let {isFinished : _isFinished, playedPart : _playedPart} = this._calcIsFinishedAndPlayedPart(),
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;


        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
        }

        return (
            <div className="lecture-full__play-block">
                <div className="play-block play-block--big">
                    <div className="play-block__image-wrapper"
                         style={{backgroundImage: 'url(/data/' + this.props.cover + ')'}}/>
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
                    <div className="play-block__duration">{this.props.duration}</div>
                </div>
            </div>
        )
    }

    _calcIsFinishedAndPlayedPart() {
        let {id, totalDuration, lessonInfoStorage} = this.props;

        let _lessonInfo = lessonInfoStorage.lessons.get(id),
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0;

        let _playedPart = totalDuration ? ((_currentTime) / totalDuration) : 0,
            _deltaTime = Math.round(totalDuration - _currentTime);

        let result = {};

        result.playedPart = _playedPart;
        result.isFinished = _lessonInfo ? (_lessonInfo.isFinished || (_deltaTime <= FINISH_DELTA_TIME)) : false;

        return result
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
        storageActions: bindActionCreators(storageActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);