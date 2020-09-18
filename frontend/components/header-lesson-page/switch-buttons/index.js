import React from 'react';
import {assetsSelector, episodesTimesSelector, paragraphsSelector, timeStampsSelector} from "ducks/transcript"
import $ from "jquery";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import {startSetCurrentTime, startPause, startPlay} from "actions/player-start-actions"
import {SVG} from "tools/svg-paths";
import PropTypes from 'prop-types';

const TIME_DELTA = 6

class SwitchButtons extends React.Component {

    static propTypes = {
        type: PropTypes.string,
        isPlayerMode: PropTypes.bool,
        lesson: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this._currentTime = 0

        this._scrollHandler = () => {
            this._handleScrollNewType()
        }

        $(window).bind('resize scroll', this._scrollHandler)
    }

    componentDidMount() {
        this._scrollHandler()
    }

    componentWillUnmount() {
        $(window).unbind('resize scroll', this._scrollHandler);
    }

    render() {
        return (this.props.type === "_dark") ?
            <button className="lectures-menu__fullscreen fullscreen-btn js-adjust" type="button"
                    onClick={::this._toText}>
                <svg width="24" height="24" dangerouslySetInnerHTML={{__html: SVG.TO_TRANSCRIPT}}/>
            </button>
            :
            <button className="lectures-menu__fullscreen fullscreen-btn js-adjust" type="button"
                    onClick={::this._toPlayer}>
                <svg width="24" height="24" dangerouslySetInnerHTML={{__html: SVG.TO_PLAYER}}/>
            </button>
    }

    _toPlayer() {
        if (!this.props.isPlayerMode) return

        const _newValue = this._currentTime / 1000

        if (Math.abs(_newValue - this.props.playerTime) <= TIME_DELTA) {
            this.props.actions.startPlay(this.props.lesson.Id)
        } else {
            this.props.actions.startSetCurrentTime(_newValue)
        }

        window.scrollTo(0, 0)
    }

    _toText() {
        if (!this.props.isPlayerMode) return

        this.props.actions.startPause()

        const _item = this._getNewTypeTextItem()

        if (_item) {
            const _timeLength = _item.end - _item.start,
                _timeDelta = this.props.playerTime * 1000 - _item.start,
                _part = _timeDelta / _timeLength,
                _length = _item.lastLineTop - _item.firstLineTop,
                _delta = _item.lineHeight ? Math.floor(_length * _part / _item.lineHeight) * _item.lineHeight : _length * _part,
                _currentPos = _item.firstLineTop + _delta - this._getTopMargin()

            window.scrollTo(0, _currentPos)
        }
    }

    _getNewTypeTextItem() {
        const {playerTime} = this.props

        let _timeStamps = this._getParagraphs()

        return  _timeStamps ?
            _timeStamps.find((item) => {
                return ((playerTime * 1000) >= item.start) && (item.end > (playerTime * 1000))
            })
            :
            null
    }

    _handleScrollNewType() {
        const {lessonPlayInfo,} = this.props

        if (!lessonPlayInfo) return

        let paragraphs = this._getParagraphs()

        if (!paragraphs) return;

        const _readLine = this._getReadLineTop()
        let _currentParagraph = paragraphs.find((item) => {
            return item.top < _readLine && item.bottom > _readLine
        })

        if (!_currentParagraph) {
            this._currentTime = 0
            return;
        }

        let _height = _currentParagraph.lastLineTop - _currentParagraph.firstLineTop,
            _part = _readLine - _currentParagraph.firstLineTop,
            _percent = (_part <= 0) ? 0 : (_part / _height),
            _length = _currentParagraph.end - _currentParagraph.start

        this._currentTime = _currentParagraph.start + (_length * _percent)
    }

    _getReadLineTop() {
        return $(window).scrollTop() + this._getTopMargin()
    }

    _getTopMargin() {
        const _menu = $(".js-lectures-menu")

        let _margin = 52

        if (_menu && _menu.length) {
            _margin = _menu.height()
        }

        return _margin
    }

    _getParagraphs() {
        const {paragraphs, lesson,} = this.props

        if (!(lesson && paragraphs && Array.isArray(paragraphs) && (paragraphs.length > 0))) return

        return  paragraphs
            .map((item, index) => {
                const _para = $(`#para-${index}`)

                if (_para && _para.length) {
                    const _lineHeight = +_para.css("line-height").replace("px", ""),
                        _blockTop = _para.offset().top,
                        _blockBottom = _blockTop + _para.height(),
                        _fontSize = +_para.css("font-size").replace("px", "")

                    return {
                        start: item.startTime,
                        end: item.finishTime,
                        top: _blockTop,
                        bottom: _blockBottom,
                        lineHeight: _lineHeight,
                        firstLineTop: _blockTop,
                        lastLineTop: _blockBottom - _lineHeight,
                        fontSize: _fontSize
                    }
                } else {
                    return null
                }

            })
            .filter(item => !!item)
            .map((item, index, array) => {
                item.top = index === 0 ? item.top : array[index - 1].bottom
                return item
            })
    }
}

const mapStateToProps = (state) => {
    return {
        episodesTimes: episodesTimesSelector(state),
        timeStamps: timeStampsSelector(state),
        playerTime: state.player.currentTime,
        lessonPlayInfo: assetsSelector(state),
        paragraphs: paragraphsSelector(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions : bindActionCreators({startSetCurrentTime, startPause, startPlay}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SwitchButtons)