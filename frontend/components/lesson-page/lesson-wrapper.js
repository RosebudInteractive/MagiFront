import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import Menu from './lesson-menu';
import PlayerFrame from '../player/frame'
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
            this._height = _getHeight();
            this._width = _getWidth();
            $('.lesson-wrapper').css('height', this._height).css('width', this._width);
        }
    }

    componentDidMount() {
        $('body').css('position', 'fixed');
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
        $('body').css('position', '');
    }

    render() {
        let {isPlayer} = this.props;
        const _coverStyle = {
            backgroundImage: "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")",
        }

        return (
            <div className='lecture-wrapper'
                 id={this.props.isPlayer ? 'player-' + this.props.lesson.Id : 'lesson-' + this.props.lesson.Id}
                 style={_coverStyle}>
                <Menu {...this.props} current={this.props.lesson.Number} id={'lesson-menu-' + this.props.lesson.Id}/>
                <div className={'lesson-sub-wrapper'}>
                    {
                        (isPlayer && !this.props.paused) ?
                            <div className='player-wrapper'>
                                <Link to={this.props.lesson.URL + "/transcript"}
                                      className={"link-to-transcript _reduced"}>
                                    Транскрипт <br/>и
                                    материалы
                                </Link>
                            </div>
                            :
                            <div>
                                <Link to={this.props.lesson.URL + "/transcript"}
                                      className={"link-to-transcript"}>
                                    Транскрипт <br/>и
                                    материалы
                                </Link>
                            </div>
                    }
                    <PlayerFrame {...this.props}
                                 visible={this.props.isPlayer}/>
                    <LessonFrame {...this.props}
                                 lesson={this.props.lesson}
                                 isMain={this.props.isMain}
                                 courseUrl={this.props.courseUrl}
                                 visible={!this.props.isPlayer}
                    />
                </div>
            </div>
        )
    }
}