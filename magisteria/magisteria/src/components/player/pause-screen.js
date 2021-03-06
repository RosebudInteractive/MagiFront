import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import * as playerStartActions from '../../actions/player-start-actions'

class PauseScreen extends React.Component {
    static propTypes = {
        isMain: PropTypes.bool,
        duration: PropTypes.string,
        number: PropTypes.number,
    };

    static defaultProps = {
        isMain: true,
    };

    _startPlay() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this.props.playerStartActions.startPlay({lessonId: this.props.lesson.Id})
    }

    render() {
        let {lesson, isFinished} = this.props;
        let _number = this.props.isMain ? (lesson.Number + '. ') : (lesson.Number + ' ');
        let _toc = this.props.currentContent ? this.props.currentContent.title : '';

        const _style = {cursor: 'pointer'};

        const _plus = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#plus"/>',
            _replay = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lecture-replay"/>';

        return (
            <div className={"player-frame__screen" + (isFinished ? " finished" : "") + (this.props.paused ? "" : " hide")}>
                <div className="lecture-frame">
                    <div className="lecture-frame__header">
                        <div className='lecture-frame__play-link'>
                            {
                                !this.props.isMain ?
                                    <button type="button" className="lecture-frame__plus">
                                    <span className="lecture-frame__plus-icon">
                                        <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _plus}}/>
                                    </span>
                                        <span className="lecture-frame__plus-text">Доп. эпизод</span>
                                    </button>
                                    :
                                    null
                            }
                            <h2 className="lecture-frame__title">
                                <span className="lecture-frame__duration pause-screen">{lesson.DurationFmt}</span>
                                {
                                    isFinished ?
                                        <div style={_style} onClick={::this._startPlay}>
                                            <span className="play-btn-big lecture-frame__play-btn lock">
                                                <svg width="102" height="90" dangerouslySetInnerHTML={{__html: _replay}}/>
                                            </span>
                                        </div>
                                        :
                                        <span className="play-btn-big lecture-frame__play-btn pause-screen" style={_style}
                                              onClick={::this._startPlay}>Воспроизвести
                                </span>
                                }

                                <p className="title-paragraph pause-screen">
                                    <span className="title-text">
                                        <span className="number">{_number}</span>
                                        {lesson.Name}
                                    </span>
                                </p>
                            </h2>
                            <div className="lecture-frame__text-block">
                                <p className="lecture-frame__descr">{lesson.ShortDescription}</p>
                                <p className="lecture-frame__author">{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</p>
                                <p className="lecture-frame__chapter">{_toc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        paused: state.player.paused,
        currentContent: state.player.currentContent,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PauseScreen);