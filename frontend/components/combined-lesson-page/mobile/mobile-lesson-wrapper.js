import React from 'react';
import PropTypes from 'prop-types';

import PlayerFrame from './player-frame'
import LessonFrame from '../lesson-frame';

import $ from 'jquery'

let _landscapeHeight = 0;

const K2 = 1;

function _isLandscape() {
    return $(window).outerHeight() * K2 < $(window).outerWidth();
}

function _getLandscapeHeight() {
    if (_landscapeHeight < $(window).outerHeight()) {
        _landscapeHeight = $(window).outerHeight()
        // $.cookie('landscapeHeight', _landscapeHeight);
    }
    return _landscapeHeight
}

export default class Wrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        courseUrl: PropTypes.string,
        isMain: PropTypes.bool,
        isPlayer: PropTypes.bool,
    };

    static defaultProps = {
        isMain: true,
        isPlayer: false
    };

    constructor(props) {
        super(props)

        this.state = {wrapperHeight: null};

        this._resizeHandler = () => {
            let _control = $('.lesson-player');

            if (!this.props.isMobileControls) {
                _control.addClass('added')
            } else {
                if (_isLandscape()) {
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
        }

        $(window).resize(this._resizeHandler)
    }

    componentDidMount() {
        this._resizeHandler();

        if (this.props.isMobileControls && _isLandscape()) {
            this.setState({
                wrapperHeight: _getLandscapeHeight() + 'px'
            })
        }
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler);
    }

    render() {
        let {isPlayer} = this.props;
        const _coverStyle = {}

        if (!isPlayer)  {
            _coverStyle.backgroundImage ="radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")";
        }

        if (this.state.wrapperHeight) {
            _coverStyle.height = this.state.wrapperHeight;
        }

        return (
            <section className='lecture-wrapper lesson-player js-player mobile'
                     id={isPlayer ? 'player-' + this.props.lesson.Id : 'lesson-' + this.props.lesson.Id}
                     style={_coverStyle}>
                <div className={'lesson-sub-wrapper'}>
                    <PlayerFrame {...this.props}
                                 visible={isPlayer}/>
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
}