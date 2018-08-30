import React from 'react';
import PropTypes from 'prop-types';

import PlayerFrame from './player-frame'
import LessonFrame from '../lesson-frame';

import $ from 'jquery'
// import 'jquery.cookeis'
// import Platform from 'platform';

// const _isSafariOnIPad = (Platform.os.family === "iOS") && (Platform.product === "iPad") && (Platform.name === "Safari"),
//     _isAndroid = Platform.os.family === "Android";

let _landscapeHeight = 0;

function _isLandscape() {
    return $(window).innerHeight() < $(window).innerWidth();
}

function _getHeight() {
    if (_isLandscape()) {
        if (_landscapeHeight < $(window).outerHeight()) {
            _landscapeHeight = $(window).outerHeight()
            // $.cookie('landscapeHeight', _landscapeHeight);
        }

        return _landscapeHeight
    } else {
        let _outer = $(window).outerHeight(),
            _inner = $(window).innerHeight();

        return (_outer > _inner) ? _outer : _inner;
    }
}

function _getWidth() {
    return $(window).innerWidth();
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

        this._resizeHandler = () => {
            let _width = _getWidth(),
                _height = _getHeight(),
                _control = $('.lesson-player');

            const _rate = 0.71

            if (_control.length > 0) {
                if ((_width * _rate) <= _height) {
                    _control.addClass('added')
                } else {
                    _control.removeClass('added')
                }
            }
        }

        $(window).resize(this._resizeHandler)
    }

    componentDidMount() {
        this._resizeHandler();
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler);
    }

    render() {
        let {isPlayer} = this.props;
        const _coverStyle = {
            backgroundImage: "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")",
        }

        return (
            <section className='lecture-wrapper lesson-player js-player mobile'
                 id={isPlayer ? 'player-' + this.props.lesson.Id : 'lesson-' + this.props.lesson.Id}
                 style={isPlayer ? null : _coverStyle}>
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