import React from 'react';
import PropTypes from 'prop-types';

import Menu from '../menu';
import LandscapePlayerFrame from './landscape-player-frame'
import PortraitPlayerFrame from './portrait-player-frame'
import LessonFrame from '../lesson-frame';

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
    };

    static defaultProps = {
        isMain: true,
        isPlayer: false
    };

    constructor(props) {
        super(props)


        this._resizeHandler = () => {
            let _playerDiv = $('.lesson-player')

            if (isLandscape()) {
                _playerDiv.removeClass('added')
                this._height = _getHeight();
                this._width = _getWidth();
                $('.lesson-wrapper').css('height', this._height).css('width', this._width);
            } else {
                _playerDiv.addClass('added')
            }

        }
    }

    componentDidMount() {
        $(window).on('resize', this._resizeHandler)
        this._resizeHandler()
    }

    componentDidUpdate() {
        if (this._height !== _getHeight()) {
            this._resizeHandler()
        }
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    _getLandscapeLayout() {
        let {lesson, isPlayer} = this.props,
            _divId = isPlayer ? 'player-' + lesson.Id : 'lesson-' + lesson.Id

        const _coverStyle = {
            backgroundImage: "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")",
        }

        return (
            <div className='lesson-wrapper js-player desktop'>
                <div className='lecture-wrapper' id={_divId} style={_coverStyle}>
                    <Menu {...this.props} current={lesson.Number}
                          id={'lesson-menu-' + lesson.Id} extClass={'landscape'}/>
                    <div className={'lesson-sub-wrapper'}>
                        <LandscapePlayerFrame {...this.props}
                                              visible={isPlayer}/>
                        <LessonFrame {...this.props}
                                     courseUrl={this.props.courseUrl}
                                     visible={!isPlayer}
                        />
                    </div>
                </div>
            </div>
        )
    }

    _getPortraitLayout() {
        let {lesson, isPlayer} = this.props,
            _divId = isPlayer ? 'player-' + lesson.Id : 'lesson-' + lesson.Id

        const _coverStyle = {}

        if (!isPlayer) {
            _coverStyle.backgroundImage = "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + lesson.Cover + ")";
        }

        return (
            <section className='lecture-wrapper lesson-player js-player desktop' id={_divId} style={_coverStyle}>
                <div className='lesson-sub-wrapper'>
                    <PortraitPlayerFrame {...this.props}
                                         visible={this.props.isPlayer}/>
                    <LessonFrame {...this.props}
                                 lesson={this.props.lesson}
                                 isMain={this.props.isMain}
                                 courseUrl={this.props.courseUrl}
                                 visible={!this.props.isPlayer}
                    />
                </div>
            </section>
        )
    }

    render() {
        return isLandscape() ? this._getLandscapeLayout() : this._getPortraitLayout()
    }
}