import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {Link} from 'react-router-dom';
import {Redirect} from 'react-router';
import Swipeable from 'react-swipeable';
import $ from 'jquery'

import * as playerStartActions from '../actions/player-start-actions'
import * as playerActions from '../actions/player-actions'

class SmallPlayer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            isMobile: false,
            redirect: false,
        }
    }

    componentDidMount() {
        let _smallContainer = $('#small-player');
        this.props.playerActions.setSmallViewPort(_smallContainer)
    }

    componentDidUpdate() {
        let _isMobile = ($(window).width() < 900);

        if (this.state.isMobile !== _isMobile) {
            this.setState({
                isMobile: _isMobile
            })
        }
    }

    componentWillUnmount() {
    }


    _onPlayClick() {
    }

    _onPauseClick() {

    }

    _onClick() {
    }

    _close() {
        this.props.playerStartActions.startStop();
    }

    _maximize() {
        this.setState({redirect: true});
    }

    render() {
        const _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _maximize = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#maximize"/>',
            _close = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close"/>';

        let {paused, ended, playingLesson, showSmallPlayer, isLessonMenuOpened} = this.props;

        if ((this.state.redirect) && (this.props.playingLesson)) {
            this.setState({redirect: false})
            return <Redirect push to={'/' + playingLesson.courseUrl + '/' + playingLesson.lessonUrl + '?play'}/>;
        }

        let _link = (playingLesson) ? '/' + playingLesson.courseUrl + '/' + playingLesson.lessonUrl + '?play' : '#',
            _text = (playingLesson) ?
                (playingLesson.Number + '. ' + playingLesson.Name)
                :
                null;

        let _visible = playingLesson && showSmallPlayer && !isLessonMenuOpened && !this.props.stopped

        return (
            <Swipeable trackMouse onSwipingRight={::this._close} onSwipedLeft={::this._maximize}>
                <div className={'small-player-frame' + ((_visible && !ended) ? '' : ' hide')}
                     onClick={::this._onClick}>
                    <div className='ws-container-mini' id='small-player'/>
                    <div className='small-player__poster'/>
                    <div className='player-frame__poster-text'>{_text}</div>
                    {
                        playingLesson ?
                            <div className='small-player_block'>
                                <Link to={_link}>
                                    <button type="button" className="maximize-button">
                                        <svg className="maximize" width="41" height="37"
                                             dangerouslySetInnerHTML={{__html: _maximize}}/>
                                    </button>
                                </Link>
                                {paused ?
                                    <button type="button" className="play-button" onClick={::this.props.playerStartActions.startPlay}>
                                        <svg className="play" width="41" height="36"
                                             dangerouslySetInnerHTML={{__html: _play}}/>
                                    </button>
                                    :
                                    <button type="button" className="play-button" onClick={::this.props.playerStartActions.startPause}>
                                        <svg className="pause" width="23" height="36"
                                             dangerouslySetInnerHTML={{__html: _pause}}/>
                                    </button>
                                }
                                {
                                    <button type="button" className="close-button" onClick={::this._close}>
                                        <svg className="close" width="18" height="18"
                                             dangerouslySetInnerHTML={{__html: _close}}/>
                                    </button>
                                }
                            </div>
                            :
                            null
                    }
                </div>
            </Swipeable>
        );
    }
}

function mapStateToProps(state) {
    return {
        paused: state.player.paused,
        stopped: state.player.stopped,
        ended: state.player.ended,
        playingLesson: state.player.playingLesson,
        showSmallPlayer: state.app.showSmallPlayer,
        isLessonMenuOpened: state.app.isLessonMenuOpened,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        playerActions: bindActionCreators(playerActions, dispatch),
        // pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        // appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SmallPlayer);