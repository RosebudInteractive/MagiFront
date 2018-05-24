import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'

class PlayBlock extends React.Component {

    constructor(props) {
        super(props)

        this._redirect = false
    }

    static propTypes = {
        lessonUrl: PropTypes.string,
        courseUrl: PropTypes.string,
        audios: PropTypes.array,
        isAuthRequired: PropTypes.bool,
    }

    _play() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this._redirect = true;
        this.forceUpdate()
        this.props.playerStartActions.startPlay()
    }

    _unlock() {

    }

    _getButton(isFinished) {
        const _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _replay = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>',
            _lock = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"/>'

        let {isAuthRequired, authorized} = this.props,
            _button = null;

        if (isAuthRequired && !authorized) {
            _button = (
                <button type="button" className="lecture__btn paused" onClick={::this._unlock}>
                    <svg width="27" height="30" dangerouslySetInnerHTML={{__html: _lock}}/>
                </button>
            )
        } else {
            _button = (
                isFinished
                    ?
                    <button type="button" className="lecture__btn paused" onClick={::this._play}>
                        <svg width="34" height="34" dangerouslySetInnerHTML={{__html: _replay}}/>
                    </button>
                    :
                    <button type="button" className="lecture__btn" onClick={::this._play}>
                        <svg width="41" height="36" dangerouslySetInnerHTML={{__html: _play}}/>
                    </button>
            )
        }

        return _button;
    }

    _getTooltip(isFinished) {
        let {isAuthRequired, authorized} = this.props,
            _tooltip = null;

        if (isAuthRequired && !authorized) {
            _tooltip = 'Для просмотра этой лекции необходимо авторизоваться на сайте'
        } else {
            _tooltip = isFinished ? "Сначала" : "Смотреть"
        }

        return _tooltip;
    }

    render() {
        const _radius = 97.25;

        let {id, totalDuration} = this.props,
            _lessonInfo = this.props.lessonInfoStorage.lessons.get(id),
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false,
            _playedPart = totalDuration ? ((_currentTime) / totalDuration) : 0,
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;


        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
        }

        return (
            <div className='lecture__play-block'>

                <div className="lecture__image-wrapper">
                    <img src={this.props.cover} width="126" height="126" alt=""/>
                </div>
                <div className="lecture__loader" id="cont" data-pct="100">
                    <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200" version="1.1"
                         xmlns="http://www.w3.org/2000/svg">
                        <circle className="bar" id="bar" r={_radius} cx="100" cy="100" fill="transparent"
                                strokeDasharray={[_timeLineLength, _fullLineLength - _timeLineLength]}
                                strokeDashoffset={_offset} style={{strokeWidth: '6px'}}/>
                    </svg>
                </div>
                <input className="loader-field" id="percent" name="percent" value="75" readOnly={true}/>
                {this._getButton(_isFinished)}
                <div className="lecture__tooltip">{this._getTooltip(_isFinished)}</div>
                <div className='duration'>{this.props.duration}</div>
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);