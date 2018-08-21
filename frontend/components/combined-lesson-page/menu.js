import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'

import * as appActions from '../../actions/app-actions';
import * as playerActions from "../../actions/player-actions";

import LessonsListWrapper from './lessons-list-wrapper';


class Menu extends React.Component {



    render() {
        const _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen-n"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>';


        let {course, lessons} = this.props,
            _courseTitle = course ? course.Name : '',
            _courseUrl = course ? course.URL : '',
            _total = lessons.object.length;

        return (
            <div className="lectures-menu _plain-menu js-lectures-menu js-plain-menu _dark">
                <LogoAndTitle courseTitle={_courseTitle} courseUrl={_courseUrl}/>
                <ListBlock total={_total} {...this.props}/>

                <button className="lectures-menu__fullscreen fullscreen-btn js-adjust" type="button">
                    <svg width="60" height="53" dangerouslySetInnerHTML={{__html: _fullscreen}}/>
                </button>
                <Navigation/>
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

        return(
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

    render() {
        return (
            <div className="lectures-menu__section lectures-list-block">
                <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                        onClick={::this._switchMenu}><span className='caption'>Лекция </span>
                    <span className="num"><span
                        className="current">{this.props.current}</span>{'/' + this.props.total}</span></button>
                <LessonsListWrapper {...this.props}/>
            </div>
        )
    }
}

class Navigation extends React.Component {

    render() {
        return(
            <section class="lectures-menu__section section-nav js-section-nav">
                <button class="section-nav__trigger js-section-nav-trigger">
                    <span class="visually-hidden">Меню</span>
                    <svg width="4" height="18">
                        <use xlink:href="#dots"></use>
                    </svg>
                </button>
                <div class="section-nav__list">
                    <ul class="section-nav-list">
                        <li class="section-nav-list__item js-section-menu-control">
                            <a href="#transcript" class="section-nav-list__item-head js-scroll-link">Транскрипт</a>
                            <ol class="section-nav-sublist">
                                <li class="section-nav-sublist__item current">
                                    <a href="#" class="section-nav-sublist__link">«К чему эти смехотворные чудовища?»</a>
                                </li>
                                <li class="section-nav-sublist__item">
                                    <a href="#" class="section-nav-sublist__link">Строгие формы аббатства Фонтене</a>
                                </li>
                                <li class="section-nav-sublist__item">
                                    <a href="#" class="section-nav-sublist__link">Танцующие и плачущие святые</a>
                                </li>
                                <li class="section-nav-sublist__item">
                                    <a href="#" class="section-nav-sublist__link">«Эпоха образа до эпохи искусства»</a>
                                </li>
                                <li class="section-nav-sublist__item">
                                    <a href="#" class="section-nav-sublist__link">Категория стиля</a>
                                </li>
                                <li class="section-nav-sublist__item">
                                    <a href="#" class="section-nav-sublist__link">Стиль и политика</a>
                                </li>
                            </ol>
                        </li>
                        <li class="section-nav-list__item">
                            <a href="#recommend" class="section-nav-list__item-head js-scroll-link">Литература</a>
                        </li>
                    </ul>
                </div>
            </section>
        )
    }
}

function mapStateToProps(state) {
    return {
        lessons: state.lessons,
        course: state.singleLesson.course,
        isLessonMenuOpened: state.app.isLessonMenuOpened,
        contentArray: state.player.contentArray,
        menuId: state.app.menuId,
        showContentTooltip: state.player.showContentTooltip,
        showSpeedTooltip: state.player.showSpeedTooltip,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerActions: bindActionCreators(playerActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);