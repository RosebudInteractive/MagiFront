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
 import GiftButton from "../../../billing/gift-button";
 import BillingBlock from "./billing-block";
 import ReviewButton from "./review-button";
 import {localSettingsSelector} from "ducks/app";
 import AvailabilityTitle from "./availability-title";

const FIXED_BLOCK_MARGIN_TOP = 58

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

                if (this.state.onBottom) {
                    this.setState({
                        onBottom: false
                    })
                }

                _resetPlayBlockSize()

                return
            }

            _setPlayBlockSize();

            let _windowScrollTop = $(window).scrollTop();

            let _statDiv = $('.course-page__statistic'),
                _wrapper = $('.course-page__statistic-wrapper'),
                _footer = $('.page-footer')

            if (!_wrapper || !_wrapper.length) return;

            let _statDivTop = _statDiv.offset().top - this.props.localSettings.appWrapperTop,
                _innerDivTop = _wrapper.offset().top - this.props.localSettings.appWrapperTop,
                _innerDivHeight = _wrapper.innerHeight(),
                _divTop = this.state.fixed ? _statDivTop : _innerDivTop,
                _footerTop = _footer.offset().top - this.props.localSettings.appWrapperTop

            const _newState = {}

            if (_windowScrollTop < (_divTop - FIXED_BLOCK_MARGIN_TOP)){
                _newState.fixed = false
            }

            if ((_windowScrollTop >= (_divTop - FIXED_BLOCK_MARGIN_TOP)) && !this.state.onBottom) {
                _newState.fixed = true
            }

            if ((_footerTop - (_innerDivHeight + FIXED_BLOCK_MARGIN_TOP) <  _windowScrollTop) && !this.state.onBottom) {
                _newState.onBottom = true
                _newState.fixed = false
            }

            if ((_footerTop - (_innerDivHeight + FIXED_BLOCK_MARGIN_TOP) > _windowScrollTop) && this.state.onBottom) {
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
            _isBought = course && (!course.IsPaid || course.IsGift || course.IsBought),
            _showProgress = course &&
                (course.IsPaid && course.IsBought) ||
                ((!course.IsPaid || course.IsGift) && course.statistics.lessons.finishedLessons || course.statistics.tests.completed)

        const _style = (this.state.fixed && this.props.localSettings.appWrapperTop) ? {top : this.props.localSettings.appWrapperTop} : null

        return <div className={"course-page__statistic" + (_isBought ? " _bought" : "")}>
            <div className={"course-page__statistic-wrapper" + (this.state.fixed ? " _fixed" : "") + (this.state.onBottom ? " _bottom" : "")} style={_style}>
                {
                    _isBought ?
                        <React.Fragment>
                            <div className="bought-course__buttons-block">
                                <ReviewButton course={course}/>
                                <GiftButton course={course} alwaysVisible={true}/>
                            </div>
                            <div className="statistic__play-block">
                                <div className="play-block__wrapper">
                                    <PlayBlock course={course} lesson={_lastListenedLesson} cover={_cover} isAdmin={isAdmin}/>
                                </div>
                                {
                                    _hasListened ?
                                        <div className="play-block__info-wrapper">
                                            <div className="info-wrapper__title _full">???????????????????? ????????????????:</div>
                                            <div className="info-wrapper__title _short">???????????????????? ????????????????</div>
                                            <div className="info-wrapper__lesson">{_lastListenedLesson.Number + '. ' + _lastListenedLesson.Name}</div>
                                        </div>
                                        :
                                        <div className="play-block__info-wrapper">
                                            <div className="info-wrapper__title">???????????????? ????????????</div>
                                        </div>
                                }
                            </div>
                            {
                                _showProgress ?
                                    <Progress course={course}/>
                                    :
                                    <Data course={course}/>
                            }
                            <SocialBlock shareUrl={shareUrl} counter={course.ShareCounters}/>
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <BillingBlock course={course}/>
                            <Data course={course}/>
                            {
                                _freeLesson ?
                                    <div className="statistic__play-block _free-lesson">
                                        <div className="play-block__wrapper">
                                            <PlayBlock course={course} lesson={_freeLesson} cover={_freeLessonCover} isAdmin={isAdmin}/>
                                        </div>
                                        <div className="play-block__info-wrapper">
                                            <div className="info-wrapper__title _full">???????????????? ???????????????????? ????????????:</div>
                                            <div className="info-wrapper__title _short">???????????????? ???????????????????? ????????????</div>
                                            <div className="info-wrapper__lesson">{_freeLesson.Number + '. ' + _freeLesson.Name}</div>
                                        </div>
                                    </div>
                                    :
                                    null
                            }
                            <SocialBlock shareUrl={shareUrl} counter={course.ShareCounters}/>

                        </React.Fragment>
                }
            </div>
        </div>
    }

    _addEventListeners() {
        $(window).bind('resize scroll ext-info-hidden', this._handleScroll)
    }

    _removeEventListeners() {
        $(window).unbind('resize scroll ext-info-hidden', this._handleScroll)
    }
}

function _setPlayBlockSize() {
    const _wrapper = $('.statistic__play-block'),
        _playBlockWrapper = $('.play-block__wrapper'),
        _playBlock = $('.play-block'),
        _image = $('.play-block__image-wrapper')

    let _size = _wrapper.width() / 3

    _playBlockWrapper.width(_size).height(_size)
    _playBlock.width(_size).height(_size)
    _image.width(_size).height(_size)


}

 function _resetPlayBlockSize() {
     const _playBlockWrapper = $('.play-block__wrapper'),
         _playBlock = $('.play-block'),
         _image = $('.play-block__image-wrapper')

     _playBlockWrapper.width("").height("")
     _playBlock.width("").height("")
     _image.width("").height("")
 }

function mapStateToProps(state,) {
    return {
        isAdmin: !!state.user.user && state.user.user.isAdmin,
        localSettings: localSettingsSelector(state),
    }
}

export default connect(mapStateToProps)(Statistic)
