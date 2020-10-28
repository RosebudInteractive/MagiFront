import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import LogoAndTitle from "./childs/logo-and-title";
import Navigator from "./childs/navigator";
import MenuBlock from "./childs/menu-block"

import {courseSelector} from "ducks/lesson-menu"

import $ from "jquery";
import RestartButton from "./restart-test-button";
import {SVG} from "tools/svg-paths";

import "./header-lesson-page.sass"
import SwitchButtons from "./switch-buttons";

class HeaderWrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        test: PropTypes.object,
        active: PropTypes.number,
        showRestartButton: PropTypes.bool,
        isPlayerMode: PropTypes.bool,
    };

    constructor(props) {
        super(props)

        this.state = {
            hiding: false,
            type: props.lesson ? "_fixed" : props.test ? "_dark" : "_fixed"
        }

        this._handleScroll = () => {
            const _scrollTop = $(window).scrollTop();

            if ($('.js-player').length) {
                let _height = $('.js-player').outerHeight(),
                    _menu = $('.js-lectures-menu');

                _height = this.props.isMobileApp ? _height : _height - _menu.height() ;

                if (_scrollTop > (_height + 63)) {
                    if (this.state.type === "_dark") {
                        this.setState({type: "_fixed"})
                    }
                } else {
                    if (this.state.type === "_fixed") {
                        this.setState({type: "_dark"})
                    }
                }
            }
        }
    }

    componentDidMount() {
        $(window).bind('scroll', this._handleScroll);
        this._handleScroll()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isLessonMenuOpened && !this.props.isLessonMenuOpened) {
            this.setState({hiding : true})
            setTimeout(() => {
                this.setState({
                    hiding : false
                })
            }, 700)
        }
    }

    componentWillUnmount() {
        $(window).unbind('scroll', this._handleScroll);
    }

    // _getMenuType() {
    //     let _scrollTop = $(window).scrollTop();
    //
    //     console.log(_scrollTop, $('.js-player').outerHeight())
    //
    //     this._currentType = (_scrollTop > ($('.js-player').outerHeight() - 63)) ? '_fixed' : '_dark'
    //     return this._currentType;
    // }

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
        let {course, lesson, test, isLessonMenuOpened, isMobileApp, extClass, showRestartButton, isPlayerMode} = this.props,
            {type, hiding} = this.state,
            _singleLesson = course ? !!course.OneLesson : false,
            _type = type,//this._getMenuType(),
            _menuClassName = "new-header lectures-menu _plain-menu js-lectures-menu js-plain-menu " + _type +
                (isLessonMenuOpened && !hiding ? ' opened' : '') +
                (hiding ? ' _hiding' : '') +
                (isMobileApp ? ' mobile' : ' desktop') +
                (extClass ? ' ' + extClass : '') +
                (_singleLesson ? ' ' + '_single' : '')

        const _courseIsPaid = course ? (course.IsPaid && !course.IsGift && !course.IsBought) : false

        return <div className={_menuClassName}>
                <LogoAndTitle course={course} lesson={lesson} test={test}/>
                <MenuBlock course={course} lesson={lesson} test={test}/>
                {!!test && showRestartButton && <RestartButton test={test}/>}
                {
                    lesson &&
                        <React.Fragment>
                            <button className="lectures-menu__fullscreen fullscreen-btn js-adjust" type="button"
                                    onClick={::this._onFullScreenClick}>
                                <svg width="60" height="53" dangerouslySetInnerHTML={{__html: SVG.FULLSCREEN}}/>
                            </button>
                            <SwitchButtons type={_type} isPlayerMode={isPlayerMode} lesson={lesson} course={course}/>
                            <Navigator isNeedHideRefs={this.props.isNeedHideRefs} episodes={this.props.episodes} courseIsPaid={_courseIsPaid}/>
                        </React.Fragment>
                }
                <div className='lectures-menu__gradient-block'/>
            </div>
    }
}

function mapStateToProps(state) {
    return {
        isMobileApp: state.app.isMobileApp,
        // course: state.singleLesson.course,
        isLessonMenuOpened: state.app.isLessonMenuOpened,
        course: courseSelector(state)
    }
}

export default connect(mapStateToProps,)(HeaderWrapper);