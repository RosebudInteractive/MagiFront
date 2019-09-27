import React from 'react'
import PropTypes from 'prop-types'
import './statistic.sass'
import PlayBlock from "../../../common/play-block";
import {getCoverPath, ImageSize} from "tools/page-tools";
import Progress from './progress'
import $ from "jquery";
import {isMobile} from "tools/page-tools";
import PriceBlock from "../../../common/price-block";
import Data from "./data";
import {connect} from "react-redux";
import {SocialBlock} from "./social-block";

class Statistic extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        shareUrl: PropTypes.string
    }

    constructor(props) {
        super(props)

        this.state = {
            onBottom: false,
            fixed : false
        }


        this._handleScroll = function() {
            if (isMobile()) {
                if (this.state.fixed) {
                    this.setState({
                        fixed: false
                    })
                }

                return
            }

            let _windowScrollTop = $(window).scrollTop();

            let _statDiv = $('.course-page__statistic'),
                _wrapper = $('.course-page__statistic-wrapper'),
                _footer = $('.page-footer')

            if (!_wrapper || !_wrapper.length) return;

            let _statDivTop = _statDiv.offset().top,
                _innerDivTop = _wrapper.offset().top,
                _innerDivHeight = _wrapper.innerHeight(),
                _divTop = this.state.fixed ? _statDivTop : _innerDivTop,
                _footerTop = _footer.offset().top

            const _newState = {}

            if (_windowScrollTop < (_divTop - 167)){
                _newState.fixed = false
            }

            if ((_windowScrollTop >= (_divTop - 167)) && !this.state.onBottom) {
                _newState.fixed = true
            }

            if ((_footerTop - (_innerDivHeight + 165) <  _windowScrollTop) && !this.state.onBottom) {
                _newState.onBottom = true
                _newState.fixed = false
            }

            if ((_footerTop - (_innerDivHeight + 165) > _windowScrollTop) && this.state.onBottom) {
                _newState.onBottom = false
                _newState.fixed = true
            }

            _newState.onBottom = _newState.hasOwnProperty("onBottom") ? _newState.onBottom : this.state.onBottom
            _newState.fixed = _newState.hasOwnProperty("fixed") ? _newState.fixed : this.state.fixed

            if ((this.state.onBottom !== _newState.onBottom) || (this.state.fixed !== _newState.fixed)) {
                this.setState(_newState)
            }
        }.bind(this)

        this._addEventListeners();
    }

    componentDidMount() {
        this._handleScroll();
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    render() {
        const {course, isAdmin, shareUrl} = this.props,
            _hasListened = course.statistics.lessons.hasListened,
            _lastListenedLesson = course.statistics.lessons.lastListened,
            _freeLesson = course.statistics.lessons.freeLesson

        if (typeof _lastListenedLesson.CoverMeta === "string") {
            _lastListenedLesson.CoverMeta = JSON.parse(_lastListenedLesson.CoverMeta)
        }

        const _cover = getCoverPath(_lastListenedLesson, ImageSize.small),
            _freeLessonCover = _freeLesson ? getCoverPath(_freeLesson, ImageSize.small) : null,
            _isBought = course && (!course.IsPaid || course.IsGift || course.IsBought)

        return <div className="course-page__statistic">
            <div className={"course-page__statistic-wrapper" + (this.state.fixed ? " _fixed" : "") + (this.state.onBottom ? " _bottom" : "")}>
                {
                    _isBought ?
                        <React.Fragment>
                            <div className="statistic__play-block">
                                <div className="play-block__wrapper">
                                    <PlayBlock course={course} lesson={_lastListenedLesson} cover={_cover} isAdmin={isAdmin}/>
                                </div>
                                {
                                    _hasListened ?
                                        <div className="play-block__info-wrapper">
                                            <div className="info-wrapper__title _full">Продолжить смотреть:</div>
                                            <div className="info-wrapper__title _short">Продолжить смотреть</div>
                                            <div className="info-wrapper__lesson">{_lastListenedLesson.Number + '. ' + _lastListenedLesson.Name}</div>
                                        </div>
                                        :
                                        <div className="play-block__info-wrapper">
                                            <div className="info-wrapper__title">Смотреть сейчас</div>
                                        </div>
                                }
                            </div>
                            <Progress course={course}/>
                            <SocialBlock shareUrl={shareUrl} counter={course.counter}/>
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <PriceBlock course={course}/>
                            <Data course={course}/>
                            <SocialBlock shareUrl={shareUrl} counter={course.counter}/>
                            {
                                _freeLesson ?
                                    <div className="statistic__play-block _free-lesson">
                                        <div className="play-block__wrapper">
                                            <PlayBlock course={course} lesson={_freeLesson} cover={_freeLessonCover} isAdmin={isAdmin}/>
                                        </div>
                                        <div className="play-block__info-wrapper">
                                            <div className="info-wrapper__title _full">Смотреть бесплатную лекцию:</div>
                                            <div className="info-wrapper__title _short">Смотреть бесплатную лекцию</div>
                                            <div className="info-wrapper__lesson">{_freeLesson.Number + '. ' + _freeLesson.Name}</div>
                                        </div>
                                    </div>
                                    :
                                    null
                            }

                        </React.Fragment>
                }
            </div>
        </div>
    }

    _addEventListeners() {
        $(window).bind('resize scroll', this._handleScroll)
    }

    _removeEventListeners() {
        $(window).unbind('resize scroll', this._handleScroll)
    }
}

function mapStateToProps(state,) {
    return {
        isAdmin: !!state.user.user && state.user.user.isAdmin,
    }
}

export default connect(mapStateToProps)(Statistic)