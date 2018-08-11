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

    constructor(props) {
        super(props);
    }

    static propTypes = {
        current: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
    };

    componentDidMount() {
        $(document).mouseup((e) => {
            let _isContent = e.target.closest('.js-contents'),
                _isRate = e.target.closest('.js-speed'),
                _isPlayerButton = e.target.closest('.player-button');

            if (_isContent || _isRate || _isPlayerButton) {
                return
            }

            this._hideContentTooltip = this.props.showContentTooltip;
            this._hideRateTooltip = this.props.showSpeedTooltip;
            if (this._hideContentTooltip) {
                this.props.playerActions.hideContentTooltip()
            }
            if (this._hideRateTooltip) {
                this.props.playerActions.hideSpeedTooltip()
            }
        });
    }

    componentWillUnmount() {
        this.props.appActions.hideLessonMenu()
    }

    componentDidUpdate() {
        if (this.props.isLessonMenuOpened || this.props.showContentTooltip || this.props.showSpeedTooltip) {
            this._hideNavigationButtons()
        } else {
            this._showNavigationButtons()
        }
    }

    _switchMenu() {
        if (this.props.isLessonMenuOpened) {
            this.props.appActions.hideLessonMenu()
        } else {
            this.props.appActions.showLessonMenu()
        }
    }

    _hideNavigationButtons() {
        $('#fp-nav').addClass('hide');
    }

    _showNavigationButtons() {
        $('#fp-nav').removeClass('hide');
    }

    _openRate() {
        if (!this._hideRateTooltip) {
            this._hideNavigationButtons()
            this.props.playerActions.showSpeedTooltip()
        } else {
            this._hideRateTooltip = false
            this._showNavigationButtons()
            this.props.playerActions.hideSpeedTooltip()
        }
    }

    _openContent() {
        if (!this._hideContentTooltip) {
            this._hideNavigationButtons()
            this.props.playerActions.showContentTooltip()
        } else {
            this._hideContentTooltip = false
            this.props.playerActions.hideContentTooltip()
        }
    }

    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _speed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"/>';

        let {course, lessons} = this.props,
            _courseTitle = course ? course.Name : '',
            _courseUrl = course ? course.URL : '',
            _total = lessons.object.length,
            _id = this.props.lesson ? this.props.lesson.Id : '';

        return (
            <div
                className={"lectures-menu js-lesson-menu _dark" + (this.props.isPlayer ? ' player-wrapper' : '') + (this.props.isLessonMenuOpened ? ' opened' : '')}
                id={this.props.id} style={this.props.isMain ? null : {display: 'none'}}>
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
                            onClick={::this._switchMenu}><span className='caption'>Лекция </span>
                        <span className="num"><span
                            className="current">{this.props.current}</span>{'/' + _total}</span></button>
                    <LessonsListWrapper {...this.props}/>
                </div>
                {
                    this.props.isPlayer ?
                        [
                            <button type="button" className="speed-button js-speed-trigger menu-button"
                                    onClick={::this._openRate}>
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                            </button>,
                            (
                                this.props.contentArray.length > 0 ?
                                    <button type="button" className="content-button js-contents-trigger menu-button"
                                            onClick={::this._openContent}>
                                        <svg width="18" height="12"
                                             dangerouslySetInnerHTML={{__html: _contents}}/>
                                    </button>
                                    :
                                    null
                            ),
                            <Link to={this.props.lesson.URL + "/transcript"}
                                  className={"link-to-transcript _reduced"}>
                                Транскрипт <br/>и
                                материалы
                            </Link>
                        ]
                        :
                        null
                }

            </div>
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
