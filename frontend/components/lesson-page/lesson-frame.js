import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import {bindActionCreators} from 'redux';
import $ from 'jquery'
import * as userActions from "../../actions/user-actions";

class LessonFrame extends React.Component {
    static propTypes = {
        courseUrl: PropTypes.string,
        lesson: PropTypes.object,
        isMain: PropTypes.bool,
    };

    static defaultProps = {
        isMain: true
    };

    componentDidMount() {
        let that = this

        $(document).mouseup((e) => {
            let _isLessonScreen = e.target.closest('#lesson-' + that.props.lesson.Id),
                _isButtonTarget = e.target.closest('.lecture-frame__play-btn'),
                _isSocialBlock = e.target.closest('.social-block'),
                _isTranscriptLink = e.target.closest('.link-to-transcript'),
                _isPlayerBlock = e.target.closest('.player-frame');

            if (_isLessonScreen && !_isButtonTarget && !_isSocialBlock && !_isPlayerBlock && !_isTranscriptLink) {
                that._play()
            }
        })
    }

    componentWillUnmount() {
        this._removeListeners();
    }

    _removeListeners() {
        $(document).off('mouseup');
    }

    _play() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this.props.history.replace('/' + this.props.courseUrl + '/' + this.props.lesson.URL + '?play')
        this.forceUpdate()
        this.props.playerStartActions.startPlay(this.props.lesson.Id)
    }

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _getButton() {
        const _playLock = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-lock"/>',
            _lock = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"/>'

        let {lesson, authorized} = this.props,
            _button = null;

        if (lesson.IsAuthRequired && !authorized) {
            _button = (
                <div style={{cursor: 'pointer'}} onClick={::this._unlock}>
                    <span className="play-btn-big lecture-frame__play-btn lock">
                        <svg width="102" height="90" dangerouslySetInnerHTML={{__html: _playLock}}/>
                        <svg className='icon-lock' width="27" height="30" dangerouslySetInnerHTML={{__html: _lock}}/>
                    </span>
                </div>
            )
        } else {
            _button = (
                <div style={{cursor: 'pointer'}} onClick={::this._play}>
                    <span className="play-btn-big lecture-frame__play-btn">Воспроизвести</span>
                </div>
            )
        }

        return _button;
    }

    render() {
        const _plus = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#plus"/>'

        let {lesson} = this.props;
        let _number = this.props.isMain ? (lesson.Number + '. ') : (lesson.Number + ' ');
        let _lessonInfo = this.props.lessonInfoStorage.lessons.get(lesson.Id),
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
            _playPercent = lesson.Duration ? ((_currentTime * 100) / lesson.Duration) : 0

        return (
            <div className="lecture-frame" style={this.props.visible ? null : {display: 'none'}}>
                <div className="lecture-frame__header">
                    <div className="lecture-frame__play-link">
                        {this.props.isMain ? null :
                            <button type="button" className="lecture-frame__plus">
                                <span className="lecture-frame__plus-icon">
                                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _plus}}/>
                                </span>
                                <span className="lecture-frame__plus-text">Доп. эпизод</span>
                            </button>}
                        <h2 className="lecture-frame__title">
                            <span className="lecture-frame__duration">{lesson.DurationFmt}</span>
                            {this._getButton()}
                            <span className="title-text">
                                <span className="number">{_number}</span>
                                {lesson.Name + '\n'}
                            </span>

                        </h2>
                        <div className="lecture-frame__text-block">
                            <p className="lecture-frame__descr">{lesson.ShortDescription}</p>
                            <p className="lecture-frame__author">{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</p>
                        </div>
                    </div>
                    <SocialBlock/>
                </div>
                <div className="progress-bar">
                    <div className="progress-bar__bar" style={{width: _playPercent + '%'}}/>
                </div>
            </div>
        )
    }
}

class SocialBlock extends React.Component {
    render() {
        const _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>',
            _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>'


        return (
            <div className="social-block">
                <a href="#" className="social-btn">
                    <div className="social-btn__icon">
                        <svg width="27" height="22" dangerouslySetInnerHTML={{__html: _tw}}/>
                    </div>
                    <span className="social-btn__actions"/>
                </a>
                <a href="#" className="social-btn _active">
                    <div className="social-btn__icon">
                        <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _fb}}/>
                    </div>
                    <span className="social-btn__actions">64</span>
                </a>
                <a href="#" className="social-btn _active">
                    <div className="social-btn__icon">
                        <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                    </div>
                    <span className="social-btn__actions">91</span>
                </a>
                <a href="#" className="social-btn _active">
                    <div className="social-btn__icon">
                        <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                    </div>
                    <span className="social-btn__actions">4</span>
                </a>
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonFrame);