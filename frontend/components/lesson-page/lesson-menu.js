import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'

import * as appActions from '../../actions/app-actions';

import LessonsListWrapper from './lessons-list-wrapper';
import * as Player from '../../components/player/nested-player';

class Menu extends React.Component {

    constructor(props) {
        super(props);
    }


    static propTypes = {
        courseTitle: PropTypes.string.isRequired,
        courseUrl: PropTypes.string.isRequired,
        current: PropTypes.string.isRequired,
        active: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
        id: PropTypes.number.isRequired,
    };

    componentWillReceiveProps(nextProps) {
        if ((this.props.id === nextProps.menuId) && nextProps.isLessonMenuOpened) {
            this._hideMenu()
        } else {
            this._showNavigationMenu()
        }

        //     if (this.props.id === 'lesson-menu-' + nextProps.menuId) {
        //         this.props.appActions.finishHideLessonMenu();
        //     }
        // }
    }

    componentWillUnmount() {
        // let _menu = $('#' + this.props.id);
        //
        // if (_menu.length > 0) {
        //     _menu.removeClass('opened')
        // }
    }

    _switchMenu() {
        if (this.props.isLessonMenuOpened) {
            this.props.appActions.hideLessonMenu(this.props.id)
        } else {
            this.props.appActions.showLessonMenu(this.props.id)
        }
    }

    _hideMenu() {
        $('#fp-nav').toggleClass('hide');
        // $('.small-player-frame').toggleClass('hide');
    }

    _showNavigationMenu() {
        $('#fp-nav').removeClass('hide');

        // let _player = Player.getInstance();
        // let _isSmallPlayerIsVisible = (_player && !_player._isFull)
        // if (_isSmallPlayerIsVisible) {
        //     $('.small-player-frame').removeClass('hide');
        // }
    }

    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>';

        return (
            <div className={"lectures-menu js-lesson-menu _dark" + (this.props.isLessonMenuOpened ? ' opened' : '')} id={this.props.id} style={this.props.isMain ? null : {display: 'none'}}>
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
                <div className="lectures-menu__section lectures-list-block">
                    <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                            onClick={::this._switchMenu}><span>Лекция </span>
                        <span className="num"><span
                            className="current">{this.props.current}</span>{'/' + this.props.total}</span></button>
                    <LessonsListWrapper {...this.props}/>
                </div>

            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
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
