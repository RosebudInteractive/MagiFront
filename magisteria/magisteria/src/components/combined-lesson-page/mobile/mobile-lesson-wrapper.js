import React from 'react';
import PropTypes from 'prop-types';

import PlayerFrame from './player-frame'
import Cover from '../cover';

import $ from 'jquery'
import {isLandscape} from "./tools";

let _landscapeHeight = 0;

function _getLandscapeHeight() {
    if (_landscapeHeight < $(window).outerHeight()) {
        _landscapeHeight = $(window).outerHeight()
    }
    return _landscapeHeight
}

export default class Wrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        courseUrl: PropTypes.string,
        isMain: PropTypes.bool,
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

        this.state = {wrapperHeight: null};

        this._resizeHandler = () => {
            let _control = $('.js-player');

            if (isLandscape()) {
                _control.removeClass('added')

                this.setState({
                    wrapperHeight: _getLandscapeHeight() + 'px'
                })
            } else {
                _control.addClass('added')
                this.setState({
                    wrapperHeight: null
                })
            }
        }

        $(window).resize(::this._resizeHandler)
    }

    componentDidMount() {
        this._resizeHandler();

        if (isLandscape()) {
            this.setState({
                wrapperHeight: _getLandscapeHeight() + 'px'
            })
        }
    }

    componentDidUpdate(prev) {
        if (prev.isPlayer !== this.props.isPlayer) {
            this._resizeHandler();
        }
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler);
    }

    render() {
        let {isPlayer, singleLesson} = this.props,
            _subwrapperClassName = 'lesson-sub-wrapper' + (isPlayer ? '' : ' cover')

        const _coverStyle = {}

        if (!isPlayer) {
            _coverStyle.backgroundImage = "radial-gradient(rgba(28, 27, 23, .5) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")";
        }

        if (this.state.wrapperHeight) {
            _coverStyle.height = this.state.wrapperHeight;
        }

        let _sectionClassName = "lecture-wrapper " + (isPlayer ? "lesson-player " : "") + "js-player mobile" + (singleLesson ? ' _single' : '')

        return (
            <section
                className={_sectionClassName} style={_coverStyle}
                id={isPlayer ? 'player-' + this.props.lesson.Id : 'lesson-' + this.props.lesson.Id}>
                <div className={_subwrapperClassName}>
                    <PlayerFrame {...this.props}
                                 visible={isPlayer}/>
                    <Cover {...this.props}
                                 lesson={this.props.lesson}
                                 isMain={this.props.isMain}
                                 courseUrl={this.props.courseUrl}
                                 visible={!this.props.isPlayer}
                                 isPaidCourse={this.props.isPaidCourse}
                                 needLockLessonAsPaid={this.props.needLockLessonAsPaid}
                    />
                </div>
            </section>
        )
    }
}