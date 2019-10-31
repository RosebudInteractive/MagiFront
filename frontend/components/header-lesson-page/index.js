import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import LogoAndTitle from "./childs/logo-and-title";
import Navigator from "./childs/navigator";
import MenuBlock from "./childs/menu-block"

import $ from "jquery";

class HeaderWrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
    };

    constructor(props) {
        super(props)
    }

    _getMenuType() {
        let _scrollTop = $(window).scrollTop();

        return (_scrollTop > ($('.js-player').outerHeight() - 53)) ? '_fixed' : '_dark';
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
    }

    render() {
        const FULLSCREEN = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen-n"/>';

        let {course, lesson, isLessonMenuOpened, isMobileApp, extClass,} = this.props,
            _singleLesson = course ? !!course.OneLesson : false,
            _type = this._getMenuType(),
            _menuClassName = "lectures-menu _plain-menu js-lectures-menu js-plain-menu " + _type +
                (isLessonMenuOpened ? ' opened' : '') +
                (isMobileApp ? ' mobile' : ' desktop') +
                (extClass ? ' ' + extClass : '') +
                (_singleLesson ? ' ' + '_single' : '')

        const _courseIsPaid = course ? (course.IsPaid && !course.IsGift && !course.IsBought) : false

        return (
            <div className={_menuClassName}>
                <LogoAndTitle lesson={lesson}/>
                <MenuBlock lesson={lesson}/>
                <button className="lectures-menu__fullscreen fullscreen-btn js-adjust" type="button"
                        onClick={::this._onFullScreenClick}>
                    <svg width="60" height="53" dangerouslySetInnerHTML={{__html: FULLSCREEN}}/>
                </button>
                <Navigator isNeedHideRefs={this.props.isNeedHideRefs} episodes={this.props.episodes} courseIsPaid={_courseIsPaid}/>
                <div className='lectures-menu__gradient-block'/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        isMobileApp: state.app.isMobileApp,
        course: state.singleLesson.course,
        isLessonMenuOpened: state.app.isLessonMenuOpened,
        // contentArray: state.player.contentArray,
        // menuId: state.app.menuId,
        // showContentTooltip: state.player.showContentTooltip,
        // showSpeedTooltip: state.player.showSpeedTooltip,
    }
}

export default connect(mapStateToProps,)(HeaderWrapper);