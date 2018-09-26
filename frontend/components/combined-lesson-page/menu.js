import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import * as appActions from '../../actions/app-actions';
import * as playerActions from "../../actions/player-actions";

import LessonsListWrapper from './lessons-list-wrapper';
import $ from "jquery";


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
            _courseUrl = course ? course.URL : '',
            _total = lessons.object.length,
            _type = this._getMenuType(),
            _menuClassName = "lectures-menu _plain-menu js-lectures-menu js-plain-menu " + _type +
                (isLessonMenuOpened ? ' opened' : '') +
                (isMobileApp ? ' mobile' : ' desktop') +
                (extClass ? ' ' + extClass : '')

        return (
            <div
                className={_menuClassName}>
                <LogoAndTitle courseTitle={_courseTitle} courseUrl={_courseUrl}/>
                <ListBlock total={_total}
                           courseUrl={_courseUrl}
                           {...this.props}/>
                <button className="lectures-menu__fullscreen fullscreen-btn js-adjust" type="button"
                        onClick={::this._onFullScreenClick}>
                    <svg width="60" height="53" dangerouslySetInnerHTML={{__html: _fullscreen}}/>
                </button>
                <Navigation isNeedHideRefs={this.props.isNeedHideRefs} episodes={this.props.episodes}/>
            </div>
        )
    }
}


class LogoAndTitle extends React.Component {

    static propTypes = {
        courseTitle: PropTypes.string,
        courseUrl: PropTypes.string,
    };

    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"/>';

        return (
            <div className="lectures-menu__section">
                <Link to={'/'} className="logo-min">
                    <svg width="75" height="40" dangerouslySetInnerHTML={{__html: _logoMob}}/>
                </Link>
                <Link to={'/category/' + this.props.courseUrl} className="lectures-menu__link-back">
                    <div className="icon">
                        <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _linkBack}}/>
                    </div>
                    <span><span className="label">Курс:</span>{' ' + this.props.courseTitle}</span>
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
        return (
            <div className="lectures-menu__section lectures-list-block">
                <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                        onClick={::this._switchMenu}><span className='caption'>Лекция </span>
                    <span className="num"><span
                        className="current">{this.props.lesson.Number}</span>{'/' + this.props.total}</span></button>
                <LessonsListWrapper {...this.props}/>
            </div>
        )
    }
}

class Navigation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            showToc: false,
        }

        this._resizeHandler = () => {
            let _list = $('.section-nav__list');


        }
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

                           let position = $("#" + _id).offset().top - 75;

                           $("body, html").animate({
                               scrollTop: position
                           }, 600);
                       }}>{item.Topic}</a>
                </li>
            })
        })
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
        let scrollTarget = $('#recommend').offset().top;

        $("body, html").animate({
            scrollTop: scrollTarget
        }, 600);
    }

    _onLinkMockClick(e) {
        e.preventDefault()
    }

    componentDidUpdate(prevProps, prevState) {


        if ((!prevState.showToc) && (this.state.showToc)) {
            // $('body').addClass('overflow');

            // let _control = $("#lesson-" + this.props.active);
            // if (_control.length > 0) {
            //     let _list = $(".lectures-list-wrapper"),
            //         _listCurrentScrollPosition = _list.scrollTop(),
            //         _listOffsetPosition = _list.offset().top,
            //         _itemOffsetPosition = _control.offset().top - _listOffsetPosition,
            //         _itemCurrentScrollPosition = _control.scrollTop();
            //
            //     if (_itemCurrentScrollPosition - _itemOffsetPosition !== 0) {
            //         _list.scrollTop(_listCurrentScrollPosition + _itemOffsetPosition)
            //     }
            // }

        }

        if ((prevState.showToc) && (!this.state.showToc)) {
            // $('body').removeClass('overflow');
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
                    <span className="visually-hidden">Меню</span>
                    <svg width="4" height="18" dangerouslySetInnerHTML={{__html: _dots}}/>
                </button>
                <div className={"section-nav__list" + (isNeedHideRefs ? ' single' : '')}>
                    <ul className={"section-nav-list" + (isNeedHideRefs ? ' single' : '')}>
                        <li className={"section-nav-list__item js-section-menu-control" + (this.state.showToc ? ' expanded' : '')}onClick={::this._switchToc}>
                            <a href="#transcript" className="section-nav-list__item-head js-scroll-link" onClick={::this._onLinkMockClick}>Транскрипт</a>
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
                                       onClick={::this._onLinkMockClick}>Литература</a>
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);