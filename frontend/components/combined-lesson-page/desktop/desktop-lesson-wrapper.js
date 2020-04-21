import React from 'react';
import PropTypes from 'prop-types';

import Menu from '../../header-lesson-page/';
import LandscapePlayerFrame from './landscape-player-frame'
import PortraitPlayerFrame from './portrait-player-frame'
import Cover from '../cover';

import $ from 'jquery'
import {isLandscape} from "./tools";

function _getHeight() {
    return $(window).innerHeight();
}

function _getWidth() {
    return $(window).innerWidth();
}

export default class Wrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        courseUrl: PropTypes.string,
        isMain: PropTypes.bool,
        active: PropTypes.string,
        isPlayer: PropTypes.bool,
        singleLesson: PropTypes.bool,
        isPaidCourse: PropTypes.bool,
        needLockLessonAsPaid: PropTypes.bool,
    };

    static defaultProps = {
        isMain: true,
        isPlayer: false
    };

    constructor(props) {
        super(props)

        this.state = {
            isLandscape: isLandscape()
        }


        this._resizeHandler = () => {
            let _playerDiv = $('.lesson-player')

            if (isLandscape()) {
                if (!this.state.isLandscape) {
                    this.setState({isLandscape: true})
                }
                _playerDiv.removeClass('added')
                this._height = _getHeight();
                this._width = _getWidth();
                $('.lesson-wrapper').css('height', this._height).css('width', this._width);
            } else {
                if (this.state.isLandscape) {
                    this.setState({isLandscape: false})
                }
                _playerDiv.addClass('added')
            }

        }
    }

    componentDidMount() {
        $(window).on('resize', this._resizeHandler)
        this._resizeHandler()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this._height !== _getHeight()) {
            this._resizeHandler()
        }

        if (this.state.isLandscape !== prevState.isLandscape) {
            setTimeout(() => {$(window).trigger('resize')}, 0);
        }
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    _getLandscapeLayout() {
        let {lesson, isPlayer, singleLesson} = this.props,
            _divId = isPlayer ? 'player-' + lesson.Id : 'lesson-' + lesson.Id,
            _subwrapperClassName = 'lesson-sub-wrapper' + (isPlayer ? '' : ' cover')

        const _coverStyle = {
            backgroundImage: "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")",
        }

        let _sectionClassName = 'lesson-wrapper js-player desktop' + (singleLesson ? ' _single' : '')

        return (
            <div className={_sectionClassName}>
                <div className='lecture-wrapper' id={_divId} style={_coverStyle}>
                    <Menu {...this.props} current={lesson.Number}
                          id={'lesson-menu-' + lesson.Id} extClass={'landscape'}/>
                    <div className={_subwrapperClassName}>
                        <LandscapePlayerFrame {...this.props}
                                              visible={isPlayer}/>
                        <Cover {...this.props}
                                     courseUrl={this.props.courseUrl}
                                     visible={!isPlayer}
                        />
                    </div>
                </div>
            </div>
        )
    }

    _getPortraitLayout() {
        let {lesson, isPlayer, singleLesson} = this.props,
            _divId = isPlayer ? 'player-' + lesson.Id : 'lesson-' + lesson.Id,
            _subwrapperClassName = 'lesson-sub-wrapper' + (isPlayer ? '' : ' cover')

        const _coverStyle = {}

        if (!isPlayer) {
            _coverStyle.backgroundImage = "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + lesson.Cover + ")";
        }

        let _sectionClassName = 'lecture-wrapper lesson-player js-player desktop' + (singleLesson ? ' _single' : '')

        return (
            <section className={_sectionClassName} id={_divId} style={_coverStyle}>
                <div className={_subwrapperClassName}>
                    <PortraitPlayerFrame {...this.props}
                                         visible={this.props.isPlayer}/>
                    <Cover {...this.props}
                                 lesson={this.props.lesson}
                                 isMain={this.props.isMain}
                                 courseUrl={this.props.courseUrl}
                                 visible={!this.props.isPlayer}
                                 isPaidCourse={this.props.isPaidCourse}
                    />
                </div>
            </section>
        )
    }

    render() {
        return isLandscape() ? this._getLandscapeLayout() : this._getPortraitLayout()
    }
}