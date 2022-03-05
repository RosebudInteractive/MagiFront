import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import $ from 'jquery'

import * as playerStartActions from '../../../actions/player-start-actions'
import {isMobileAppleDevice} from "tools/page-tools";
import {Link} from "react-router-dom";
import LessonTooltip from "../lesson-tooltip";
import {lessonsSelector} from "ducks/lesson-menu";
import {getSiblingsLessons} from "tools/player/functions";

const SVG = {
    BACKWARD: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>',
    FORWARD: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#forward"/>',
    PAUSE: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
    PLAY: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
    SOUND: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sound"/>',
    MUTE: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#mute"/>',
    PREV: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#player-prev"/>',
    NEXT: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#player-next"/>',
}

class Controls extends React.Component {

    componentDidMount() {
        let _id = this.props.lesson ? this.props.lesson.Id : '';

        $("#sound-bar" + _id).click((event) => {
            let _current = event.pageX - event.currentTarget.offsetLeft,
                _total = event.currentTarget.offsetWidth - 1;
            this._setVolume(_current, _total)
        });
    }

    render() {
        let {lesson, course, isPaidCourse, lessonList} = this.props,
            _id = lesson ? lesson.Id : '',
            _isIOS = isMobileAppleDevice(),
            _needHideSoundControl = (this.props.muted || _isIOS)

        let {prev, next} = getSiblingsLessons(lessonList, _id)

        return (
            <div className="player-block__controls desktop">
                <button type="button" className="backwards" onClick={::this._onBackward}>
                    <svg width="18" height="11" dangerouslySetInnerHTML={{__html: SVG.BACKWARD}}/>
                </button>
                {this.props.paused ?
                    <button type="button" className="play-button" onClick={::this._startPlay}>
                        <svg className="play" width="19" height="19" dangerouslySetInnerHTML={{__html: SVG.PLAY}}/>
                    </button>
                    :
                    <button type="button" className="play-button paused"
                            onClick={::this.props.playerStartActions.startPause}>
                        <svg className="pause" width="11" height="18" dangerouslySetInnerHTML={{__html: SVG.PAUSE}}/>
                    </button>
                }
                <button type="button" className="forward" onClick={::this._onForward}>
                    <svg width="18" height="16" dangerouslySetInnerHTML={{__html: SVG.FORWARD}}/>
                </button>
                <div className="lesson-navigate-block">
                    {
                        prev ?
                            <Link to={`/${course.URL}/${prev.URL}`} className="prev-lesson">
                                <button type="button" className="forward">
                                    <svg width="32" height="26" dangerouslySetInnerHTML={{__html: SVG.PREV}}/>
                                </button>
                                <LessonTooltip currentLessonUrl={lesson.URL} isPaidCourse={isPaidCourse} course={course} lesson={prev} title={"Предыдущая лекция"}/>
                            </Link>
                            :
                            <button type="button" className="forward _disabled">
                                <svg width="32" height="26" dangerouslySetInnerHTML={{__html: SVG.PREV}}/>
                            </button>
                    }
                    {
                        next ?
                            <Link to={`/${course.URL}/${next.URL}`} className="next-lesson">
                                <button type="button" className="forward">
                                    <svg width="32" height="26" dangerouslySetInnerHTML={{__html: SVG.NEXT}}/>
                                </button>
                                <LessonTooltip currentLessonUrl={lesson.URL} isPaidCourse={isPaidCourse} course={course} lesson={next}/>
                            </Link>
                            :
                            <button type="button" className="forward _disabled">
                                <svg width="32" height="26" dangerouslySetInnerHTML={{__html: SVG.NEXT}}/>
                            </button>
                    }
                </div>
                <button type="button" className="sound-button"
                        style={_isIOS ? {display: 'none'} : null}
                        onClick={::this.props.playerStartActions.toggleMute}>
                    {
                        this.props.muted ?
                            <svg className="off" width="18" height="18" dangerouslySetInnerHTML={{__html: SVG.MUTE}}/>
                            :
                            <svg className="on" width="18" height="18" dangerouslySetInnerHTML={{__html: SVG.SOUND}}/>
                    }
                </button>
                <div className="sound-control" id={'sound-bar' + _id}
                     style={_needHideSoundControl ? {display: 'none'} : null}>
                    <div className="sound-control__bar">
                        <div className="sound-control__progress" style={{width: (this.props.volume * 100) + "%"}}/>
                    </div>
                    <button type="button" className="sound-control__btn"
                            style={{left: (this.props.volume * 100) + "%"}}>Громкость
                    </button>
                </div>
            </div>
        );
    }

    _onBackward() {
        let _newPosition = (this.props.currentTime < 10) ? 0 : (this.props.currentTime - 10);
        this.props.playerStartActions.startSetCurrentTime(_newPosition);
    }

    _onForward() {
        let _newPosition = (this.props.totalDuration - this.props.currentTime < 10) ? 0 : (this.props.currentTime + 10);
        this.props.playerStartActions.startSetCurrentTime(_newPosition);
    }

    _setVolume(current, total) {
        let value = total ? (current / total) : 0
        this.props.playerStartActions.startSetVolume(value)
    }

    _startPlay() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this.props.playerStartActions.startPlay(this.props.lesson.Id)
    }
}

function mapStateToProps(state) {
    return {
        currentTime: state.player.currentTime,
        paused: state.player.paused,
        muted: state.player.muted,
        volume: state.player.volume,
        lessonList: lessonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);