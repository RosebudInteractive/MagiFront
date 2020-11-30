import React, {useEffect} from 'react';
import $ from "jquery";
import PropTypes from 'prop-types';
import "./switch-buttons.sass"

export const SVG = {
    TO_PLAYER: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#to-player"/>',
    TO_TRANSCRIPT: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#to-transcript"/>',
}

const TIME_DELTA = 6

export default function SwitchButtons(props){

    const {paragraphs, lesson, playerController} = props

    let currentTime = 0

    useEffect(() => {
        $(window).bind('resize scroll', _handleScroll)
        $(".transcript-block_wrapper").parent().bind('resize scroll', _handleScroll)

        return () => {
            $(window).unbind('resize scroll', _handleScroll)
            $(".transcript-block_wrapper").parent().unbind('resize scroll', _handleScroll)
        }
    }, [])

    const _getParagraphs = () => {
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

    const _getTextItem = (playerTime) => {
        let _timeStamps = _getParagraphs()

        return  _timeStamps ?
            _timeStamps.find((item) => {
                return ((playerTime * 1000) >= item.start) && (item.end > (playerTime * 1000))
            })
            :
            null
    }

    const _getTopMargin = () => {
        const _textBlockDiv = $(".transcript-block_wrapper")

        return _textBlockDiv.parent().offset().top
    }

    const _getReadLineTop = () => {
        return _getTopMargin()
    }

    const _handleScroll = () => {
        let paragraphs = _getParagraphs()

        if (!paragraphs) return;

        const _readLine = _getReadLineTop()
        let _currentParagraph = paragraphs.find((item) => {
            return item.top < _readLine && item.bottom > _readLine
        })

        if (!_currentParagraph) {
            currentTime = 0
            return;
        }

        let _height = _currentParagraph.lastLineTop - _currentParagraph.firstLineTop,
            _part = _readLine - _currentParagraph.firstLineTop,
            _percent = (_part <= 0) ? 0 : (_part / _height),
            _length = _currentParagraph.end - _currentParagraph.start

        currentTime = _currentParagraph.start + (_length * _percent)
    }

    const _toText = () => {
        const _textBlockDiv = $(".transcript-block_wrapper")

        let _currentTime

        if (!playerController.isPlayerMode()) {
            _currentTime = 0
        } else {
            _currentTime = playerController.state.currentTime
        }

        _textBlockDiv.parent().scrollTop(0)
        const _item = _getTextItem(_currentTime)

        if (_item) {
            const _timeLength = _item.end - _item.start,
                _timeDelta = _currentTime * 1000 - _item.start,
                _part = _timeDelta / _timeLength,
                _length = _item.lastLineTop - _item.firstLineTop,
                _delta = _item.lineHeight ? Math.floor(_length * _part / _item.lineHeight) * _item.lineHeight : _length * _part,
                _currentPos = _item.firstLineTop + _delta - _getTopMargin()

            _textBlockDiv.parent().scrollTop(_currentPos)
        }
    }

    const _toPlayer = () => {
        const _newValue = currentTime / 1000

        if (playerController.isPlayerMode()) {
            if (Math.abs(_newValue - playerController.state.currentTime.playerTime) <= TIME_DELTA) {
                playerController.requestPlay()
            } else {
                playerController.requestSetCurrentTime(_newValue)
            }
        } else {
            playerController.initPlayer({currentTime: _newValue})
        }
    }


    return <div className="switch-buttons__block">
        <button className="switch-button" type="button"
                onClick={_toText}>
            <svg width="24" height="24" dangerouslySetInnerHTML={{__html: SVG.TO_TRANSCRIPT}}/>
        </button>
        <button className="switch-button" type="button"
                onClick={_toPlayer}>
            <svg width="24" height="24" dangerouslySetInnerHTML={{__html: SVG.TO_PLAYER}}/>
        </button>
    </div>
}

SwitchButtons.propTypes = {
    playerController: PropTypes.object,
    paragraphs: PropTypes.array,
    lesson: PropTypes.object
}