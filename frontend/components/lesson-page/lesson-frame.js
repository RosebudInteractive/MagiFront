import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
// import {Redirect} from 'react-router';
import * as playerStartActions from '../../actions/player-start-actions'
import { bindActionCreators } from 'redux';

class LessonFrame extends React.Component {
    static propTypes = {
        courseUrl: PropTypes.string.isRequired,
        lesson: PropTypes.object.isRequired,
        isMain: PropTypes.bool,
    };

    static defaultProps = {
        isMain: true
    };

    _play() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this.props.history.replace('/' + this.props.courseUrl + '/' + this.props.lesson.URL + '?play')
        this.forceUpdate()
    }

    render() {
        const _plus = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#plus"/>'

        let {lesson} = this.props;
        let _number = this.props.isMain ? (lesson.Number + '. ') : (lesson.Number + ' ');
        let _lessonInfo = this.props.lessonInfoStorage.lessons.get(lesson.Id),
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
            _playPercent = lesson.Duration ? ((_currentTime * 100) / lesson.Duration) : 0

        // if (this._redirect) {
        //     this._redirect = false;
        //     // return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lesson.URL + '?play'}/>;
        // }

    //             <Link to={'/' + this.props.courseUrl + '/' + this.props.lesson.URL + '?play'}>
    //         <span className="play-btn-big lecture-frame__play-btn">Воспроизвести</span>
    // </Link>

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
                            <div style={{cursor: 'pointer'}} onClick={::this._play}>
                                <span className="play-btn-big lecture-frame__play-btn">Воспроизвести</span>
                            </div>
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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonFrame);