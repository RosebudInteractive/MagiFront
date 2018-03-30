import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'

import * as appActions from '../../actions/app-actions';

import LessonsListWrapper from './lessons-list-wrapper';
// import * as Player from '../../components/player/nested-player';

class Menu extends React.Component {

    constructor(props) {
        super(props);
    }


    static propTypes = {
        current: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
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

    _hideMenu() {
        $('#fp-nav').toggleClass('hide');
    }

    _showNavigationMenu() {
        $('#fp-nav').removeClass('hide');
    }

    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>';

        let {course, lessons} = this.props,
            _courseTitle = course ? course.Name : '',
            _courseUrl = course ? course.URL : '',
            _total = lessons.object.length;

        return (
            <div className={"lectures-menu js-lesson-menu _dark" + (this.props.isLessonMenuOpened ? ' opened' : '')} id={this.props.id} style={this.props.isMain ? null : {display: 'none'}}>
                <div className="lectures-menu__section">
                    <Link to={'/'} className="logo-min">
                        <svg width="75" height="40" dangerouslySetInnerHTML={{__html: _logoMob}}/>
                    </Link>
                    <Link to={'/category/' + _courseUrl} className="lectures-menu__link-back">
                        <div className="icon">
                            <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _linkBack}}/>
                        </div>
                        <span><span className="label">Курс:</span>{' ' + _courseTitle}</span>
                    </Link>
                </div>
                <div className="lectures-menu__section lectures-list-block">
                    <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                            onClick={::this._switchMenu}><span>Лекция </span>
                        <span className="num"><span
                            className="current">{this.props.current}</span>{'/' + _total}</span></button>
                    <LessonsListWrapper {...this.props}/>
                </div>

            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        lessons: state.lessons,
        course: state.singleLesson.course,
        isLessonMenuOpened: state.app.isLessonMenuOpened,
        menuId: state.app.menuId,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
