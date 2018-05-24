import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'

class PlayBlock extends React.Component {

    static propTypes = {
        cover: PropTypes.string,
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
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
            _button = <button className="play-block__btn" onClick={::this._unlock}>
                <svg width="34" height="34" dangerouslySetInnerHTML={{__html: _lock}}/>
            </button>
        } else {
            _button = <button className="play-block__btn" onClick={::this._play}>
                {isFinished
                    ?
                    <svg width="34" height="34" dangerouslySetInnerHTML={{__html: _replay}}/>
                    :
                    <svg width="41" height="36" dangerouslySetInnerHTML={{__html: _play}}/>
                }
            </button>
        }

        return _button;
    }

    render() {
        const _radius = 98.75;

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
            <div className="lecture-full__play-block">
                <div className="play-block play-block--big">
                    <div className="play-block__image-wrapper"
                         style={{backgroundImage: 'url(/data/' + this.props.cover + ')'}}/>
                    <div className="play-block__loader">
                        <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200"
                             version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle className="bar" id="bar" r={_radius} cx="100" cy="100" fill="transparent"
                                    strokeDasharray={[_timeLineLength, _fullLineLength - _timeLineLength]}
                                    strokeDashoffset={_offset}
                            />
                        </svg>
                    </div>
                    {this._getButton(_isFinished)}
                    <div className="play-block__tooltip">{_isFinished ? "Сначала" : "Смотреть"}</div>
                    <div className="play-block__duration">{this.props.duration}</div>
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);