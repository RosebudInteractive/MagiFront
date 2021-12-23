import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'
import {getLessonNumber} from "tools/page-tools";
import "./cover.sass"
import "../../styles/fonts.sass"
import "../../styles/system.sass"
import {PLAYER_CONTROLLER_MODE} from "../../constants/common-consts";

export default class Cover extends React.Component {
    static propTypes = {
        courseUrl: PropTypes.string,
        lesson: PropTypes.object,
        isMain: PropTypes.bool,
        isPaidCourse: PropTypes.bool,
        needLockLessonAsPaid: PropTypes.bool,

        onInitPlayerRequest: PropTypes.func,
        playerController: PropTypes.object,
    };

    static defaultProps = {
        isMain: true
    };

    constructor(props) {
        super(props)
        this._touchMoved = false;
        this._touchEventName = this.props.isMobileApp ? 'touchend' : 'mouseup'

        this._resizeHandler = () => {
            const _isPhone = (($(window).height() <= 414) || ($(window).width() <= 414))
            if (_isPhone !== this._isPhone) {
                this._isPhone = _isPhone
                this.forceUpdate()
            }
        }
    }

    componentDidMount() {
        this._isPhone = (($(window).height() <= 414) || ($(window).width() <= 414))

        let _player = $('.js-player');

        _player
            .on(this._touchEventName, (e) => {
                if (this._touchMoved) {
                    return
                }

                let _isLessonScreen = e.target.closest('.cover-block'),
                    _isMenu = e.target.closest('.lectures-menu'),
                    _isButtonTarget = e.target.closest('.lecture-frame__play-btn'),
                    _isSocialBlock = e.target.closest('.social-block'),
                    _isTranscriptLink = e.target.closest('.link-to-transcript'),
                    _isPlayerBlock = e.target.closest('.player-frame'),
                    _isFavoritesButton = e.target.closest('.lecture-frame__fav'),
                    _isAuthorLink = e.target.closest('.lecture-frame__author'),
                    _isTestButton = e.target.closest('.test-button')

                if (
                    _isLessonScreen &&
                    !_isButtonTarget &&
                    !_isSocialBlock &&
                    !_isPlayerBlock &&
                    !_isTranscriptLink &&
                    !_isMenu &&
                    !_isFavoritesButton &&
                    !_isAuthorLink &&
                    !_isTestButton
                ) {
                    this._play()
                }
            })
            .on('touchmove', () => {
                this._touchMoved = true;
            })
            .on('touchstart', () => {
                this._touchMoved = false;
            })


        $(window).on('resize', this._resizeHandler)
    }

    componentWillUnmount() {
        this._removeListeners();
    }

    render() {
        const _plus = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#plus"/>'


        let {lesson, playerController} = this.props;
        let _number = getLessonNumber(lesson);
        _number = lesson.Parent ? (_number + ' ') : (_number + '. ');

        let _fonts = this._getFonts(),
            _visible = playerController.mode === PLAYER_CONTROLLER_MODE.COVER

        const _coverStyle = {
            backgroundImage: "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + lesson.Cover + ")",
            display: _visible ? "flex" : 'none'
        }

        return <div className="cover-block" style={_coverStyle}>
            {playerController.config.cover.bookmark && playerController.getBookmarkButton()}
            <div className="lesson-info-frame" >
                <div className="lecture-frame__header">
                        { !this.props.isMain &&
                        <button type="button" className="lecture-frame__plus">
                                <span className="lecture-frame__plus-icon">
                                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _plus}}/>
                                </span>
                            <span className="lecture-frame__plus-text">Доп. эпизод</span>
                        </button>}
                        <h2 className="lecture-frame__title font-universal__body-large _white-secondary">
                            <span className="lecture-frame__duration">{lesson.DurationFmt}</span>
                            {playerController.getPlayButton()}
                            <p className="title-paragraph">
                                <span className="number font-universal__title-medium _white-secondary">{_number}</span>
                                <span className={`title-text ${_fonts.title} _white`}>
                                    {lesson.Name + '\n'}
                                </span>
                            </p>
                        </h2>
                        <div className="lecture-frame__text-block">
                            <p className={`lecture-frame__descr ${_fonts.descr} _white`}>{lesson.ShortDescription}</p>
                            {
                                lesson.Author &&
                                <Link to={'/autor/' + lesson.Author.URL}>
                                    <p className={"lecture-frame__author _white " + _fonts.descr}>{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</p>
                                </Link>
                            }

                        </div>
                    {playerController.config.cover.tests && playerController.getTestsButtons()}
                    {playerController.config.cover.socialBlock && playerController.getSocialBlock()}
                </div>
                {playerController.config.cover.progress && playerController.getProgressBar()}
            </div>
        </div>
    }

    _removeListeners() {
        $('.js-player').unbind(this._touchEventName);
        $('.js-player').unbind('touchmove');
        $('.js-player').unbind('touchstart');
        $(window).unbind('resize', this._resizeHandler);
    }

    _play() {
        if (this.props.playerController) {
            this.props.playerController.initPlayer()
        }
    }

    _getFonts() {
        const _isPhone = (($(window).height() <= 414) || ($(window).width() <= 414))

        return _isPhone ?
            {
                title: "font-universal__title-medium",
                descr: "font-universal__body-large"
            } :
            {
                title: "font-universal__title-large",
                descr: "font-universal__book-large"
            }
    }
}