import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import * as appActions from '../../actions/app-actions';
import * as playerActions from "../../actions/player-actions";

import LessonsListWrapper from './lessons-list-wrapper';
import $ from "jquery";
import {getLessonNumber, OverflowHandler} from "../../tools/page-tools";
import {notifyCourseLinkClicked} from "ducks/google-analytics";


class Menu extends React.Component {
    constructor(props) {
        super(props)
    }

    _getMenuType() {
        let _scrollTop = $(window).scrollTop();

        let _type = (_scrollTop > ($('.js-player').outerHeight() - 53)) ? '_fixed' : '_dark';
        return _type;
    }

    _onFullScreenClick() {
        let _wrapper = $(".global-wrapper"),
            _player = $('.js-player'),

            _wrapperCurrentScrollPosition = _wrapper.scrollTop(),
            _wrapperOffsetPosition = _wrapper.offset().top,
            _playerOffsetPosition = _player.offset().top - _wrapperOffsetPosition,
            _scroll = _wrapperCurrentScrollPosition + _playerOffsetPosition;

        $('html, body').animate({
            scrollTop: _scroll
        }, 600);
        // if (this.props.showSizeInfo) {
        //     this.props.appActions.hideSizeInfo()
        // } else {
        //     this.props.appActions.showSizeInfo()
        // }
    }

    render() {
        const _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen-n"/>';

        let {course, lessons, isLessonMenuOpened, isMobileApp, extClass} = this.props,
            _courseTitle = course ? course.Name : '',
            _singleLesson = course ? !!course.OneLesson : false,
            _courseUrl = course ? course.URL : '',
            _total = lessons.object.length,
            _type = this._getMenuType(),
            _menuClassName = "lectures-menu _plain-menu js-lectures-menu js-plain-menu " + _type +
                (isLessonMenuOpened ? ' opened' : '') +
                (isMobileApp ? ' mobile' : ' desktop') +
                (extClass ? ' ' + extClass : '') +
                (_singleLesson ? ' ' + '_single' : '')

        const _courseIsPaid = course ? (course.IsPaid && !course.IsGift && !course.IsBought) : false

        return (
            <div className={_menuClassName}>
                <LogoAndTitle courseTitle={_courseTitle} courseUrl={_courseUrl} onLinkClick={this.props.notifyCourseLinkClicked} analyticsInfo={{
                    Id: this.props.course.Id,
                    Name: this.props.course.Name,
                    category: this.props.course.Categories[0].Name,
                    author: this.props.lesson.Author.FirstName + ' ' + this.props.lesson.Author.LastName,
                    price: this.props.course.IsPaid ? (this.props.course.DPrice ? this.props.course.DPrice : this.props.course.Price) : 0
                }}/>
                <ListBlock total={_total}
                           courseUrl={_courseUrl}
                           {...this.props}/>
                <button className="lectures-menu__fullscreen fullscreen-btn js-adjust" type="button"
                        onClick={::this._onFullScreenClick}>
                    <svg width="60" height="53" dangerouslySetInnerHTML={{__html: _fullscreen}}/>
                </button>
                <Navigation isNeedHideRefs={this.props.isNeedHideRefs} episodes={this.props.episodes} courseIsPaid={_courseIsPaid}/>
                <div className='lectures-menu__gradient-block'/>
            </div>
        )
    }
}


class LogoAndTitle extends React.Component {

    static propTypes = {
        courseTitle: PropTypes.string,
        courseUrl: PropTypes.string,
        onLinkClick: PropTypes.func,
        analyticsInfo: PropTypes.object,
    };

    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"/>';

        return (
            <div className="lectures-menu__section">
                <Link to={'/'} className="logo-min">
                    <svg width="75" height="40" dangerouslySetInnerHTML={{__html: _logoMob}}/>
                </Link>
                <Link to={'/category/' + this.props.courseUrl} className="lectures-menu__link-back" onClick={() => {
                    this.props.onLinkClick(this.props.analyticsInfo)
                }}>
                    <div className="icon">
                        <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _linkBack}}/>
                    </div>
                    <span><span className="label">????????:</span>{' ' + this.props.courseTitle}</span>
                </Link>
            </div>
        )
    }
}

class ListBlock extends React.Component {

    static propTypes = {
        total: PropTypes.number,
    };

    componentWillUnmount() {
        this.props.appActions.hideLessonMenu()
    }

    _switchMenu() {
        if (this.props.isLessonMenuOpened) {
            this.props.appActions.hideLessonMenu()
        } else {
            this.props.appActions.showLessonMenu()
        }
    }

    render() {
        let {lesson, total} = this.props,
            _number = getLessonNumber(lesson)

        return (
            <div className="lectures-menu__section lectures-list-block">
                <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                        onClick={::this._switchMenu}><span className='caption'>???????????? </span>
                    <span className="num"><span
                        className="current">{_number}</span>{'/' + total}</span></button>
                <LessonsListWrapper {...this.props}/>
            </div>
        )
    }
}

class Navigation extends React.Component {

    static propTypes = {
        isNeedHideRefs: PropTypes.bool,
        episodes: PropTypes.array,
        courseIsPaid: PropTypes.bool
    }


    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            showToc: false,
        }
    }

    componentDidMount() {
        $(window).on('resize', ::this._toggleScrollableStyle)
    }

    componentWillUnmount() {
        $(window).unbind('resize', ::this._toggleScrollableStyle)
    }


    _hasToc() {
        let {episodes} = this.props;

        return episodes && episodes.some((episode) => {
            return (episode.Toc && episode.Toc.length)
        })
    }

    _getList() {
        if (!this.props.episodes) {
            return
        }

        return this.props.episodes.map((episode) => {
            return episode.Toc.map((item) => {
                const _id = 'toc' + item.Id;

                return <li className="section-nav-sublist__item current" key={_id}>
                    <a href={"#" + _id} className="section-nav-sublist__link"
                       onClick={(e) => {
                           e.preventDefault();
                           this._closeMenu();

                           let _item = $("#" + _id)
                           if (!_item || !_item.length) {
                               if (this.props.courseIsPaid) {
                                    this._scrollToPriceButton()
                               }

                               return
                           }

                           let position = _item.offset().top - 75;

                           $("body, html").animate({
                               scrollTop: position
                           }, 600);
                       }}>{item.Topic}</a>
                </li>
            })
        })
    }

    _scrollToPriceButton() {
        const _priceBlock = ($('.course-module__price-block'))

        if (_priceBlock && (_priceBlock.length)) {
            let _elemOffset = _priceBlock.offset().top,
                _elemHeight = _priceBlock.height()

            const _offset = _elemOffset - (($(window).height() / 2) - (_elemHeight / 2))

            $("body, html").animate({
                scrollTop: _offset
            }, 600);
        }
    }


    _closeMenu() {
        let _isMobile = window.innerWidth <= 899

        if (_isMobile) {
            this.setState({
                expanded: false
            })
        } else {
            this.setState({showToc: false})
        }
    }

    _switchToc(e) {
        if (this.state.showToc) {
            let _isToc = e.target.closest('.section-nav-sublist');
            if (!_isToc) {
                this.setState({showToc: false})
            }
        } else {
            if (!this._hasToc()) {
                let scrollTarget = $('#transcript').offset().top;

                $("body, html").animate({
                    scrollTop: scrollTarget
                }, 600);
            } else {
                this.setState({showToc: true})
            }
        }
    }

    _onTriggerClick() {
        this.setState({expanded: !this.state.expanded})
    }

    _onRecommendedClick() {
        let scrollTarget = $('#recommend').offset().top - 10;

        $("body, html").animate({
            scrollTop: scrollTarget
        }, 600);
    }

    _onLinkMockClick(e) {
        e.preventDefault()
    }

    componentDidUpdate(prevProps, prevState) {
        if ((prevState.showToc !== this.state.showToc) || (prevState.expanded !== this.state.expanded)) {
            this._toggleScrollableStyle()
        }
    }

    _toggleScrollableStyle() {
        let _isMobile = window.innerWidth <= 899,
            _menu =  _isMobile ? $('.section-nav__list') : $('.section-nav-sublist');

        if (_isMobile && !this.state.expanded) {
            OverflowHandler.turnOff();
            // $('body').removeClass('overflow');
            _menu.removeClass('scroll');
            return
        }

        if (_menu && _menu.length > 0) {
            let _menuTop = _menu.position().top,
                _menuBottom = _menuTop + _menu.height();

            if (_menuBottom > window.innerHeight) {
                OverflowHandler.rememberScrollPos();
                if (this.state.expanded) {
                    OverflowHandler.turnOn();
                }
                _menu.addClass('scroll');
            } else {
                OverflowHandler.turnOff();
                // $('body').removeClass('overflow');
                _menu.removeClass('scroll');
            }
        }
    }

    render() {
        let {isNeedHideRefs} = this.props,
            _sectionClassName = "lectures-menu__section section-nav js-section-nav" +
                (this.state.expanded ? ' expanded' : '')

        const _dots = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#dots"/>';

        return (
            <section className={_sectionClassName}>
                <button className="section-nav__trigger js-section-nav-trigger" onClick={::this._onTriggerClick}>
                    <span className="visually-hidden">????????</span>
                    <svg width="4" height="18" dangerouslySetInnerHTML={{__html: _dots}}/>
                </button>
                <div className={"section-nav__list" + (isNeedHideRefs ? ' single' : '')}>
                    <ul className={"section-nav-list" + (isNeedHideRefs ? ' single' : '')}>
                        <li className={"section-nav-list__item js-section-menu-control" + (this.state.showToc ? ' expanded' : '')}
                            onClick={::this._switchToc}>
                            <a href="#transcript" className="section-nav-list__item-head js-scroll-link"
                               onClick={::this._onLinkMockClick}>????????????????????</a>
                            <ol className={"section-nav-sublist" + (this.state.showToc ? ' show' : '')}>
                                {this._getList()}
                            </ol>
                        </li>
                        {
                            isNeedHideRefs
                                ?
                                null
                                :
                                <li className="section-nav-list__item" onClick={::this._onRecommendedClick}>
                                    <a href="#recommend" className="section-nav-list__item-head js-scroll-link"
                                       onClick={::this._onLinkMockClick}>????????????????????</a>
                                </li>
                        }

                    </ul>
                </div>
            </section>
        )
    }
}

function mapStateToProps(state) {
    return {
        isMobileApp: state.app.isMobileApp,
        lessons: state.lessons,
        course: state.singleLesson.course,
        isLessonMenuOpened: state.app.isLessonMenuOpened,
        contentArray: state.player.contentArray,
        menuId: state.app.menuId,
        showContentTooltip: state.player.showContentTooltip,
        showSpeedTooltip: state.player.showSpeedTooltip,
        showSizeInfo: state.app.showSizeInfo,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerActions: bindActionCreators(playerActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
        notifyCourseLinkClicked: bindActionCreators(notifyCourseLinkClicked, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);