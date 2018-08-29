import React from 'react';
import PropTypes from 'prop-types';

import PlayerFrame from './frame'
import LessonFrame from './lesson-frame';

import $ from 'jquery'
import Platform from 'platform';

const _isSafariOnIPad = (Platform.os.family === "iOS") && (Platform.product === "iPad") && (Platform.name === "Safari"),
    _isAndroid = Platform.os.family === "Android";

function _getHeight() {
    return (_isSafariOnIPad || _isAndroid) ? $(window).outerHeight() : $(window).innerHeight();
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
            this._height = _getHeight();
            this._width = _getWidth();
            $('.lesson-wrapper').css('height', this._height).css('width', this._width);
        }
    }

    componentDidMount() {
        // $('body').css('position', 'fixed');
        // $(window).on('resize', this._resizeHandler)
        // this._resizeHandler()
    }

    componentDidUpdate() {
        // if (this._height !== _getHeight()) {
        //     this._resizeHandler()
        // }
    }

    componentWillUnmount() {
        // $(window).unbind('resize', this._resizeHandler)
        // $('body').css('position', '');
    }

    render() {
        let {isPlayer} = this.props;
        const _coverStyle = {
            backgroundImage: "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")",
        }

        return (
            <section className='lecture-wrapper lesson-player js-player added'
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